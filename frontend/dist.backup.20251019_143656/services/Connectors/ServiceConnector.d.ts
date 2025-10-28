/**
 * Стандартизированный коннектор для всех сервисов
 */
export interface ConnectorConfig {
    serviceId: string;
    baseUrl: string;
    timeout: number;
    retries: number;
    headers: Record<string, string>;
    auth?: {
        type: 'bearer' | 'api-key' | 'basic' | 'oauth';
        token?: string;
        apiKey?: string;
        username?: string;
        password?: string;
    };
    healthCheck: {
        endpoint: string;
        interval: number;
        timeout: number;
    };
    rateLimit?: {
        requests: number;
        window: number;
    };
}
export interface ConnectorResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
}
export interface ConnectorMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastRequestTime: Date;
    errorRate: number;
}
export declare class ServiceConnector {
    private static instances;
    private config;
    private metrics;
    private requestQueue;
    private isProcessingQueue;
    private constructor();
    /**
     * Получает или создает экземпляр коннектора для сервиса
     */
    static getInstance(serviceId: string, config: ConnectorConfig): ServiceConnector;
    /**
     * Выполняет HTTP запрос к сервису
     */
    request<T = any>(endpoint: string, options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        body?: any;
        headers?: Record<string, string>;
        timeout?: number;
    }): Promise<ConnectorResponse<T>>;
    /**
     * Выполняет запрос с повторными попытками
     */
    private executeWithRetries;
    /**
     * Добавляет заголовки авторизации
     */
    private addAuthHeaders;
    /**
     * Задержка между попытками
     */
    private delay;
    /**
     * Обновляет метрики коннектора
     */
    private updateMetrics;
    /**
     * Получает метрики коннектора
     */
    getMetrics(): ConnectorMetrics;
    /**
     * Получает конфигурацию коннектора
     */
    getConfig(): ConnectorConfig;
    /**
     * Обновляет конфигурацию коннектора
     */
    updateConfig(newConfig: Partial<ConnectorConfig>): void;
    /**
     * Проверяет доступность сервиса
     */
    healthCheck(): Promise<ConnectorResponse>;
    /**
     * Выполняет пакетные запросы
     */
    batchRequest<T = any>(requests: Array<{
        endpoint: string;
        options?: Parameters<ServiceConnector['request']>[1];
    }>): Promise<ConnectorResponse<T>[]>;
    /**
     * Очищает метрики коннектора
     */
    resetMetrics(): void;
    /**
     * Удаляет экземпляр коннектора
     */
    static removeInstance(serviceId: string): void;
    /**
     * Получает все экземпляры коннекторов
     */
    static getAllInstances(): Map<string, ServiceConnector>;
}
//# sourceMappingURL=ServiceConnector.d.ts.map