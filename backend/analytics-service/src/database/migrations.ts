import Database from 'better-sqlite3';
import { Logger } from '../utils/logger';

const logger = new Logger();

/**
 * Миграции базы данных для модуля аналитики
 * Создает все необходимые таблицы для сбора и хранения аналитических данных
 */

export function runAnalyticsMigrations(dbPath: string): void {
  const db = new Database(dbPath);

  // SQLite PRAGMAs for performance and reliability
  try {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('busy_timeout = 5000');
  } catch (e) {
    logger.warn('Failed to set SQLite PRAGMAs', { error: e });
  }

  try {
    logger.info('Запуск миграций аналитики...');

    // 1. Таблица событий пользователей (все действия)
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,           -- 'click', 'navigation', 'api_call', 'service_use'
        event_category TEXT NOT NULL,       -- 'ui', 'api', 'service', 'billing'
        event_action TEXT NOT NULL,         -- конкретное действие
        event_label TEXT,                   -- дополнительная метка
        event_value REAL,                   -- числовое значение (время, стоимость)
        service_name TEXT,                  -- какой сервис использован
        metadata TEXT,                      -- JSON с доп. данными
        session_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 2. Таблица сессий пользователей
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        duration_seconds INTEGER,
        page_views INTEGER DEFAULT 0,
        events_count INTEGER DEFAULT 0,
        services_used TEXT,                 -- JSON массив использованных сервисов
        ip_address TEXT,
        user_agent TEXT,
        device_type TEXT,                   -- 'desktop', 'mobile', 'tablet'
        browser TEXT,
        os TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 3. Таблица метрик производительности
    db.exec(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        metric_type TEXT NOT NULL,          -- 'page_load', 'api_response', 'render_time'
        metric_name TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT,                          -- 'ms', 'seconds', 'bytes'
        page_url TEXT,
        service_name TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // 4. Таблица использования сервисов
    db.exec(`
      CREATE TABLE IF NOT EXISTS service_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        action TEXT NOT NULL,
        success BOOLEAN DEFAULT 1,
        duration_ms INTEGER,
        cost_bt REAL DEFAULT 0,
        cost_rub REAL DEFAULT 0,
        request_data TEXT,                  -- JSON
        response_data TEXT,                 -- JSON
        error_message TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 5. Таблица агрегированных метрик (для быстрого доступа)
    db.exec(`
      CREATE TABLE IF NOT EXISTS aggregated_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_date TEXT NOT NULL,          -- YYYY-MM-DD
        metric_hour INTEGER,                -- 0-23 (NULL для дневных метрик)
        user_id TEXT,                       -- NULL для общих метрик
        service_name TEXT,                  -- NULL для общих метрик
        total_events INTEGER DEFAULT 0,
        total_sessions INTEGER DEFAULT 0,
        total_users INTEGER DEFAULT 0,
        total_api_calls INTEGER DEFAULT 0,
        total_errors INTEGER DEFAULT 0,
        total_revenue_bt REAL DEFAULT 0,
        avg_session_duration REAL DEFAULT 0,
        avg_response_time REAL DEFAULT 0,
        metadata TEXT,                      -- JSON с доп. метриками
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // 6. Таблица речевой аналитики (для интеграции с 152 ФЗ)
    db.exec(`
      CREATE TABLE IF NOT EXISTS speech_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        audio_file_path TEXT NOT NULL,
        audio_duration_seconds INTEGER,
        transcription TEXT,
        sentiment TEXT,                     -- 'positive', 'neutral', 'negative'
        keywords TEXT,                      -- JSON массив ключевых слов
        compliance_check BOOLEAN DEFAULT 0, -- проверка на соответствие 152 ФЗ
        compliance_issues TEXT,             -- JSON массив проблем
        processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
        error_message TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        processed_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Создание индексов для оптимизации запросов
    logger.info('Создание индексов для оптимизации...');

    // Индексы для user_events
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_events_user ON user_events(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_events_type ON user_events(event_type, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_events_service ON user_events(service_name, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_events_session ON user_events(session_id, created_at DESC);
    `);

    // Индексы для user_sessions
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id, started_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(ended_at) WHERE ended_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_sessions_device ON user_sessions(device_type, started_at DESC);
    `);

    // Индексы для performance_metrics
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_perf_type ON performance_metrics(metric_type, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_perf_service ON performance_metrics(service_name, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_perf_user ON performance_metrics(user_id, created_at DESC);
    `);

    // Индексы для service_usage
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_usage_user ON service_usage(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_usage_service ON service_usage(service_name, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_usage_success ON service_usage(success, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_usage_action ON service_usage(action, created_at DESC);
    `);

    // Индексы для aggregated_metrics
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_agg_date ON aggregated_metrics(metric_date, metric_hour DESC);
      CREATE INDEX IF NOT EXISTS idx_agg_user ON aggregated_metrics(user_id, metric_date DESC);
      CREATE INDEX IF NOT EXISTS idx_agg_service ON aggregated_metrics(service_name, metric_date DESC);
    `);

    // Индексы для speech_analytics
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_speech_user ON speech_analytics(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_speech_status ON speech_analytics(processing_status);
      CREATE INDEX IF NOT EXISTS idx_speech_sentiment ON speech_analytics(sentiment, created_at DESC);
    `);

    logger.info('Миграции аналитики успешно завершены');

  } catch (error) {
    logger.error('Ошибка при выполнении миграций аналитики', { error: error.message });
    throw error;
  } finally {
    db.close();
  }
}

/**
 * Проверка существования таблиц аналитики
 */
export function checkAnalyticsTables(dbPath: string): boolean {
  const db = new Database(dbPath);

  try {
    const tables = [
      'user_events',
      'user_sessions',
      'performance_metrics',
      'service_usage',
      'aggregated_metrics',
      'speech_analytics'
    ];

    for (const table of tables) {
      const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
      if (!result) {
        logger.warn(`Таблица ${table} не найдена`);
        return false;
      }
    }

    logger.info('Все таблицы аналитики существуют');
    return true;
  } catch (error) {
    logger.error('Ошибка при проверке таблиц аналитики', { error: error.message });
    return false;
  } finally {
    db.close();
  }
}
