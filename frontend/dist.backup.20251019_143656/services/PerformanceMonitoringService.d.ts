/**
 * Сервис мониторинга производительности
 */
export interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    unit: 'ms' | 'bytes' | 'count' | 'percentage';
    timestamp: Date;
    category: 'navigation' | 'resource' | 'paint' | 'layout' | 'script' | 'custom';
    metadata?: Record<string, unknown>;
}
export interface PerformanceConfig {
    enableNavigationTiming: boolean;
    enableResourceTiming: boolean;
    enablePaintTiming: boolean;
    enableLayoutTiming: boolean;
    enableScriptTiming: boolean;
    enableCustomMetrics: boolean;
    sampleRate: number;
    maxMetricsPerSession: number;
    enableReporting: boolean;
    reportingEndpoint?: string;
    reportingInterval: number;
}
export interface PerformanceReport {
    sessionId: string;
    timestamp: Date;
    metrics: PerformanceMetric[];
    summary: {
        totalMetrics: number;
        averageLoadTime: number;
        averageRenderTime: number;
        memoryUsage: number;
        errorCount: number;
    };
}
declare class PerformanceMonitoringService {
    private config;
    private metrics;
    private sessionId;
    private observer;
    private reportingInterval;
    constructor(config: PerformanceConfig);
    /**
     * Инициализирует мониторинг производительности
     */
    private initializeMonitoring;
    /**
     * Собирает навигационные метрики
     */
    private collectNavigationMetrics;
    /**
     * Настраивает наблюдатель за ресурсами
     */
    private setupResourceObserver;
    /**
     * Настраивает наблюдатель за paint событиями
     */
    private setupPaintObserver;
    /**
     * Настраивает наблюдатель за layout событиями
     */
    private setupLayoutObserver;
    /**
     * Настраивает наблюдатель за script событиями
     */
    private setupScriptObserver;
    /**
     * Добавляет кастомную метрику
     */
    addCustomMetric(name: string, value: number, unit: PerformanceMetric['unit'], metadata?: Record<string, unknown>): void;
    /**
     * Измеряет время выполнения функции
     */
    measureFunction<T>(name: string, fn: () => T): T;
    /**
     * Измеряет время выполнения асинхронной функции
     */
    measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Получает все метрики
     */
    getMetrics(): PerformanceMetric[];
    /**
     * Получает метрики по категории
     */
    getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[];
    /**
     * Получает метрики по имени
     */
    getMetricsByName(name: string): PerformanceMetric[];
    /**
     * Получает статистику производительности
     */
    getPerformanceStats(): {
        totalMetrics: number;
        averageLoadTime: number;
        averageRenderTime: number;
        memoryUsage: number;
        slowestResources: PerformanceMetric[];
        fastestResources: PerformanceMetric[];
    };
    /**
     * Генерирует отчет о производительности
     */
    generateReport(): PerformanceReport;
    /**
     * Очищает метрики
     */
    clearMetrics(): void;
    /**
     * Останавливает мониторинг
     */
    stopMonitoring(): void;
    /**
     * Добавляет метрики
     */
    private addMetrics;
    /**
     * Определяет, нужно ли собирать метрику
     */
    private shouldSample;
    /**
     * Настраивает периодическую отправку отчетов
     */
    private setupReporting;
    /**
     * Отправляет отчет на сервер
     */
    private sendReport;
    /**
     * Генерирует ID сессии
     */
    private generateSessionId;
    /**
     * Генерирует ID метрики
     */
    private generateMetricId;
}
export declare const performanceMonitoringService: PerformanceMonitoringService;
export {};
//# sourceMappingURL=PerformanceMonitoringService.d.ts.map