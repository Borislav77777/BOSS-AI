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

export class HealthCheckService {
  private static instance: HealthCheckService;
  private healthChecks: Map<string, HealthCheckConfig> = new Map();
  private results: Map<string, HealthCheckResult> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Set<(result: HealthCheckResult) => void> = new Set();

  private constructor() {
    this.initializeDefaultChecks();
  }

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  /**
   * Инициализация стандартных проверок для всех сервисов
   */
  private initializeDefaultChecks(): void {
    const defaultChecks: HealthCheckConfig[] = [
      {
        serviceId: 'ai-assistant',
        endpoint: '/api/health/ai-assistant',
        timeout: 5000,
        interval: 30000,
        retries: 3,
        critical: true,
        dependencies: []
      },
      {
        serviceId: 'chatgpt-service',
        endpoint: '/api/health/chatgpt',
        timeout: 5000,
        interval: 30000,
        retries: 3,
        critical: true,
        dependencies: []
      },
      {
        serviceId: 'file-manager',
        endpoint: '/api/health/file-manager',
        timeout: 3000,
        interval: 60000,
        retries: 2,
        critical: false,
        dependencies: []
      },
      {
        serviceId: 'settings',
        endpoint: '/api/health/settings',
        timeout: 2000,
        interval: 120000,
        retries: 1,
        critical: true,
        dependencies: []
      },
      {
        serviceId: 'widgets-service',
        endpoint: '/api/health/widgets',
        timeout: 3000,
        interval: 60000,
        retries: 2,
        critical: false,
        dependencies: []
      },
      {
        serviceId: 'real-speech-service',
        endpoint: '/api/health/speech',
        timeout: 5000,
        interval: 30000,
        retries: 3,
        critical: false,
        dependencies: []
      }
    ];

    defaultChecks.forEach(config => this.addHealthCheck(config));
  }

  /**
   * Добавляет проверку здоровья для сервиса
   */
  public addHealthCheck(config: HealthCheckConfig): void {
    this.healthChecks.set(config.serviceId, config);
    this.startHealthCheck(config.serviceId);
  }

  /**
   * Удаляет проверку здоровья для сервиса
   */
  public removeHealthCheck(serviceId: string): void {
    this.healthChecks.delete(serviceId);
    this.stopHealthCheck(serviceId);
    this.results.delete(serviceId);
  }

  /**
   * Запускает проверку здоровья для сервиса
   */
  private startHealthCheck(serviceId: string): void {
    const config = this.healthChecks.get(serviceId);
    if (!config) return;

    // Останавливаем существующую проверку
    this.stopHealthCheck(serviceId);

    // Запускаем новую проверку
    const interval = setInterval(async () => {
      await this.performHealthCheck(serviceId);
    }, config.interval);

    this.intervals.set(serviceId, interval);

    // Выполняем первую проверку сразу
    this.performHealthCheck(serviceId);
  }

  /**
   * Останавливает проверку здоровья для сервиса
   */
  private stopHealthCheck(serviceId: string): void {
    const interval = this.intervals.get(serviceId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(serviceId);
    }
  }

  /**
   * Выполняет проверку здоровья для сервиса
   */
  private async performHealthCheck(serviceId: string): Promise<void> {
    const config = this.healthChecks.get(serviceId);
    if (!config) return;

    const startTime = Date.now();
    let isHealthy = false;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Проверяем зависимости
      for (const dependency of config.dependencies) {
        const depResult = this.results.get(dependency);
        if (!depResult || !depResult.isHealthy) {
          warnings.push(`Зависимость ${dependency} недоступна`);
        }
      }

      // Выполняем HTTP запрос к endpoint сервиса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(config.endpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Health-Check': 'true'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        isHealthy = data.status === 'healthy' || data.status === 'ok';

        if (data.warnings) {
          warnings.push(...data.warnings);
        }
      } else {
        errors.push(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      errors.push(errorMessage);
    }

    const responseTime = Date.now() - startTime;
    const status = this.determineStatus(isHealthy, errors, warnings);

    const result: HealthCheckResult = {
      serviceId,
      isHealthy,
      status,
      lastChecked: new Date(),
      responseTime,
      errors,
      warnings,
      metrics: {
        uptime: this.calculateUptime(serviceId, isHealthy),
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCpuUsage(),
        requestCount: this.getRequestCount(serviceId),
        errorRate: this.getErrorRate(serviceId)
      }
    };

    this.results.set(serviceId, result);
    this.notifyListeners(result);
  }

  /**
   * Определяет статус сервиса на основе результатов проверки
   */
  private determineStatus(isHealthy: boolean, errors: string[], warnings: string[]): 'healthy' | 'unhealthy' | 'degraded' | 'unknown' {
    if (isHealthy && errors.length === 0) {
      return warnings.length > 0 ? 'degraded' : 'healthy';
    }
    return errors.length > 0 ? 'unhealthy' : 'unknown';
  }

  /**
   * Получает результат проверки здоровья для сервиса
   */
  public getHealthResult(serviceId: string): HealthCheckResult | null {
    return this.results.get(serviceId) || null;
  }

  /**
   * Получает все результаты проверки здоровья
   */
  public getAllHealthResults(): HealthCheckResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Получает статус всех сервисов
   */
  public getOverallStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const results = this.getAllHealthResults();
    if (results.length === 0) return 'unhealthy';

    const criticalServices = results.filter(r => {
      const config = this.healthChecks.get(r.serviceId);
      return config?.critical === true;
    });

    const unhealthyCritical = criticalServices.filter(r => !r.isHealthy);
    if (unhealthyCritical.length > 0) return 'unhealthy';

    const degradedServices = results.filter(r => r.status === 'degraded');
    if (degradedServices.length > 0) return 'degraded';

    return 'healthy';
  }

  /**
   * Подписывается на изменения статуса здоровья
   */
  public subscribe(callback: (result: HealthCheckResult) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Уведомляет слушателей об изменении статуса
   */
  private notifyListeners(result: HealthCheckResult): void {
    this.listeners.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('Ошибка в listener healthcheck:', error);
      }
    });
  }

  /**
   * Выполняет принудительную проверку всех сервисов
   */
  public async checkAllServices(): Promise<HealthCheckResult[]> {
    const promises = Array.from(this.healthChecks.keys()).map(serviceId =>
      this.performHealthCheck(serviceId)
    );

    await Promise.allSettled(promises);
    return this.getAllHealthResults();
  }

  /**
   * Останавливает все проверки здоровья
   */
  public stopAllHealthChecks(): void {
    this.intervals.forEach((interval, _serviceId) => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }

  // Вспомогательные методы для метрик
  private calculateUptime(_serviceId: string, isHealthy: boolean): number {
    // Упрощенная логика расчета uptime
    return isHealthy ? 99.9 : 0;
  }

  private getMemoryUsage(): number {
    // Упрощенная логика получения использования памяти
    return Math.random() * 100;
  }

  private getCpuUsage(): number {
    // Упрощенная логика получения использования CPU
    return Math.random() * 100;
  }

  private getRequestCount(_serviceId: string): number {
    // Упрощенная логика подсчета запросов
    return Math.floor(Math.random() * 1000);
  }

  private getErrorRate(_serviceId: string): number {
    // Упрощенная логика расчета ошибок
    return Math.random() * 5;
  }
}

// Экспортируем единственный экземпляр
export const healthCheckService = HealthCheckService.getInstance();
