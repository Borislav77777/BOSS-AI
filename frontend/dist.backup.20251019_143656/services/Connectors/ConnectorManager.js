/**
 * Менеджер коннекторов для всех сервисов
 */
import { ServiceConnector } from './ServiceConnector';
export class ConnectorManager {
    constructor() {
        this.connectors = new Map();
        this.configs = new Map();
        this.healthCheckIntervals = new Map();
        this.listeners = new Set();
        this.initializeDefaultConnectors();
    }
    static getInstance() {
        if (!ConnectorManager.instance) {
            ConnectorManager.instance = new ConnectorManager();
        }
        return ConnectorManager.instance;
    }
    /**
     * Инициализация стандартных коннекторов
     */
    initializeDefaultConnectors() {
        const defaultConfigs = [
            {
                serviceId: 'ai-assistant',
                connector: {
                    serviceId: 'ai-assistant',
                    baseUrl: '/api/ai-assistant',
                    timeout: 10000,
                    retries: 3,
                    headers: {
                        'X-Service-Type': 'ai-assistant'
                    },
                    healthCheck: {
                        endpoint: '/health',
                        interval: 30000,
                        timeout: 5000
                    }
                },
                autoConnect: true,
                retryOnFailure: true,
                maxRetries: 5,
                healthCheckInterval: 30000
            },
            {
                serviceId: 'chatgpt-service',
                connector: {
                    serviceId: 'chatgpt-service',
                    baseUrl: '/api/chatgpt',
                    timeout: 15000,
                    retries: 3,
                    headers: {
                        'X-Service-Type': 'chatgpt'
                    },
                    auth: {
                        type: 'api-key',
                        apiKey: process.env.OPENAI_API_KEY || ''
                    },
                    healthCheck: {
                        endpoint: '/health',
                        interval: 30000,
                        timeout: 5000
                    }
                },
                autoConnect: true,
                retryOnFailure: true,
                maxRetries: 5,
                healthCheckInterval: 30000
            },
            {
                serviceId: 'file-manager',
                connector: {
                    serviceId: 'file-manager',
                    baseUrl: '/api/files',
                    timeout: 5000,
                    retries: 2,
                    headers: {
                        'X-Service-Type': 'file-manager'
                    },
                    healthCheck: {
                        endpoint: '/health',
                        interval: 60000,
                        timeout: 3000
                    }
                },
                autoConnect: true,
                retryOnFailure: true,
                maxRetries: 3,
                healthCheckInterval: 60000
            },
            {
                serviceId: 'settings',
                connector: {
                    serviceId: 'settings',
                    baseUrl: '/api/settings',
                    timeout: 3000,
                    retries: 1,
                    headers: {
                        'X-Service-Type': 'settings'
                    },
                    healthCheck: {
                        endpoint: '/health',
                        interval: 120000,
                        timeout: 2000
                    }
                },
                autoConnect: true,
                retryOnFailure: false,
                maxRetries: 1,
                healthCheckInterval: 120000
            },
            {
                serviceId: 'widgets-service',
                connector: {
                    serviceId: 'widgets-service',
                    baseUrl: '/api/widgets',
                    timeout: 5000,
                    retries: 2,
                    headers: {
                        'X-Service-Type': 'widgets'
                    },
                    healthCheck: {
                        endpoint: '/health',
                        interval: 60000,
                        timeout: 3000
                    }
                },
                autoConnect: true,
                retryOnFailure: true,
                maxRetries: 3,
                healthCheckInterval: 60000
            },
            {
                serviceId: 'real-speech-service',
                connector: {
                    serviceId: 'real-speech-service',
                    baseUrl: '/api/speech',
                    timeout: 10000,
                    retries: 3,
                    headers: {
                        'X-Service-Type': 'speech'
                    },
                    healthCheck: {
                        endpoint: '/health',
                        interval: 30000,
                        timeout: 5000
                    }
                },
                autoConnect: true,
                retryOnFailure: true,
                maxRetries: 5,
                healthCheckInterval: 30000
            }
        ];
        defaultConfigs.forEach(config => this.addConnector(config));
    }
    /**
     * Добавляет коннектор для сервиса
     */
    addConnector(config) {
        this.configs.set(config.serviceId, config);
        if (config.autoConnect) {
            this.connectService(config.serviceId);
        }
    }
    /**
     * Подключает сервис
     */
    async connectService(serviceId) {
        const config = this.configs.get(serviceId);
        if (!config) {
            console.error(`Конфигурация коннектора для сервиса ${serviceId} не найдена`);
            return false;
        }
        try {
            // Создаем коннектор
            const connector = ServiceConnector.getInstance(serviceId, config.connector);
            this.connectors.set(serviceId, connector);
            // Проверяем доступность
            const healthCheck = await connector.healthCheck();
            if (healthCheck.success) {
                this.notifyListeners(serviceId, 'connected');
                this.startHealthCheck(serviceId);
                return true;
            }
            else {
                console.warn(`Сервис ${serviceId} недоступен:`, healthCheck.error);
                this.notifyListeners(serviceId, 'error');
                return false;
            }
        }
        catch (error) {
            console.error(`Ошибка подключения к сервису ${serviceId}:`, error);
            this.notifyListeners(serviceId, 'error');
            return false;
        }
    }
    /**
     * Отключает сервис
     */
    disconnectService(serviceId) {
        this.stopHealthCheck(serviceId);
        this.connectors.delete(serviceId);
        ServiceConnector.removeInstance(serviceId);
        this.notifyListeners(serviceId, 'disconnected');
    }
    /**
     * Получает коннектор для сервиса
     */
    getConnector(serviceId) {
        return this.connectors.get(serviceId) || null;
    }
    /**
     * Получает все коннекторы
     */
    getAllConnectors() {
        return new Map(this.connectors);
    }
    /**
     * Запускает проверку здоровья для сервиса
     */
    startHealthCheck(serviceId) {
        const config = this.configs.get(serviceId);
        if (!config)
            return;
        this.stopHealthCheck(serviceId);
        const interval = setInterval(async () => {
            const connector = this.connectors.get(serviceId);
            if (!connector)
                return;
            try {
                const healthCheck = await connector.healthCheck();
                if (!healthCheck.success && config.retryOnFailure) {
                    console.warn(`Сервис ${serviceId} недоступен, пытаемся переподключиться...`);
                    await this.reconnectService(serviceId);
                }
            }
            catch (error) {
                console.error(`Ошибка проверки здоровья сервиса ${serviceId}:`, error);
                if (config.retryOnFailure) {
                    await this.reconnectService(serviceId);
                }
            }
        }, config.healthCheckInterval);
        this.healthCheckIntervals.set(serviceId, interval);
    }
    /**
     * Останавливает проверку здоровья для сервиса
     */
    stopHealthCheck(serviceId) {
        const interval = this.healthCheckIntervals.get(serviceId);
        if (interval) {
            clearInterval(interval);
            this.healthCheckIntervals.delete(serviceId);
        }
    }
    /**
     * Переподключает сервис
     */
    async reconnectService(serviceId) {
        const config = this.configs.get(serviceId);
        if (!config)
            return;
        let retries = 0;
        while (retries < config.maxRetries) {
            try {
                const success = await this.connectService(serviceId);
                if (success) {
                    console.log(`Сервис ${serviceId} успешно переподключен`);
                    return;
                }
            }
            catch (error) {
                console.error(`Ошибка переподключения сервиса ${serviceId} (попытка ${retries + 1}):`, error);
            }
            retries++;
            await this.delay(Math.pow(2, retries) * 1000);
        }
        console.error(`Не удалось переподключить сервис ${serviceId} после ${config.maxRetries} попыток`);
    }
    /**
     * Задержка
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Подписывается на изменения статуса сервисов
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    /**
     * Уведомляет слушателей об изменении статуса
     */
    notifyListeners(serviceId, status) {
        this.listeners.forEach(callback => {
            try {
                callback(serviceId, status);
            }
            catch (error) {
                console.error('Ошибка в listener коннектора:', error);
            }
        });
    }
    /**
     * Получает статус всех сервисов
     */
    getServicesStatus() {
        return Array.from(this.connectors.entries()).map(([serviceId, connector]) => ({
            serviceId,
            isConnected: true,
            metrics: connector.getMetrics(),
            lastHealthCheck: new Date()
        }));
    }
    /**
     * Выполняет запрос к сервису
     */
    async request(serviceId, endpoint, options) {
        const connector = this.connectors.get(serviceId);
        if (!connector) {
            throw new Error(`Коннектор для сервиса ${serviceId} не найден`);
        }
        const response = await connector.request(endpoint, options);
        return response.data;
    }
    /**
     * Останавливает все коннекторы
     */
    stopAllConnectors() {
        this.healthCheckIntervals.forEach((interval, _serviceId) => {
            clearInterval(interval);
        });
        this.healthCheckIntervals.clear();
        this.connectors.clear();
    }
}
// Экспортируем единственный экземпляр
export const connectorManager = ConnectorManager.getInstance();
//# sourceMappingURL=ConnectorManager.js.map