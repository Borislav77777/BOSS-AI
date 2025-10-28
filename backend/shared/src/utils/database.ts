import Database from 'better-sqlite3';
import path from 'path';
import { logger } from './logger';

// Универсальный класс для работы с базой данных
export class DatabaseManager {
    private static instance: DatabaseManager;
    private db: Database.Database | null = null;
    private dbPath: string;

    private constructor() {
        this.dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'boss_ai.db');
    }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public async initialize(): Promise<void> {
        try {
            // Создаем директорию для базы данных если её нет
            const dbDir = path.dirname(this.dbPath);
            const fs = require('fs');
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Подключаемся к базе данных
            this.db = new Database(this.dbPath);
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('foreign_keys = ON');

            logger.info('База данных инициализирована', { path: this.dbPath });

            // Выполняем миграции
            await this.runMigrations();

        } catch (error) {
            logger.error('Ошибка инициализации базы данных', { error: error.message });
            throw error;
        }
    }

    private async runMigrations(): Promise<void> {
        if (!this.db) throw new Error('База данных не инициализирована');

        try {
            // Создаем таблицы пользователей
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    telegram_id INTEGER UNIQUE NOT NULL,
                    username TEXT,
                    first_name TEXT,
                    last_name TEXT,
                    photo_url TEXT,
                    auth_date INTEGER NOT NULL,
                    agreed_to_terms BOOLEAN DEFAULT FALSE,
                    agreed_at TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    last_login TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Создаем таблицы сессий
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    token TEXT UNIQUE NOT NULL,
                    expires_at TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `);

            // Создаем таблицы Ozon магазинов
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS ozon_stores (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    api_key TEXT NOT NULL,
                    client_id TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `);

            // Создаем таблицы AI сервисов
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS ai_services (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    config TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `);

            // Создаем таблицы логов
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS service_logs (
                    id TEXT PRIMARY KEY,
                    service TEXT NOT NULL,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    metadata TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Создаем индексы
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id)`);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)`);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token)`);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_ozon_stores_user_id ON ozon_stores (user_id)`);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_ai_services_user_id ON ai_services (user_id)`);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_service_logs_service ON service_logs (service)`);
            this.db.exec(`CREATE INDEX IF NOT EXISTS idx_service_logs_created_at ON service_logs (created_at)`);

            logger.info('Миграции базы данных выполнены успешно');

        } catch (error) {
            logger.error('Ошибка выполнения миграций', { error: error.message });
            throw error;
        }
    }

    public getDatabase(): Database.Database {
        if (!this.db) {
            throw new Error('База данных не инициализирована');
        }
        return this.db;
    }

    public async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
            logger.info('Соединение с базой данных закрыто');
        }
    }

    // Универсальные методы для работы с данными
    public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        if (!this.db) throw new Error('База данных не инициализирована');

        try {
            const stmt = this.db.prepare(sql);
            return stmt.all(...params) as T[];
        } catch (error) {
            logger.error('Ошибка выполнения запроса', { sql, params, error: error.message });
            throw error;
        }
    }

    public async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
        if (!this.db) throw new Error('База данных не инициализирована');

        try {
            const stmt = this.db.prepare(sql);
            return stmt.get(...params) as T | null;
        } catch (error) {
            logger.error('Ошибка выполнения запроса', { sql, params, error: error.message });
            throw error;
        }
    }

    public async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number }> {
        if (!this.db) throw new Error('База данных не инициализирована');

        try {
            const stmt = this.db.prepare(sql);
            const result = stmt.run(...params);
            return {
                changes: result.changes,
                lastInsertRowid: result.lastInsertRowid
            };
        } catch (error) {
            logger.error('Ошибка выполнения запроса', { sql, params, error: error.message });
            throw error;
        }
    }

    public async transaction<T>(callback: () => T): Promise<T> {
        if (!this.db) throw new Error('База данных не инициализирована');

        const transaction = this.db.transaction(callback);
        return transaction();
    }
}

// Экспортируем singleton
export const dbManager = DatabaseManager.getInstance();
export default dbManager;
