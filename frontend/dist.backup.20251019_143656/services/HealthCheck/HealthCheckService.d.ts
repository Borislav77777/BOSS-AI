/**
 * Единая система HealthCheck для всех сервисов
 */
export interface HealthCheckResult {
    serviceId: string;
    isHealthy: boolean;
    status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
    lastChecked: Date;
    responseTime: number;
    errors: string[];
    warnings: string[];
    metrics: {
        uptime: number;
        memoryUsage: number;
        cpuUsage: number;
        requestCount: number;
        errorRate: number;
    };
}
export interface HealthCheckConfig {
    serviceId: string;
    endpoint: string;
    timeout: number;
    interval: number;
    retries: number;
    critical: boolean;
    dependencies: string[];
}
export declare class HealthCheckService {
    private static instance;
    private healthChecks;
    private results;
    private intervals;
    private listeners;
    private constructor();
    static getInstance(): HealthCheckService;
    /**
     * Инициализация стандартных проверок для всех сервисов
     */
    private initializeDefaultChecks;
    /**
     * Добавляет проверку здоровья для сервиса
     */
    addHealthCheck(config: HealthCheckConfig): void;
    /**
     * Удаляет проверку здоровья для сервиса
     */
    removeHealthCheck(serviceId: string): void;
    /**
     * Запускает проверку здоровья для сервиса
     */
    private startHealthCheck;
    /**
     * Останавливает проверку здоровья для сервиса
     */
    private stopHealthCheck;
    /**
     * Выполняет проверку здоровья для сервиса
     */
    private performHealthCheck;
    /**
     * Определяет статус сервиса на основе результатов проверки
     */
    private determineStatus;
    /**
     * Получает результат проверки здоровья для сервиса
     */
    getHealthResult(serviceId: string): HealthCheckResult | null;
    /**
     * Получает все результаты проверки здоровья
     */
    getAllHealthResults(): HealthCheckResult[];
    /**
     * Получает статус всех сервисов
     */
    getOverallStatus(): 'healthy' | 'degraded' | 'unhealthy';
    /**
     * Подписывается на изменения статуса здоровья
     */
    subscribe(callback: (result: HealthCheckResult) => void): () => void;
    /**
     * Уведомляет слушателей об изменении статуса
     */
    private notifyListeners;
    /**
     * Выполняет принудительную проверку всех сервисов
     */
    checkAllServices(): Promise<HealthCheckResult[]>;
    /**
     * Останавливает все проверки здоровья
     */
    stopAllHealthChecks(): void;
    private calculateUptime;
    private getMemoryUsage;
    private getCpuUsage;
    private getRequestCount;
    private getErrorRate;
}
export declare const healthCheckService: HealthCheckService;
//# sourceMappingURL=HealthCheckService.d.ts.map