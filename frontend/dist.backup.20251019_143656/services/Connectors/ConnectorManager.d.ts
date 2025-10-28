/**
 * Менеджер коннекторов для всех сервисов
 */
import { ConnectorConfig, ServiceConnector } from './ServiceConnector';
export interface ServiceConnectorConfig {
    serviceId: string;
    connector: ConnectorConfig;
    autoConnect: boolean;
    retryOnFailure: boolean;
    maxRetries: number;
    healthCheckInterval: number;
}
export declare class ConnectorManager {
    private static instance;
    private connectors;
    private configs;
    private healthCheckIntervals;
    private listeners;
    private constructor();
    static getInstance(): ConnectorManager;
    /**
     * Инициализация стандартных коннекторов
     */
    private initializeDefaultConnectors;
    /**
     * Добавляет коннектор для сервиса
     */
    addConnector(config: ServiceConnectorConfig): void;
    /**
     * Подключает сервис
     */
    connectService(serviceId: string): Promise<boolean>;
    /**
     * Отключает сервис
     */
    disconnectService(serviceId: string): void;
    /**
     * Получает коннектор для сервиса
     */
    getConnector(serviceId: string): ServiceConnector | null;
    /**
     * Получает все коннекторы
     */
    getAllConnectors(): Map<string, ServiceConnector>;
    /**
     * Запускает проверку здоровья для сервиса
     */
    private startHealthCheck;
    /**
     * Останавливает проверку здоровья для сервиса
     */
    private stopHealthCheck;
    /**
     * Переподключает сервис
     */
    private reconnectService;
    /**
     * Задержка
     */
    private delay;
    /**
     * Подписывается на изменения статуса сервисов
     */
    subscribe(callback: (serviceId: string, status: 'connected' | 'disconnected' | 'error') => void): () => void;
    /**
     * Уведомляет слушателей об изменении статуса
     */
    private notifyListeners;
    /**
     * Получает статус всех сервисов
     */
    getServicesStatus(): Array<{
        serviceId: string;
        isConnected: boolean;
        metrics: Record<string, unknown>;
        lastHealthCheck: Date;
    }>;
    /**
     * Выполняет запрос к сервису
     */
    request<T = unknown>(serviceId: string, endpoint: string, options?: Parameters<ServiceConnector['request']>[1]): Promise<T>;
    /**
     * Останавливает все коннекторы
     */
    stopAllConnectors(): void;
}
export declare const connectorManager: ConnectorManager;
//# sourceMappingURL=ConnectorManager.d.ts.map