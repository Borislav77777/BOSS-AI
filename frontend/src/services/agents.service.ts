import { apiClient } from './api-client';

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
 * Интерфейс сессии агента
 */
export interface AgentSession {
    id: number;
    userId: number;
    agentId: string;
    sessionData: any;
    createdAt: string;
    updatedAt: string;
}

/**
 * Интерфейс сообщения
 */
export interface AgentMessage {
    id: number;
    sessionId: number;
    userId: number;
    agentId: string;
    messageText: string;
    senderType: 'user' | 'agent';
    messageData: any;
    createdAt: string;
}

/**
 * Интерфейс ответа API
 */
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        statusCode: number;
        timestamp: string;
    };
}

/**
 * Сервис для работы с агентами
 */
export class AgentsService {
    private baseUrl = '/api/agents';

    /**
     * Получить список всех активных агентов
     */
    async fetchAgents(): Promise<Agent[]> {
        try {
            const response = await apiClient.get<ApiResponse<Agent[]>>(this.baseUrl);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error?.message || 'Ошибка загрузки агентов');
        } catch (error) {
            console.error('[AgentsService] Ошибка загрузки агентов:', error);
            throw error;
        }
    }

    /**
     * Получить агента по ID
     */
    async getAgentById(agentId: string): Promise<Agent> {
        try {
            const response = await apiClient.get<ApiResponse<Agent>>(`${this.baseUrl}/${agentId}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error?.message || 'Ошибка загрузки агента');
        } catch (error) {
            console.error(`[AgentsService] Ошибка загрузки агента ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * Создать сессию с агентом
     */
    async createAgentSession(agentId: string): Promise<AgentSession> {
        try {
            const response = await apiClient.post<ApiResponse<AgentSession>>(
                `${this.baseUrl}/${agentId}/session`,
                {}
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error?.message || 'Ошибка создания сессии');
        } catch (error) {
            console.error(`[AgentsService] Ошибка создания сессии с агентом ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * Получить активную сессию с агентом
     */
    async getActiveSession(agentId: string): Promise<AgentSession | null> {
        try {
            const response = await apiClient.get<ApiResponse<AgentSession | null>>(
                `${this.baseUrl}/${agentId}/session`
            );

            if (response.data.success) {
                return response.data.data || null;
            }

            throw new Error(response.data.error?.message || 'Ошибка получения сессии');
        } catch (error) {
            console.error(`[AgentsService] Ошибка получения сессии с агентом ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * Отправить сообщение агенту
     */
    async sendMessageToAgent(
        agentId: string,
        message: string,
        sessionId?: number
    ): Promise<{ userMessage: AgentMessage; agentMessage: AgentMessage; sessionId: number }> {
        try {
            const response = await apiClient.post<ApiResponse<{
                userMessage: AgentMessage;
                agentMessage: AgentMessage;
                sessionId: number;
            }>>(
                `${this.baseUrl}/${agentId}/message`,
                { message, sessionId }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error?.message || 'Ошибка отправки сообщения');
        } catch (error) {
            console.error(`[AgentsService] Ошибка отправки сообщения агенту ${agentId}:`, error);
            throw error;
        }
    }

    /**
     * Получить историю сообщений сессии
     */
    async getSessionMessages(agentId: string, sessionId: number, limit: number = 50): Promise<AgentMessage[]> {
        try {
            const response = await apiClient.get<ApiResponse<AgentMessage[]>>(
                `${this.baseUrl}/${agentId}/messages/${sessionId}?limit=${limit}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error?.message || 'Ошибка загрузки сообщений');
        } catch (error) {
            console.error(`[AgentsService] Ошибка загрузки сообщений сессии ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Получить все сессии пользователя
     */
    async getUserSessions(limit: number = 20): Promise<AgentSession[]> {
        try {
            const response = await apiClient.get<ApiResponse<AgentSession[]>>(
                `${this.baseUrl}/sessions/my?limit=${limit}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error?.message || 'Ошибка загрузки сессий');
        } catch (error) {
            console.error('[AgentsService] Ошибка загрузки сессий пользователя:', error);
            throw error;
        }
    }

    /**
     * Получить статистику использования агентов
     */
    async getAgentUsageStats(agentId?: string, days: number = 30): Promise<any> {
        try {
            const params = new URLSearchParams();
            if (agentId) params.append('agentId', agentId);
            params.append('days', days.toString());

            const response = await apiClient.get<ApiResponse<any>>(
                `${this.baseUrl}/stats/usage?${params.toString()}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error?.message || 'Ошибка загрузки статистики');
        } catch (error) {
            console.error('[AgentsService] Ошибка загрузки статистики:', error);
            throw error;
        }
    }
}

// Экспортируем экземпляр сервиса
export const agentsService = new AgentsService();
