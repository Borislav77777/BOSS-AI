-- Migration: Create Katya tables for chat interface
-- Date: 2025-10-21
-- Description: Creates all necessary tables for Katya chat interface

-- 1. Katya user chats mapping
CREATE TABLE IF NOT EXISTS katya_user_chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    telegram_chat_id BIGINT NOT NULL,
    chat_name TEXT,
    chat_type TEXT DEFAULT 'private',
    is_active BOOLEAN DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    UNIQUE(user_id, telegram_chat_id)
);

CREATE INDEX IF NOT EXISTS idx_katya_user_chats_user ON katya_user_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_katya_user_chats_telegram ON katya_user_chats(telegram_chat_id);

-- 2. Chat messages history
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id BIGINT UNIQUE NOT NULL,
    chat_id BIGINT NOT NULL,
    user_id INTEGER,
    telegram_user_id BIGINT,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    text TEXT NOT NULL,
    reply_to_message_id BIGINT,
    is_katya_mention BOOLEAN DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON chat_messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_mention ON chat_messages(is_katya_mention, chat_id);

-- 3. Chat summaries
CREATE TABLE IF NOT EXISTS chat_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id BIGINT NOT NULL,
    summary_text TEXT NOT NULL,
    message_count INTEGER DEFAULT 0,
    start_message_id BIGINT,
    end_message_id BIGINT,
    keywords TEXT,
    topics TEXT,
    decisions TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_summaries_chat ON chat_summaries(chat_id, created_at DESC);

-- 4. Chat contexts (discussion topics)
CREATE TABLE IF NOT EXISTS chat_contexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id BIGINT NOT NULL,
    topic TEXT NOT NULL,
    description TEXT,
    keywords TEXT,
    ref_message_ids TEXT,
    decision TEXT,
    decided_by TEXT,
    decided_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_contexts_topic ON chat_contexts(topic);
CREATE INDEX IF NOT EXISTS idx_contexts_chat ON chat_contexts(chat_id, created_at DESC);

-- 5. Knowledge base (Q&A)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source_chat_id BIGINT,
    source_message_ids TEXT,
    context_id INTEGER,
    created_by TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    relevance_score REAL DEFAULT 1.0,
    FOREIGN KEY (context_id) REFERENCES chat_contexts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_search ON knowledge_base(question, answer);

-- 6. Katya requests history
CREATE TABLE IF NOT EXISTS katya_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    request_type TEXT NOT NULL,
    request_data TEXT,
    response_data TEXT,
    cost_bt REAL NOT NULL DEFAULT 0,
    cost_rub REAL NOT NULL DEFAULT 0,
    duration_ms INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_katya_requests ON katya_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_katya_requests_type ON katya_requests(request_type);

-- 7. Katya user settings
CREATE TABLE IF NOT EXISTS katya_user_settings (
    user_id INTEGER PRIMARY KEY,
    telegram_enabled BOOLEAN DEFAULT 1,
    platform_chat_enabled BOOLEAN DEFAULT 1,
    auto_summarize BOOLEAN DEFAULT 0,
    auto_summarize_threshold INTEGER DEFAULT 100,
    context_window INTEGER DEFAULT 50,
    proactive_hints BOOLEAN DEFAULT 1,
    anonymize_pii BOOLEAN DEFAULT 0,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
