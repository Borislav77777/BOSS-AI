/**
 * 🧠 ENHANCED AI BRAIN - Улучшенный мозг платформы
 *
 * Улучшения:
 * - Более точный анализ намерений
 * - Контекстная маршрутизация
 * - Приоритизация сервисов
 * - Умное кэширование решений
 */
import { Message } from '@/types';
export interface EnhancedChatContext {
    activeService: string | null;
    activeSection: string;
    conversationHistory: Message[];
    userPreferences: Record<string, unknown>;
    lastActivity: Date;
    serviceCapabilities: Map<string, ServiceCapability[]>;
    userIntentHistory: IntentHistory[];
}
export interface ServiceCapability {
    serviceId: string;
    capability: string;
    confidence: number;
    keywords: string[];
    examples: string[];
}
export interface IntentHistory {
    intent: string;
    serviceId: string;
    success: boolean;
    timestamp: Date;
    confidence: number;
}
export interface EnhancedChatResponse {
    success: boolean;
    message: string;
    data?: unknown;
    serviceId?: string;
    toolId?: string;
    isSystemResponse?: boolean;
    shouldRouteToService?: boolean;
    confidence: number;
    reasoning: string;
    alternatives: ServiceAlternative[];
}
export interface ServiceAlternative {
    serviceId: string;
    confidence: number;
    reason: string;
}
export interface EnhancedAIBrainConfig {
    enableSystemCommands: boolean;
    enableServiceRouting: boolean;
    enableContextAnalysis: boolean;
    enableLearning: boolean;
    maxHistoryLength: number;
    responseTimeout: number;
    confidenceThreshold: number;
    learningRate: number;
}
declare class EnhancedAIBrainService {
    private config;
    private context;
    private decisionCache;
    private learningMatrix;
    constructor();
    /**
     * Инициализация возможностей сервисов
     */
    private initializeServiceCapabilities;
    /**
     * Улучшенный анализ намерений с контекстом
     */
    private analyzeIntentEnhanced;
    /**
     * Контекстный анализ сообщения
     */
    private performContextualAnalysis;
    /**
     * Определение инструмента ChatGPT
     */
    private determineChatGPTTool;
    /**
     * Определение инструмента настроек
     */
    private determineSettingsTool;
    /**
     * Применение обучения для улучшения решений
     */
    private applyLearning;
    /**
     * Генерация ключа для кэширования
     */
    private generateMessageKey;
    /**
     * Загрузка данных обучения
     */
    private loadLearningData;
    /**
     * Сохранение данных обучения
     */
    private saveLearningData;
    /**
     * Основной метод обработки сообщений
     */
    processMessage(message: string, currentService?: string | null, currentSection?: string): Promise<EnhancedChatResponse>;
    /**
     * Обновление матрицы обучения
     */
    private updateLearningMatrix;
    /**
     * Обновление контекста
     */
    private updateContext;
    /**
     * Обработка системных команд
     */
    private handleSystemCommand;
    /**
     * Маршрутизация к сервису
     */
    private routeToService;
    /**
     * Обработка общих запросов
     */
    private handleGeneralQuery;
    /**
     * Получение статистики обучения
     */
    getLearningStats(): {
        totalDecisions: number;
        averageConfidence: number;
        serviceDistribution: Record<string, number>;
    };
}
export declare const enhancedAIBrain: EnhancedAIBrainService;
export {};
//# sourceMappingURL=EnhancedAIBrain.d.ts.map