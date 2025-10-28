-- Migration: Create agents and agent_sessions tables
-- Date: 2025-10-27
-- Description: Creates tables for agent management and session tracking

-- 1. Agents table for managing AI agents
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    chat_avatar_url TEXT,
    color TEXT,
    welcome_message TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 2. Agent sessions for tracking user interactions with agents
CREATE TABLE IF NOT EXISTS agent_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    agent_id TEXT NOT NULL,
    session_data TEXT, -- JSON data for session state
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 3. Agent messages for storing conversation history
CREATE TABLE IF NOT EXISTS agent_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    agent_id TEXT NOT NULL,
    message_text TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK(sender_type IN ('user', 'agent')),
    message_data TEXT, -- JSON data for additional message info
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES agent_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 4. Agent usage tracking for billing
CREATE TABLE IF NOT EXISTS agent_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    agent_id TEXT NOT NULL,
    session_id INTEGER,
    action_type TEXT NOT NULL, -- 'message', 'button_click', 'session_start'
    cost_bt REAL NOT NULL DEFAULT 0,
    cost_rub REAL NOT NULL DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES agent_sessions(id) ON DELETE SET NULL
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user ON agent_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent ON agent_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_session ON agent_messages(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_user ON agent_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_usage_user ON agent_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_usage_agent ON agent_usage(agent_id, created_at DESC);

-- Insert default agents
INSERT OR IGNORE INTO agents (id, name, description, avatar_url, chat_avatar_url, color, welcome_message) VALUES
    ('ozon-manager', 'Ozon Менеджер', 'Автоматизация работы с Ozon', '/images/agents/ozon-manager-avatar.jpg', '/images/agents/ozon-manager-chat.jpg', 'bg-blue-500', 'Привет! Я Ozon Менеджер. Желаете ли вы автоматически удалить товары из автоархивов или удалить товары из автоакций в Ozon кабинете?'),
    ('ai-lawyer', 'AI Юрист', 'Правовая помощь и консультации', '/images/agents/ai-lawyer-avatar.jpg', '/images/agents/ai-lawyer-chat.jpg', 'bg-purple-500', 'Привет! Я AI Юрист. Чем могу помочь с правовыми вопросами?'),
    ('photo-studio', 'Фото Студия', 'Обработка и улучшение изображений', '/images/agents/photo-studio-avatar.jpg', '/images/agents/photo-studio-chat.jpg', 'bg-green-500', 'Привет! Я Фото Студия. Готов помочь с обработкой ваших изображений!');

-- Add agent pricing to service_pricing table
INSERT OR IGNORE INTO service_pricing (service_name, unit_type, price_per_unit, currency) VALUES
    ('agent_ai_lawyer', 'message', 2.0, 'RUB'),
    ('agent_ozon_manager', 'message', 1.0, 'RUB'),
    ('agent_photo_studio', 'message', 3.0, 'RUB');
