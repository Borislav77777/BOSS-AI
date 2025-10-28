/**
 * Сервис аналитики использования
 */
export interface UserEvent {
    id: string;
    type: string;
    action: string;
    component?: string;
    service?: string;
    timestamp: Date;
    userId?: string;
    sessionId: string;
    metadata?: Record<string, unknown>;
}
export interface UserSession {
    id: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    events: UserEvent[];
    userId?: string;
    userAgent: string;
    referrer?: string;
    pageViews: number;
    interactions: number;
}
export interface UsageStats {
    totalSessions: number;
    totalEvents: number;
    averageSessionDuration: number;
    mostUsedComponents: Array<{
        component: string;
        count: number;
    }>;
    mostUsedServices: Array<{
        service: string;
        count: number;
    }>;
    popularActions: Array<{
        action: string;
        count: number;
    }>;
    userEngagement: {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
    };
}
export interface AnalyticsConfig {
    enableTracking: boolean;
    enableSessionTracking: boolean;
    enableEventTracking: boolean;
    enableUserTracking: boolean;
    enablePageTracking: boolean;
    enableServiceTracking: boolean;
    sessionTimeout: number;
    maxEventsPerSession: number;
    enableReporting: boolean;
    reportingEndpoint?: string;
    reportingInterval: number;
    enableLocalStorage: boolean;
    enableCookies: boolean;
}
declare class UsageAnalyticsService {
    private config;
    private currentSession;
    private sessions;
    private events;
    private reportingInterval;
    private sessionTimeout;
    constructor(config: AnalyticsConfig);
    /**
     * Инициализирует отслеживание
     */
    private initializeTracking;
    /**
     * Начинает новую сессию
     */
    startSession(): void;
    /**
     * Завершает текущую сессию
     */
    endSession(): void;
    /**
     * Отслеживает событие пользователя
     */
    trackEvent(type: string, action: string, component?: string, service?: string, metadata?: Record<string, unknown>): void;
    /**
     * Отслеживает просмотр страницы
     */
    trackPageView(page: string, metadata?: Record<string, unknown>): void;
    /**
     * Отслеживает использование сервиса
     */
    trackServiceUsage(service: string, action: string, metadata?: Record<string, unknown>): void;
    /**
     * Отслеживает взаимодействие с компонентом
     */
    trackComponentInteraction(component: string, action: string, metadata?: Record<string, unknown>): void;
    /**
     * Отслеживает ошибку
     */
    trackError(error: Error, component?: string, service?: string, metadata?: Record<string, unknown>): void;
    /**
     * Отслеживает производительность
     */
    trackPerformance(metric: string, value: number, unit: string, metadata?: Record<string, unknown>): void;
    /**
     * Получает статистику использования
     */
    getUsageStats(): UsageStats;
    /**
     * Получает события по типу
     */
    getEventsByType(type: string): UserEvent[];
    /**
     * Получает события по компоненту
     */
    getEventsByComponent(component: string): UserEvent[];
    /**
     * Получает события по сервису
     */
    getEventsByService(service: string): UserEvent[];
    /**
     * Получает сессии пользователя
     */
    getUserSessions(userId: string): UserSession[];
    /**
     * Очищает данные
     */
    clearData(): void;
    /**
     * Останавливает отслеживание
     */
    stopTracking(): void;
    /**
     * Настраивает отслеживание страниц
     */
    private setupPageTracking;
    /**
     * Настраивает отслеживание сервисов
     */
    private setupServiceTracking;
    /**
     * Настраивает периодическую отправку отчетов
     */
    private setupReporting;
    /**
     * Настраивает таймаут сессии
     */
    private setupSessionTimeout;
    /**
     * Сбрасывает таймаут сессии
     */
    private resetSessionTimeout;
    /**
     * Отправляет отчет на сервер
     */
    private sendReport;
    /**
     * Генерирует ID сессии
     */
    private generateSessionId;
    /**
     * Генерирует ID события
     */
    private generateEventId;
}
export declare const usageAnalyticsService: UsageAnalyticsService;
export {};
//# sourceMappingURL=UsageAnalyticsService.d.ts.map