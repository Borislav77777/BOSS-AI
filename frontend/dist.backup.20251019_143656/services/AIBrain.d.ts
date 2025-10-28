/**
 * 🧠 AI BRAIN - Центральный мозг платформы для маршрутизации сообщений
 *
 * Этот сервис отвечает за:
 * - Анализ намерений пользователя
 * - Маршрутизацию сообщений к соответствующим сервисам
 * - Обработку системных команд
 * - Управление контекстом разговора
 */
import { Message } from '@/types';
export interface ChatContext {
    activeService: string | null;
    activeSection: string;
    conversationHistory: Message[];
    userPreferences: Record<string, unknown>;
    lastActivity: Date;
}
export interface ChatContextForAI {
    attachedItems: Array<{
        type: string;
        title: string;
        content?: string;
    }>;
    activeProject?: {
        title: string;
    };
    contextSummary?: string;
}
export interface ChatResponse {
    success: boolean;
    message: string;
    data?: unknown;
    serviceId?: string;
    toolId?: string;
    isSystemResponse?: boolean;
    shouldRouteToService?: boolean;
}
export interface AIBrainConfig {
    enableSystemCommands: boolean;
    enableServiceRouting: boolean;
    enableContextAnalysis: boolean;
    maxHistoryLength: number;
    responseTimeout: number;
}
declare class AIBrainService {
    private config;
    private context;
    /**
     * Основной метод обработки сообщений
     */
    processMessage(message: string, currentService?: string | null, currentSection?: string): Promise<ChatResponse>;
    /**
     * Анализ намерений пользователя с учетом контекста
     */
    private analyzeIntentWithContext;
    /**
     * Анализ намерений пользователя
     */
    private analyzeIntent;
    /**
     * Обработка системных команд
     */
    private handleSystemCommand;
    /**
     * Маршрутизация к сервису
     */
    private routeToService;
    /**
     * Обработка общих запросов с контекстом
     */
    private handleGeneralQueryWithContext;
    /**
     * Построение информации о контексте
     */
    private buildContextInfo;
    /**
     * Обработка общих запросов
     */
    private handleGeneralQuery;
    /**
     * Обновление контекста
     */
    private updateContext;
    /**
     * Извлечение ключевых слов
     */
    private extractKeywords;
    /**
     * Получение сообщения помощи
     */
    private getHelpMessage;
    /**
     * Добавление сообщения в историю
     */
    addMessageToHistory(message: Message): void;
    /**
     * Получение контекста
     */
    getContext(): ChatContext;
    /**
     * Обновление конфигурации
     */
    updateConfig(newConfig: Partial<AIBrainConfig>): void;
    /**
     * Очистка контекста
     */
    clearContext(): void;
}
export declare const aiBrain: AIBrainService;
export {};
//# sourceMappingURL=AIBrain.d.ts.map