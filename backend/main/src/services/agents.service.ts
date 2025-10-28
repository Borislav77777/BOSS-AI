import Database from "better-sqlite3";
import { ApiResponse, User } from "../types";
import { logger } from "../utils/logger";

/**
 * Интерфейс агента
 */
export interface Agent {
    id: string;
    name: string;
    description: string;
    avatarUrl: string;
    chatAvatarUrl: string;
    color: string;
    welcomeMessage: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Интерфейс для создания/обновления агента
 */
export interface CreateAgentData {
    id: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    chatAvatarUrl?: string;
    color?: string;
    welcomeMessage?: string;
    isActive?: boolean;
}

/**
 * Сервис для управления агентами
 */
export class AgentsService {
    private db: Database.Database;
    private agentsCache: Map<string, Agent> = new Map();
    private cacheExpiry: number = 0;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут

    constructor(dbPath: string) {
        this.db = new Database(dbPath);
        this.initializeDatabase();
    }

    /**
     * Инициализация базы данных
     */
    private initializeDatabase(): void {
        try {
            // SQLite PRAGMAs for performance
            this.db.pragma("journal_mode = WAL");
            this.db.pragma("synchronous = NORMAL");
            this.db.pragma("busy_timeout = 5000");
            
            // Запускаем миграцию
            this.runMigration();
            logger.info("AgentsService: База данных инициализирована");
        } catch (error) {
            logger.error("AgentsService: Ошибка инициализации базы данных", error);
            throw error;
        }
    }

    /**
     * Запуск миграции для создания таблиц агентов
     */
    private runMigration(): void {
        try {
            const migrationSQL = `
                -- Agents table
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

                -- Agent sessions
                CREATE TABLE IF NOT EXISTS agent_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    agent_id TEXT NOT NULL,
                    session_data TEXT,
                    created_at INTEGER DEFAULT (strftime('%s', 'now')),
                    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
                );

                -- Agent messages
                CREATE TABLE IF NOT EXISTS agent_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    agent_id TEXT NOT NULL,
                    message_text TEXT NOT NULL,
                    sender_type TEXT NOT NULL CHECK(sender_type IN ('user', 'agent')),
                    message_data TEXT,
                    created_at INTEGER DEFAULT (strftime('%s', 'now')),
                    FOREIGN KEY (session_id) REFERENCES agent_sessions(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
                );

                -- Agent usage tracking
                CREATE TABLE IF NOT EXISTS agent_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    agent_id TEXT NOT NULL,
                    session_id INTEGER,
                    action_type TEXT NOT NULL,
                    cost_bt REAL NOT NULL DEFAULT 0,
                    cost_rub REAL NOT NULL DEFAULT 0,
                    created_at INTEGER DEFAULT (strftime('%s', 'now')),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
                    FOREIGN KEY (session_id) REFERENCES agent_sessions(id) ON DELETE SET NULL
                );

                -- Indexes
                CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_agent_sessions_user ON agent_sessions(user_id, updated_at DESC);
                CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent ON agent_sessions(agent_id);
                CREATE INDEX IF NOT EXISTS idx_agent_messages_session ON agent_messages(session_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_agent_messages_user ON agent_messages(user_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_agent_usage_user ON agent_usage(user_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_agent_usage_agent ON agent_usage(agent_id, created_at DESC);
            `;

            this.db.exec(migrationSQL);

            // Вставляем дефолтных агентов если их нет
            this.insertDefaultAgents();
            
            logger.info("AgentsService: Миграция выполнена успешно");
        } catch (error) {
            logger.error("AgentsService: Ошибка выполнения миграции", error);
            throw error;
        }
    }

    /**
     * Вставка дефолтных агентов
     */
    private insertDefaultAgents(): void {
        const defaultAgents = [
            {
                id: 'ozon-manager',
                name: 'Ozon Менеджер',
                description: 'Автоматизация работы с Ozon',
                avatar_url: '/images/agents/ozon-manager-avatar.jpg',
                chat_avatar_url: '/images/agents/ozon-manager-chat.jpg',
                color: 'bg-blue-500',
                welcome_message: 'Привет! Я Ozon Менеджер. Желаете ли вы автоматически удалить товары из автоархивов или удалить товары из автоакций в Ozon кабинете?'
            },
            {
                id: 'ai-lawyer',
                name: 'AI Юрист',
                description: 'Правовая помощь и консультации',
                avatar_url: '/images/agents/ai-lawyer-avatar.jpg',
                chat_avatar_url: '/images/agents/ai-lawyer-chat.jpg',
                color: 'bg-purple-500',
                welcome_message: 'Привет! Я AI Юрист. Чем могу помочь с правовыми вопросами?'
            },
            {
                id: 'photo-studio',
                name: 'Фото Студия',
                description: 'Обработка и улучшение изображений',
                avatar_url: '/images/agents/photo-studio-avatar.jpg',
                chat_avatar_url: '/images/agents/photo-studio-chat.jpg',
                color: 'bg-green-500',
                welcome_message: 'Привет! Я Фото Студия. Готов помочь с обработкой ваших изображений!'
            }
        ];

        for (const agent of defaultAgents) {
            try {
                this.db.prepare(`
                    INSERT OR IGNORE INTO agents (id, name, description, avatar_url, chat_avatar_url, color, welcome_message)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(
                    agent.id,
                    agent.name,
                    agent.description,
                    agent.avatar_url,
                    agent.chat_avatar_url,
                    agent.color,
                    agent.welcome_message
                );
            } catch (error) {
                logger.warn(`AgentsService: Не удалось вставить агента ${agent.id}`, error);
            }
        }
    }

    /**
     * Получить всех активных агентов (с кэшированием)
     */
    async getActiveAgents(): Promise<ApiResponse<Agent[]>> {
        try {
            const now = Date.now();
            
            // Проверяем кэш
            if (this.cacheExpiry > now && this.agentsCache.size > 0) {
                const agents = Array.from(this.agentsCache.values());
                return {
                    success: true,
                    data: agents
                };
            }

            // Загружаем из базы
            const agents = this.db.prepare(`
                SELECT id, name, description, avatar_url as avatarUrl, chat_avatar_url as chatAvatarUrl,
                       color, welcome_message as welcomeMessage, is_active as isActive,
                       created_at as createdAt, updated_at as updatedAt
                FROM agents 
                WHERE is_active = 1 
                ORDER BY created_at ASC
            `).all() as Agent[];

            // Обновляем кэш
            this.agentsCache.clear();
            agents.forEach(agent => {
                this.agentsCache.set(agent.id, agent);
            });
            this.cacheExpiry = now + this.CACHE_TTL;

            logger.debug(`AgentsService: Загружено ${agents.length} активных агентов`);

            return {
                success: true,
                data: agents
            };
        } catch (error) {
            logger.error("AgentsService: Ошибка получения агентов", error);
            return {
                success: false,
                error: {
                    message: "Ошибка загрузки агентов",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Получить агента по ID
     */
    async getAgentById(agentId: string): Promise<ApiResponse<Agent>> {
        try {
            const agent = this.db.prepare(`
                SELECT id, name, description, avatar_url as avatarUrl, chat_avatar_url as chatAvatarUrl,
                       color, welcome_message as welcomeMessage, is_active as isActive,
                       created_at as createdAt, updated_at as updatedAt
                FROM agents 
                WHERE id = ? AND is_active = 1
            `).get(agentId) as Agent;

            if (!agent) {
                return {
                    success: false,
                    error: {
                        message: "Агент не найден",
                        statusCode: 404,
                        timestamp: new Date().toISOString()
                    }
                };
            }

            return {
                success: true,
                data: agent
            };
        } catch (error) {
            logger.error(`AgentsService: Ошибка получения агента ${agentId}`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка загрузки агента",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Создать нового агента (admin only)
     */
    async createAgent(agentData: CreateAgentData): Promise<ApiResponse<Agent>> {
        try {
            const now = Math.floor(Date.now() / 1000);
            
            this.db.prepare(`
                INSERT INTO agents (id, name, description, avatar_url, chat_avatar_url, color, welcome_message, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                agentData.id,
                agentData.name,
                agentData.description || '',
                agentData.avatarUrl || '',
                agentData.chatAvatarUrl || '',
                agentData.color || 'bg-gray-500',
                agentData.welcomeMessage || '',
                agentData.isActive !== false ? 1 : 0,
                now,
                now
            );

            // Очищаем кэш
            this.cacheExpiry = 0;

            logger.info(`AgentsService: Создан новый агент ${agentData.id}`);

            return {
                success: true,
                data: {
                    id: agentData.id,
                    name: agentData.name,
                    description: agentData.description || '',
                    avatarUrl: agentData.avatarUrl || '',
                    chatAvatarUrl: agentData.chatAvatarUrl || '',
                    color: agentData.color || 'bg-gray-500',
                    welcomeMessage: agentData.welcomeMessage || '',
                    isActive: agentData.isActive !== false,
                    createdAt: new Date(now * 1000).toISOString(),
                    updatedAt: new Date(now * 1000).toISOString()
                }
            };
        } catch (error) {
            logger.error(`AgentsService: Ошибка создания агента ${agentData.id}`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка создания агента",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Обновить агента (admin only)
     */
    async updateAgent(agentId: string, agentData: Partial<CreateAgentData>): Promise<ApiResponse<Agent>> {
        try {
            const now = Math.floor(Date.now() / 1000);
            
            const updateFields = [];
            const updateValues = [];

            if (agentData.name !== undefined) {
                updateFields.push('name = ?');
                updateValues.push(agentData.name);
            }
            if (agentData.description !== undefined) {
                updateFields.push('description = ?');
                updateValues.push(agentData.description);
            }
            if (agentData.avatarUrl !== undefined) {
                updateFields.push('avatar_url = ?');
                updateValues.push(agentData.avatarUrl);
            }
            if (agentData.chatAvatarUrl !== undefined) {
                updateFields.push('chat_avatar_url = ?');
                updateValues.push(agentData.chatAvatarUrl);
            }
            if (agentData.color !== undefined) {
                updateFields.push('color = ?');
                updateValues.push(agentData.color);
            }
            if (agentData.welcomeMessage !== undefined) {
                updateFields.push('welcome_message = ?');
                updateValues.push(agentData.welcomeMessage);
            }
            if (agentData.isActive !== undefined) {
                updateFields.push('is_active = ?');
                updateValues.push(agentData.isActive ? 1 : 0);
            }

            if (updateFields.length === 0) {
                return {
                    success: false,
                    error: {
                        message: "Нет данных для обновления",
                        statusCode: 400,
                        timestamp: new Date().toISOString()
                    }
                };
            }

            updateFields.push('updated_at = ?');
            updateValues.push(now, agentId);

            const result = this.db.prepare(`
                UPDATE agents 
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `).run(...updateValues);

            if (result.changes === 0) {
                return {
                    success: false,
                    error: {
                        message: "Агент не найден",
                        statusCode: 404,
                        timestamp: new Date().toISOString()
                    }
                };
            }

            // Очищаем кэш
            this.cacheExpiry = 0;

            logger.info(`AgentsService: Обновлен агент ${agentId}`);

            // Возвращаем обновленного агента
            return await this.getAgentById(agentId);
        } catch (error) {
            logger.error(`AgentsService: Ошибка обновления агента ${agentId}`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка обновления агента",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Удалить агента (admin only)
     */
    async deleteAgent(agentId: string): Promise<ApiResponse> {
        try {
            const result = this.db.prepare(`
                UPDATE agents 
                SET is_active = 0, updated_at = ?
                WHERE id = ?
            `).run(Math.floor(Date.now() / 1000), agentId);

            if (result.changes === 0) {
                return {
                    success: false,
                    error: {
                        message: "Агент не найден",
                        statusCode: 404,
                        timestamp: new Date().toISOString()
                    }
                };
            }

            // Очищаем кэш
            this.cacheExpiry = 0;

            logger.info(`AgentsService: Удален агент ${agentId}`);

            return {
                success: true,
                data: {
                    message: "Агент успешно удален"
                }
            };
        } catch (error) {
            logger.error(`AgentsService: Ошибка удаления агента ${agentId}`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка удаления агента",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Очистка кэша
     */
    clearCache(): void {
        this.agentsCache.clear();
        this.cacheExpiry = 0;
        logger.debug("AgentsService: Кэш очищен");
    }
}

// Экспортируем экземпляр сервиса
export const agentsService = new AgentsService(process.env.DB_PATH || "/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db");
