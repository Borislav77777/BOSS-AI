import Database from "better-sqlite3";
import { logger } from "../utils/logger";
import { BILLING_CONFIG, convertRubToBT, getBalanceInBothCurrencies } from "../config/billing.config";

export class BillingService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    // SQLite PRAGMAs for performance
    try {
      this.db.pragma("journal_mode = WAL");
      this.db.pragma("synchronous = NORMAL");
      this.db.pragma("busy_timeout = 5000");
    } catch (e) {
      // ignore pragma errors
    }
  }

  /**
   * Получить баланс пользователя с поддержкой BT токенов
   */
  getBalance(userId: number): { balance: number; balance_bt: number; currency: string; currency_bt: string } {
    try {
      const row = this.db
        .prepare(
          "SELECT balance_rub, currency FROM user_balance WHERE user_id = ?"
        )
        .get(userId);
      if (!row) {
        // Создаем запись баланса для нового пользователя
        this.db
          .prepare(
            "INSERT INTO user_balance (user_id, balance_rub) VALUES (?, 0.0)"
          )
          .run(userId);
        return { 
          balance: 0, 
          balance_bt: 0, 
          currency: "RUB", 
          currency_bt: "BT" 
        };
      }
      
      const rubBalance = (row as any).balance_rub || 0;
      const btBalance = convertRubToBT(rubBalance);
      
      return { 
        balance: rubBalance, 
        balance_bt: btBalance,
        currency: "RUB", 
        currency_bt: "BT" 
      };
    } catch (error) {
      logger.error("Ошибка получения баланса", error);
      return { balance: 0, balance_bt: 0, currency: "RUB", currency_bt: "BT" };
    }
  }

  /**
   * Пополнение баланса (admin) - АТОМАРНАЯ ОПЕРАЦИЯ
   */
  deposit(
    userId: number,
    amount: number,
    adminId: number,
    description: string
  ): boolean {
    try {
      // Используем транзакцию SQLite для атомарности
      const transaction = this.db.transaction(() => {
        // Обновляем баланс
        const updateStmt = this.db.prepare(`
          UPDATE user_balance SET balance_rub = balance_rub + ?, updated_at = strftime('%s', 'now')
          WHERE user_id = ?
        `);
        updateStmt.run(amount, userId);

        // Записываем транзакцию
        const transactionStmt = this.db.prepare(`
          INSERT INTO transactions (user_id, amount, type, description, admin_id)
          VALUES (?, ?, 'deposit', ?, ?)
        `);
        transactionStmt.run(userId, amount, description, adminId);

        return true;
      });

      const result = transaction();
      logger.info(
        `Пополнение баланса: user=${userId}, amount=${amount}, admin=${adminId}`
      );
      return result;
    } catch (error) {
      logger.error("Ошибка пополнения баланса", error);
      return false;
    }
  }

  /**
   * Списание с баланса - АТОМАРНАЯ ОПЕРАЦИЯ с защитой от race conditions
   */
  charge(
    userId: number,
    amount: number,
    serviceName: string,
    description: string
  ): boolean {
    try {
      // Используем транзакцию SQLite для атомарности
      const transaction = this.db.transaction(() => {
        // Атомарное обновление с проверкой баланса в SQL
        const result = this.db.prepare(`
          UPDATE user_balance 
          SET balance_rub = balance_rub - ?, 
              updated_at = strftime('%s', 'now')
          WHERE user_id = ? 
            AND balance_rub >= ?  -- ❗ Проверка в SQL!
        `).run(amount, userId, amount);
        
        // Если баланса недостаточно - откат
        if (result.changes === 0) {
          throw new Error('Insufficient funds');
        }
        
        // Записываем транзакцию
        this.db.prepare(`
          INSERT INTO transactions (user_id, amount, type, service_name, description)
          VALUES (?, ?, 'charge', ?, ?)
        `).run(userId, -amount, serviceName, description);
        
        return true;
      });

      const result = transaction();
      logger.info(
        `Списание с баланса: user=${userId}, amount=${amount}, service=${serviceName}`
      );
      return result;
    } catch (error) {
      logger.warn(
        `Недостаточно средств или ошибка списания: user=${userId}, amount=${amount}, error=${(error as Error).message}`
      );
      return false;
    }
  }

  /**
   * История транзакций пользователя
   */
  getTransactions(userId: number, limit = 50): any[] {
    try {
      return this.db
        .prepare(
          `
        SELECT * FROM transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `
        )
        .all(userId, limit);
    } catch (error) {
      logger.error("Ошибка получения транзакций", error);
      return [];
    }
  }

  /**
   * Получить тарифы сервисов
   */
  getServicePricing(): any[] {
    try {
      return this.db
        .prepare("SELECT * FROM service_pricing WHERE is_active = 1")
        .all();
    } catch (error) {
      logger.error("Ошибка получения тарифов", error);
      return [];
    }
  }

  /**
   * Получить всех пользователей с балансами (admin)
   */
  getAllUsersWithBalance(): any[] {
    try {
      return this.db
        .prepare(
          `
        SELECT u.id, u.telegram_id, u.username, u.first_name, u.last_name,
               COALESCE(ub.balance_rub, 0) as balance_rub, ub.updated_at
        FROM users u
        LEFT JOIN user_balance ub ON u.id = ub.user_id
        ORDER BY u.created_at DESC
      `
        )
        .all();
    } catch (error) {
      logger.error("Ошибка получения пользователей с балансами", error);
      return [];
    }
  }

  /**
   * Закрыть соединение с БД
   */
  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
