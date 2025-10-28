import { GatewayHealthStatus, HealthStatus } from '../types';
import { logger } from '../utils/logger';
import { aiServicesService } from './ai-services.service';
import { ozonManagerService } from './ozon-manager.service';

/**
 * Сервис для проверки здоровья системы
 */
export class HealthService {
  private logger = logger;
  private startTime = Date.now();

  /**
   * Инициализация сервиса
   */
  async initialize(): Promise<void> {
    this.logger.info('Инициализация HealthService...');
    this.logger.info('HealthService инициализирован');
  }

  /**
   * Проверка здоровья всех микросервисов
   */
  async checkServicesHealth(): Promise<HealthStatus[]> {
    const services: HealthStatus[] = [];

    // Проверяем Ozon Manager
    try {
      const ozonHealth = await ozonManagerService.getHealthStatus();
      services.push(ozonHealth);
    } catch (error) {
      this.logger.error('Ошибка проверки здоровья Ozon Manager', error);
      services.push({
        service: 'ozon-manager',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Проверяем AI Services
    try {
      const aiHealth = await aiServicesService.getHealthStatus();
      services.push(aiHealth);
    } catch (error) {
      this.logger.error('Ошибка проверки здоровья AI Services', error);
      services.push({
        service: 'ai-services',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return services;
  }

  /**
   * Получить общий статус здоровья API Gateway
   */
  async getGatewayHealth(): Promise<GatewayHealthStatus> {
    const services = await this.checkServicesHealth();
    const uptime = Date.now() - this.startTime;

    // Определяем общий статус
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

    if (healthyServices === totalServices) {
      overallStatus = 'healthy';
    } else if (healthyServices > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime,
      services,
      version: '1.0.0'
    };
  }

  /**
   * Проверка здоровья API Gateway
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Получить метрики системы
   */
  async getSystemMetrics(): Promise<{
    uptime: number;
    memory: NodeJS.MemoryUsage;
    services: HealthStatus[];
    timestamp: string;
  }> {
    const services = await this.checkServicesHealth();

    return {
      uptime: Date.now() - this.startTime,
      memory: process.memoryUsage(),
      services,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Проверка доступности базы данных
   */
  async checkDatabaseHealth(): Promise<HealthStatus> {
    try {
      // TODO: Реализовать проверку подключения к базе данных
      // Пока что возвращаем заглушку
      return {
        service: 'database',
        status: 'healthy',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Проверка доступности внешних сервисов
   */
  async checkExternalServices(): Promise<HealthStatus[]> {
    const externalServices: HealthStatus[] = [];

    // Проверяем Telegram API
    try {
      // TODO: Реализовать проверку доступности Telegram API
      externalServices.push({
        service: 'telegram-api',
        status: 'healthy',
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      externalServices.push({
        service: 'telegram-api',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Проверяем Ozon API
    try {
      // TODO: Реализовать проверку доступности Ozon API
      externalServices.push({
        service: 'ozon-api',
        status: 'healthy',
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      externalServices.push({
        service: 'ozon-api',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return externalServices;
  }

  /**
   * Получить детальную информацию о здоровье системы
   */
  async getDetailedHealth(): Promise<{
    gateway: GatewayHealthStatus;
    database: HealthStatus;
    external: HealthStatus[];
    metrics: any;
  }> {
    const [gateway, database, external, metrics] = await Promise.all([
      this.getGatewayHealth(),
      this.checkDatabaseHealth(),
      this.checkExternalServices(),
      this.getSystemMetrics()
    ]);

    return {
      gateway,
      database,
      external,
      metrics
    };
  }
}

// Экспортируем экземпляр сервиса
export const healthService = new HealthService();
