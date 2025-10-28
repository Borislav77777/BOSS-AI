/**
 * Интеграция ServiceConnector с ServiceManager
 */

import { ServiceConfig } from "@/types/services";
import { connectorManager } from "../Connectors/ConnectorManager";
import { connectorValidator } from "../Connectors/ConnectorValidator";
import type { ServiceConnector } from "../Connectors/ServiceConnector";
import { ConnectorConfig } from "../Connectors/ServiceConnector";
import { healthCheckService } from "../HealthCheck/HealthCheckService";
import { serviceManager } from "../ServiceManager";

type ServiceMetrics = Record<string, unknown>;

export interface ServiceConnectorIntegrationConfig {
  autoConnect: boolean;
  autoHealthCheck: boolean;
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
}

export class ServiceConnectorIntegration {
  private static instance: ServiceConnectorIntegration;
  private config: ServiceConnectorIntegrationConfig;
  private isInitialized = false;

  private constructor() {
    this.config = {
      autoConnect: true,
      autoHealthCheck: true,
      autoRetry: true,
      maxRetries: 5,
      retryDelay: 1000,
    };
  }

  public static getInstance(): ServiceConnectorIntegration {
    if (!ServiceConnectorIntegration.instance) {
      ServiceConnectorIntegration.instance = new ServiceConnectorIntegration();
    }
    return ServiceConnectorIntegration.instance;
  }

  /**
   * Инициализирует интеграцию
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Подписываемся на события ServiceManager
      this.setupServiceManagerListeners();

      // Подписываемся на события ConnectorManager
      this.setupConnectorManagerListeners();

      // Подписываемся на события HealthCheck
      this.setupHealthCheckListeners();

      // Загружаем существующие сервисы
      await this.loadExistingServices();

      this.isInitialized = true;
      console.log("[ServiceConnectorIntegration] Интеграция инициализирована");
    } catch (error) {
      console.error(
        "[ServiceConnectorIntegration] Ошибка инициализации:",
        error
      );
      throw error;
    }
  }

  /**
   * Настраивает слушатели ServiceManager
   */
  private setupServiceManagerListeners(): void {
    // serviceRegistry отключен, закомментируем вызовы
    // Подписываемся на события регистрации сервисов
    // serviceManager.onServiceRegistered((service) => {
    //   console.log(`[ServiceConnectorIntegration] Сервис ${service.id} зарегистрирован`);
    //   this.handleServiceRegistered(service);
    // });
    // serviceManager.onServiceUnregistered((serviceId) => {
    //   console.log(`[ServiceConnectorIntegration] Сервис ${serviceId} отрегистрирован`);
    //   this.handleServiceUnregistered(serviceId);
    // });
  }

  /**
   * Настраивает слушатели ConnectorManager
   */
  private setupConnectorManagerListeners(): void {
    connectorManager.subscribe((serviceId, status) => {
      console.log(
        `[ServiceConnectorIntegration] Сервис ${serviceId} статус: ${status}`
      );
      this.handleConnectorStatusChange(serviceId, status);
    });
  }

  /**
   * Настраивает слушатели HealthCheck
   */
  private setupHealthCheckListeners(): void {
    healthCheckService.subscribe((result) => {
      console.log(
        `[ServiceConnectorIntegration] HealthCheck для ${result.serviceId}: ${result.status}`
      );
      this.handleHealthCheckResult(result);
    });
  }

  /**
   * Загружает существующие сервисы
   */
  private async loadExistingServices(): Promise<void> {
    try {
      const services = serviceManager.getAllServices();

      for (const service of services) {
        if (service.config.isActive) {
          await this.connectService(service.config);
        }
      }
    } catch (error) {
      console.error(
        "[ServiceConnectorIntegration] Ошибка загрузки сервисов:",
        error
      );
    }
  }

  /**
   * Обрабатывает регистрацию сервиса
   */
  private async handleServiceRegistered(service: ServiceConfig): Promise<void> {
    if (this.config.autoConnect && service.isActive) {
      await this.connectService(service);
    }
  }

  /**
   * Обрабатывает отмену регистрации сервиса
   */
  private handleServiceUnregistered(serviceId: string): void {
    connectorManager.disconnectService(serviceId);
  }

  /**
   * Обрабатывает изменение статуса коннектора
   */
  private handleConnectorStatusChange(
    serviceId: string,
    status: "connected" | "disconnected" | "error"
  ): void {
    const service = serviceManager.getService(serviceId);
    if (!service) return;

    switch (status) {
      case "connected":
        console.log(
          `[ServiceConnectorIntegration] Сервис ${serviceId} подключен`
        );
        break;
      case "disconnected":
        console.log(
          `[ServiceConnectorIntegration] Сервис ${serviceId} отключен`
        );
        break;
      case "error":
        console.error(
          `[ServiceConnectorIntegration] Ошибка сервиса ${serviceId}`
        );
        if (this.config.autoRetry) {
          this.retryConnection(serviceId);
        }
        break;
    }
  }

  /**
   * Обрабатывает результат health check
   */
  private handleHealthCheckResult(result: {
    serviceId: string;
    isHealthy: boolean;
  }): void {
    if (!result.isHealthy && this.config.autoRetry) {
      this.retryConnection(result.serviceId);
    }
  }

  /**
   * Подключает сервис
   */
  public async connectService(service: ServiceConfig): Promise<boolean> {
    try {
      // Валидируем конфигурацию сервиса
      const validation = connectorValidator.validateServiceConfig(service);
      if (!validation.isValid) {
        console.error(
          `[ServiceConnectorIntegration] Ошибка валидации сервиса ${service.id}:`,
          validation.errors
        );
        return false;
      }

      // Создаем конфигурацию коннектора
      const connectorConfig = this.createConnectorConfig(service);

      // Добавляем коннектор
      connectorManager.addConnector({
        serviceId: service.id,
        connector: connectorConfig,
        autoConnect: this.config.autoConnect,
        retryOnFailure: this.config.autoRetry,
        maxRetries: this.config.maxRetries,
        healthCheckInterval: 30000,
      });

      // Подключаем сервис
      const connected = await connectorManager.connectService(service.id);

      if (connected && this.config.autoHealthCheck) {
        // Добавляем health check
        healthCheckService.addHealthCheck({
          serviceId: service.id,
          endpoint: `${connectorConfig.baseUrl}${connectorConfig.healthCheck.endpoint}`,
          timeout: connectorConfig.healthCheck.timeout,
          interval: connectorConfig.healthCheck.interval,
          retries: connectorConfig.retries,
          critical: service.priority < 5,
          dependencies: service.dependencies || [],
        });
      }

      return connected;
    } catch (error) {
      console.error(
        `[ServiceConnectorIntegration] Ошибка подключения сервиса ${service.id}:`,
        error
      );
      return false;
    }
  }

  /**
   * Отключает сервис
   */
  public disconnectService(serviceId: string): void {
    connectorManager.disconnectService(serviceId);
    healthCheckService.removeHealthCheck(serviceId);
  }

  /**
   * Создает конфигурацию коннектора для сервиса
   */
  private createConnectorConfig(service: ServiceConfig): ConnectorConfig {
    // Базовый URL для сервиса
    const baseUrl = `/api/${service.id}`;

    return {
      serviceId: service.id,
      baseUrl,
      timeout: 5000,
      retries: 3,
      headers: {
        "X-Service-Type": service.category || "utility",
        "X-Service-Version": service.version,
        "User-Agent": `BARSUKOV-OS/${service.id}`,
      },
      healthCheck: {
        endpoint: "/health",
        interval: 30000,
        timeout: 5000,
      },
    };
  }

  /**
   * Повторно подключает сервис
   */
  private async retryConnection(serviceId: string): Promise<void> {
    const service = serviceManager.getService(serviceId);
    if (!service) return;

    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        await this.delay(this.config.retryDelay * Math.pow(2, retries));

        const connected = await this.connectService(service.config);
        if (connected) {
          console.log(
            `[ServiceConnectorIntegration] Сервис ${serviceId} успешно переподключен`
          );
          return;
        }
      } catch (error) {
        console.error(
          `[ServiceConnectorIntegration] Ошибка переподключения сервиса ${serviceId} (попытка ${
            retries + 1
          }):`,
          error
        );
      }

      retries++;
    }

    console.error(
      `[ServiceConnectorIntegration] Не удалось переподключить сервис ${serviceId} после ${this.config.maxRetries} попыток`
    );
  }

  /**
   * Задержка
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Получает статус всех сервисов
   */
  public getServicesStatus(): Array<{
    serviceId: string;
    isConnected: boolean;
    healthStatus: string;
    metrics: ServiceMetrics;
  }> {
    const connectorStatus = connectorManager.getServicesStatus();
    const healthResults = healthCheckService.getAllHealthResults();

    return connectorStatus.map((status) => {
      const healthResult = healthResults.find(
        (h) => h.serviceId === status.serviceId
      );
      const baseMetrics = (status.metrics ?? {}) as ServiceMetrics;
      const healthMetrics = (healthResult?.metrics ?? {}) as ServiceMetrics;
      return {
        ...status,
        healthStatus: healthResult?.status || "unknown",
        metrics: { ...baseMetrics, health: healthMetrics },
      };
    });
  }

  /**
   * Выполняет запрос к сервису
   */
  public async request<T = unknown>(
    serviceId: string,
    endpoint: string,
    options?: Parameters<ServiceConnector["request"]>[1]
  ): Promise<T> {
    return connectorManager.request<T>(serviceId, endpoint, options);
  }

  /**
   * Обновляет конфигурацию интеграции
   */
  public updateConfig(
    newConfig: Partial<ServiceConnectorIntegrationConfig>
  ): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Получает конфигурацию интеграции
   */
  public getConfig(): ServiceConnectorIntegrationConfig {
    return { ...this.config };
  }
}

// Экспортируем единственный экземпляр
export const serviceConnectorIntegration =
  ServiceConnectorIntegration.getInstance();
