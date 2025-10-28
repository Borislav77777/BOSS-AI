import Database from "better-sqlite3";
import { Logger } from "../utils/logger";

const logger = new Logger();

/**
 * User Service - CRUD операции с пользователями
 * Согласно этапу 3 плана
 */

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  auth_date: number;
  agreed_to_terms: boolean;
  agreed_at?: number;
  created_at: number;
  last_login: number;
}

export class UserService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    try {
      this.db.pragma("journal_mode = WAL");
      this.db.pragma("synchronous = NORMAL");
      this.db.pragma("busy_timeout = 5000");
    } catch (e) {
      // ignore pragma errors
    }
  }

  /**
   * Поиск пользователя по Telegram ID
   * @param telegramId - Telegram ID пользователя
   * @returns Пользователь или null
   */
  findByTelegramId(telegramId: number): User | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users WHERE telegram_id = ?
      `);

      const user = stmt.get(telegramId) as User | undefined;

      if (user) {
        logger.debug(
          `Пользователь найден: ${user.username || user.first_name} (ID: ${
            user.id
          })`
        );
      }

      return user || null;
    } catch (error) {
      logger.error("Ошибка поиска пользователя по Telegram ID:", error);
      return null;
    }
  }

  /**
   * Создание нового пользователя
   * @param telegramData - Данные от Telegram Login Widget
   * @returns Созданный пользователь
   */
  createUser(telegramData: TelegramAuthData): User {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (
          telegram_id, username, first_name, last_name,
          photo_url, auth_date, agreed_to_terms, created_at, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, 0, strftime('%s', 'now'), strftime('%s', 'now'))
      `);

      const result = stmt.run(
        telegramData.id,
        telegramData.username || null,
        telegramData.first_name,
        telegramData.last_name || null,
        telegramData.photo_url || null,
        telegramData.auth_date
      );

      const userId = result.lastInsertRowid as number;

      logger.info(
        `Создан новый пользователь: ${
          telegramData.username || telegramData.first_name
        } (ID: ${userId})`
      );

      return this.getUserById(userId)!;
    } catch (error) {
      logger.error("Ошибка создания пользователя:", error);
      throw new Error("Не удалось создать пользователя");
    }
  }

  /**
   * Обновление согласия пользователя
   * @param telegramId - Telegram ID пользователя
   * @param agreed - Согласие с условиями
   * @returns true если обновление успешно
   */
  updateAgreement(telegramId: number, agreed: boolean): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE users
        SET agreed_to_terms = ?, agreed_at = strftime('%s', 'now')
        WHERE telegram_id = ?
      `);

      const result = stmt.run(agreed ? 1 : 0, telegramId);

      if (result.changes > 0) {
        logger.info(`Согласие пользователя ${telegramId} обновлено: ${agreed}`);
        return true;
      }

      logger.warn(
        `Пользователь с Telegram ID ${telegramId} не найден для обновления согласия`
      );
      return false;
    } catch (error) {
      logger.error("Ошибка обновления согласия:", error);
      return false;
    }
  }

  /**
   * Обновление времени последнего входа
   * @param userId - ID пользователя в БД
   * @returns true если обновление успешно
   */
  updateLastLogin(userId: number): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE users
        SET last_login = strftime('%s', 'now')
        WHERE id = ?
      `);

      const result = stmt.run(userId);

      if (result.changes > 0) {
        logger.debug(`Время входа пользователя ${userId} обновлено`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Ошибка обновления времени входа:", error);
      return false;
    }
  }

  /**
   * Получение пользователя по ID
   * @param userId - ID пользователя в БД
   * @returns Пользователь или null
   */
  getUserById(userId: number): User | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users WHERE id = ?
      `);

      const user = stmt.get(userId) as User | undefined;
      return user || null;
    } catch (error) {
      logger.error("Ошибка получения пользователя по ID:", error);
      return null;
    }
  }

  /**
   * Обновление данных пользователя
   * @param telegramId - Telegram ID пользователя
   * @param telegramData - Новые данные от Telegram
   * @returns true если обновление успешно
   */
  updateUserData(telegramId: number, telegramData: TelegramAuthData): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE users
        SET username = ?, first_name = ?, last_name = ?,
            photo_url = ?, auth_date = ?, last_login = strftime('%s', 'now')
        WHERE telegram_id = ?
      `);

      const result = stmt.run(
        telegramData.username || null,
        telegramData.first_name,
        telegramData.last_name || null,
        telegramData.photo_url || null,
        telegramData.auth_date,
        telegramId
      );

      if (result.changes > 0) {
        logger.info(`Данные пользователя ${telegramId} обновлены`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Ошибка обновления данных пользователя:", error);
      return false;
    }
  }

  /**
   * Закрытие соединения с БД
   */
  close(): void {
    this.db.close();
  }
}
