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

export class ConnectorManager {
  private static instance: ConnectorManager;
  private connectors: Map<string, ServiceConnector> = new Map();
  private configs: Map<string, ServiceConnectorConfig> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Set<(serviceId: string, status: 'connected' | 'disconnected' | 'error') => void> = new Set();

  private constructor() {
    this.initializeDefaultConnectors();
  }

  public static getInstance(): ConnectorManager {
    if (!ConnectorManager.instance) {
      ConnectorManager.instance = new ConnectorManager();
    }
    return ConnectorManager.instance;
  }

  /**
   * Инициализация стандартных коннекторов
   */
  private initializeDefaultConnectors(): void {
    const defaultConfigs: ServiceConnectorConfig[] = [
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
  public addConnector(config: ServiceConnectorConfig): void {
    this.configs.set(config.serviceId, config);

    if (config.autoConnect) {
      this.connectService(config.serviceId);
    }
  }

  /**
   * Подключает сервис
   */
  public async connectService(serviceId: string): Promise<boolean> {
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
      } else {
        console.warn(`Сервис ${serviceId} недоступен:`, healthCheck.error);
        this.notifyListeners(serviceId, 'error');
        return false;
      }
    } catch (error) {
      console.error(`Ошибка подключения к сервису ${serviceId}:`, error);
      this.notifyListeners(serviceId, 'error');
      return false;
    }
  }

  /**
   * Отключает сервис
   */
  public disconnectService(serviceId: string): void {
    this.stopHealthCheck(serviceId);
    this.connectors.delete(serviceId);
    ServiceConnector.removeInstance(serviceId);
    this.notifyListeners(serviceId, 'disconnected');
  }

  /**
   * Получает коннектор для сервиса
   */
  public getConnector(serviceId: string): ServiceConnector | null {
    return this.connectors.get(serviceId) || null;
  }

  /**
   * Получает все коннекторы
   */
  public getAllConnectors(): Map<string, ServiceConnector> {
    return new Map(this.connectors);
  }

  /**
   * Запускает проверку здоровья для сервиса
   */
  private startHealthCheck(serviceId: string): void {
    const config = this.configs.get(serviceId);
    if (!config) return;

    this.stopHealthCheck(serviceId);

    const interval = setInterval(async () => {
      const connector = this.connectors.get(serviceId);
      if (!connector) return;

      try {
        const healthCheck = await connector.healthCheck();
        if (!healthCheck.success && config.retryOnFailure) {
          console.warn(`Сервис ${serviceId} недоступен, пытаемся переподключиться...`);
          await this.reconnectService(serviceId);
        }
      } catch (error) {
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
  private stopHealthCheck(serviceId: string): void {
    const interval = this.healthCheckIntervals.get(serviceId);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(serviceId);
    }
  }

  /**
   * Переподключает сервис
   */
  private async reconnectService(serviceId: string): Promise<void> {
    const config = this.configs.get(serviceId);
    if (!config) return;

    let retries = 0;
    while (retries < config.maxRetries) {
      try {
        const success = await this.connectService(serviceId);
        if (success) {
          console.log(`Сервис ${serviceId} успешно переподключен`);
          return;
        }
      } catch (error) {
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
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Подписывается на изменения статуса сервисов
   */
  public subscribe(callback: (serviceId: string, status: 'connected' | 'disconnected' | 'error') => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Уведомляет слушателей об изменении статуса
   */
  private notifyListeners(serviceId: string, status: 'connected' | 'disconnected' | 'error'): void {
    this.listeners.forEach(callback => {
      try {
        callback(serviceId, status);
      } catch (error) {
        console.error('Ошибка в listener коннектора:', error);
      }
    });
  }

  /**
   * Получает статус всех сервисов
   */
  public getServicesStatus(): Array<{
    serviceId: string;
    isConnected: boolean;
    metrics: Record<string, unknown>;
    lastHealthCheck: Date;
  }> {
    return Array.from(this.connectors.entries()).map(([serviceId, connector]) => ({
      serviceId,
      isConnected: true,
      metrics: connector.getMetrics() as unknown as Record<string, unknown>,
      lastHealthCheck: new Date()
    }));
  }

  /**
   * Выполняет запрос к сервису
   */
  public async request<T = unknown>(
    serviceId: string,
    endpoint: string,
    options?: Parameters<ServiceConnector['request']>[1]
  ): Promise<T> {
    const connector = this.connectors.get(serviceId);
    if (!connector) {
      throw new Error(`Коннектор для сервиса ${serviceId} не найден`);
    }

    const response = await connector.request<T>(endpoint, options);
    return response.data as T;
  }

  /**
   * Останавливает все коннекторы
   */
  public stopAllConnectors(): void {
    this.healthCheckIntervals.forEach((interval, _serviceId) => {
      clearInterval(interval);
    });
    this.healthCheckIntervals.clear();
    this.connectors.clear();
  }
}

// Экспортируем единственный экземпляр
export const connectorManager = ConnectorManager.getInstance();
