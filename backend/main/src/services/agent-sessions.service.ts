import Database from "better-sqlite3";
import { ApiResponse } from "../types";
import { logger } from "../utils/logger";

/**
 * Интерфейс сессии агента
 */
export interface AgentSession {
    id: number;
    userId: number;
    agentId: string;
    sessionData: any; // JSON данные сессии
    createdAt: string;
    updatedAt: string;
}

/**
 * Интерфейс сообщения агента
 */
export interface AgentMessage {
    id: number;
    sessionId: number;
    userId: number;
    agentId: string;
    messageText: string;
    senderType: 'user' | 'agent';
    messageData: any; // JSON данные сообщения
    createdAt: string;
}

/**
 * Интерфейс для создания сессии
 */
export interface CreateSessionData {
    userId: number;
    agentId: string;
    sessionData?: any;
}

/**
 * Интерфейс для отправки сообщения
 */
export interface SendMessageData {
    sessionId: number;
    userId: number;
    agentId: string;
    messageText: string;
    senderType: 'user' | 'agent';
    messageData?: any;
}

/**
 * Сервис для управления сессиями агентов
 */
export class AgentSessionsService {
    private db: Database.Database;

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

            logger.info("AgentSessionsService: База данных инициализирована");
        } catch (error) {
            logger.error("AgentSessionsService: Ошибка инициализации базы данных", error);
            throw error;
        }
    }

    /**
     * Создать новую сессию с агентом
     */
    async createSession(sessionData: CreateSessionData): Promise<ApiResponse<AgentSession>> {
        try {
            const now = Math.floor(Date.now() / 1000);

            const result = this.db.prepare(`
                INSERT INTO agent_sessions (user_id, agent_id, session_data, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                sessionData.userId,
                sessionData.agentId,
                JSON.stringify(sessionData.sessionData || {}),
                now,
                now
            );

            const sessionId = result.lastInsertRowid as number;

            logger.info(`AgentSessionsService: Создана сессия ${sessionId} для пользователя ${sessionData.userId} с агентом ${sessionData.agentId}`);

            return {
                success: true,
                data: {
                    id: sessionId,
                    userId: sessionData.userId,
                    agentId: sessionData.agentId,
                    sessionData: sessionData.sessionData || {},
                    createdAt: new Date(now * 1000).toISOString(),
                    updatedAt: new Date(now * 1000).toISOString()
                }
            };
        } catch (error) {
            logger.error(`AgentSessionsService: Ошибка создания сессии`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка создания сессии",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Получить активную сессию пользователя с агентом
     */
    async getActiveSession(userId: number, agentId: string): Promise<ApiResponse<AgentSession | null>> {
        try {
            const session = this.db.prepare(`
                SELECT id, user_id as userId, agent_id as agentId, session_data as sessionData,
                       created_at as createdAt, updated_at as updatedAt
                FROM agent_sessions
                WHERE user_id = ? AND agent_id = ?
                ORDER BY updated_at DESC
                LIMIT 1
            `).get(userId, agentId) as AgentSession | undefined;

            if (!session) {
                return {
                    success: true,
                    data: null
                };
            }

            // Парсим JSON данные
            try {
                session.sessionData = JSON.parse(session.sessionData as any);
            } catch (e) {
                session.sessionData = {};
            }

            return {
                success: true,
                data: session
            };
        } catch (error) {
            logger.error(`AgentSessionsService: Ошибка получения сессии`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка получения сессии",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Обновить сессию
     */
    async updateSession(sessionId: number, sessionData: any): Promise<ApiResponse<AgentSession>> {
        try {
            const now = Math.floor(Date.now() / 1000);

            const result = this.db.prepare(`
                UPDATE agent_sessions
                SET session_data = ?, updated_at = ?
                WHERE id = ?
            `).run(JSON.stringify(sessionData), now, sessionId);

            if (result.changes === 0) {
                return {
                    success: false,
                    error: {
                        message: "Сессия не найдена",
                        statusCode: 404,
                        timestamp: new Date().toISOString()
                    }
                };
            }

            // Получаем обновленную сессию
            const session = this.db.prepare(`
                SELECT id, user_id as userId, agent_id as agentId, session_data as sessionData,
                       created_at as createdAt, updated_at as updatedAt
                FROM agent_sessions
                WHERE id = ?
            `).get(sessionId) as AgentSession;

            // Парсим JSON данные
            try {
                session.sessionData = JSON.parse(session.sessionData as any);
            } catch (e) {
                session.sessionData = {};
            }

            logger.debug(`AgentSessionsService: Обновлена сессия ${sessionId}`);

            return {
                success: true,
                data: session
            };
        } catch (error) {
            logger.error(`AgentSessionsService: Ошибка обновления сессии ${sessionId}`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка обновления сессии",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Отправить сообщение в сессию
     */
    async sendMessage(messageData: SendMessageData): Promise<ApiResponse<AgentMessage>> {
        try {
            const now = Math.floor(Date.now() / 1000);

            const result = this.db.prepare(`
                INSERT INTO agent_messages (session_id, user_id, agent_id, message_text, sender_type, message_data, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                messageData.sessionId,
                messageData.userId,
                messageData.agentId,
                messageData.messageText,
                messageData.senderType,
                JSON.stringify(messageData.messageData || {}),
                now
            );

            const messageId = result.lastInsertRowid as number;

            // Обновляем время последнего обновления сессии
            this.db.prepare(`
                UPDATE agent_sessions
                SET updated_at = ?
                WHERE id = ?
            `).run(now, messageData.sessionId);

            logger.debug(`AgentSessionsService: Отправлено сообщение ${messageId} в сессию ${messageData.sessionId}`);

            return {
                success: true,
                data: {
                    id: messageId,
                    sessionId: messageData.sessionId,
                    userId: messageData.userId,
                    agentId: messageData.agentId,
                    messageText: messageData.messageText,
                    senderType: messageData.senderType,
                    messageData: messageData.messageData || {},
                    createdAt: new Date(now * 1000).toISOString()
                }
            };
        } catch (error) {
            logger.error(`AgentSessionsService: Ошибка отправки сообщения`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка отправки сообщения",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Получить историю сообщений сессии
     */
    async getSessionMessages(sessionId: number, limit: number = 50): Promise<ApiResponse<AgentMessage[]>> {
        try {
            const messages = this.db.prepare(`
                SELECT id, session_id as sessionId, user_id as userId, agent_id as agentId,
                       message_text as messageText, sender_type as senderType, message_data as messageData,
                       created_at as createdAt
                FROM agent_messages
                WHERE session_id = ?
                ORDER BY created_at ASC
                LIMIT ?
            `).all(sessionId, limit) as AgentMessage[];

            // Парсим JSON данные для каждого сообщения
            messages.forEach(message => {
                try {
                    message.messageData = JSON.parse(message.messageData as any);
                } catch (e) {
                    message.messageData = {};
                }
            });

            return {
                success: true,
                data: messages
            };
        } catch (error) {
            logger.error(`AgentSessionsService: Ошибка получения сообщений сессии ${sessionId}`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка получения сообщений",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Получить все сессии пользователя
     */
    async getUserSessions(userId: number, limit: number = 20): Promise<ApiResponse<AgentSession[]>> {
        try {
            const sessions = this.db.prepare(`
                SELECT id, user_id as userId, agent_id as agentId, session_data as sessionData,
                       created_at as createdAt, updated_at as updatedAt
                FROM agent_sessions
                WHERE user_id = ?
                ORDER BY updated_at DESC
                LIMIT ?
            `).all(userId, limit) as AgentSession[];

            // Парсим JSON данные для каждой сессии
            sessions.forEach(session => {
                try {
                    session.sessionData = JSON.parse(session.sessionData as any);
                } catch (e) {
                    session.sessionData = {};
                }
            });

            return {
                success: true,
                data: sessions
            };
        } catch (error) {
            logger.error(`AgentSessionsService: Ошибка получения сессий пользователя ${userId}`, error);
            return {
                success: false,
                error: {
                    message: "Ошибка получения сессий",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Очистка старых сессий (старше 30 дней)
     */
    async cleanupOldSessions(): Promise<ApiResponse> {
        try {
            const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

            // Удаляем старые сессии
            const sessionsResult = this.db.prepare(`
                DELETE FROM agent_sessions
                WHERE updated_at < ?
            `).run(thirtyDaysAgo);

            // Удаляем связанные сообщения
            const messagesResult = this.db.prepare(`
                DELETE FROM agent_messages
                WHERE created_at < ?
            `).run(thirtyDaysAgo);

            logger.info(`AgentSessionsService: Очищено ${sessionsResult.changes} старых сессий и ${messagesResult.changes} сообщений`);

            return {
                success: true,
                data: {
                    deletedSessions: sessionsResult.changes,
                    deletedMessages: messagesResult.changes
                }
            };
        } catch (error) {
            logger.error("AgentSessionsService: Ошибка очистки старых сессий", error);
            return {
                success: false,
                error: {
                    message: "Ошибка очистки старых сессий",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Получить статистику использования агентов
     */
    async getAgentUsageStats(agentId?: string, days: number = 30): Promise<ApiResponse<any>> {
        try {
            const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);

            let query = `
                SELECT
                    agent_id as agentId,
                    COUNT(DISTINCT user_id) as uniqueUsers,
                    COUNT(*) as totalSessions,
                    MAX(updated_at) as lastActivity
                FROM agent_sessions
                WHERE created_at >= ?
            `;

            const params: any[] = [since];

            if (agentId) {
                query += ' AND agent_id = ?';
                params.push(agentId);
            }

            query += ' GROUP BY agent_id ORDER BY totalSessions DESC';

            const stats = this.db.prepare(query).all(...params);

            return {
                success: true,
                data: {
                    period: `${days} дней`,
                    stats
                }
            };
        } catch (error) {
            logger.error("AgentSessionsService: Ошибка получения статистики", error);
            return {
                success: false,
                error: {
                    message: "Ошибка получения статистики",
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
}

// Экспортируем экземпляр сервиса
export const agentSessionsService = new AgentSessionsService(process.env.DB_PATH || "/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db");
