import Database from "better-sqlite3";
import { Logger } from "./logger";

const logger = new Logger();

/**
 * Миграции базы данных для Telegram авторизации
 * Создает таблицы users и sessions согласно ТЗ
 */

export function runMigrations(dbPath: string): void {
  const db = new Database(dbPath);
  // SQLite PRAGMAs for performance and reliability
  try {
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("busy_timeout = 5000");
  } catch (e) {
    // ignore pragma errors but continue
  }

  try {
    logger.info("Запуск миграций базы данных...");

    // Таблица users согласно разделу 3.1 ТЗ
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id BIGINT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        photo_url TEXT,
        auth_date INTEGER NOT NULL,
        agreed_to_terms BOOLEAN DEFAULT 0,
        agreed_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        last_login INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Таблица sessions согласно разделу 3.2 ТЗ
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Индексы для оптимизации
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_telegram_id ON users(telegram_id);
      CREATE INDEX IF NOT EXISTS idx_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_user_id ON sessions(user_id);
    `);

    // Таблицы биллинга
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_balance (
        user_id INTEGER PRIMARY KEY,
        balance_rub REAL DEFAULT 0.0,
        currency TEXT DEFAULT 'RUB',
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('deposit', 'charge', 'refund')),
        service_name TEXT,
        description TEXT,
        admin_id INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS service_pricing (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_name TEXT UNIQUE NOT NULL,
        unit_type TEXT NOT NULL,
        price_per_unit REAL NOT NULL,
        currency TEXT DEFAULT 'RUB',
        is_active BOOLEAN DEFAULT 1,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Индексы для биллинга
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_balance_user ON user_balance(user_id);
      CREATE INDEX IF NOT EXISTS idx_trans_user ON transactions(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_trans_type ON transactions(type);
    `);

    // Вставка базовых тарифов
    db.exec(`
      INSERT OR IGNORE INTO service_pricing (service_name, unit_type, price_per_unit) VALUES
        ('ai_request', 'request', 5.0),
        ('ozon_daily', 'day', 50.0),
        ('ozon_automation', 'task', 10.0);
    `);

    logger.info("Миграции базы данных успешно выполнены");
  } catch (error) {
    logger.error("Ошибка при выполнении миграций:", error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * Проверка существования таблиц
 */
export function checkTablesExist(dbPath: string): boolean {
  const db = new Database(dbPath);

  try {
    const usersTable = db
      .prepare(
        `
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='users'
    `
      )
      .get();

    const sessionsTable = db
      .prepare(
        `
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='sessions'
    `
      )
      .get();

    return !!(usersTable && sessionsTable);
  } catch (error) {
    logger.error("Ошибка при проверке таблиц:", error);
    return false;
  } finally {
    db.close();
  }
}
