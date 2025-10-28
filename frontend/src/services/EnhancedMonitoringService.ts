/**
 * Улучшенный сервис мониторинга
 * Включает интеграцию с Sentry, расширенную аналитику и health checks
 */

import { EnhancedErrorHandlingService } from './EnhancedErrorHandlingService';
import { usageAnalyticsService } from './UsageAnalyticsService';

type SentryEvent = {
  tags?: { environment?: string; [key: string]: unknown };
  user?: { id?: string; [key: string]: unknown };
  [key: string]: unknown;
};

export interface MonitoringConfig {
  sentryDsn?: string;
  environment: string;
  release?: string;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserTracking: boolean;
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  performanceThresholds: {
    pageLoadTime: number;
    apiResponseTime: number;
    memoryUsage: number;
  };
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message: string;
      responseTime?: number;
    };
  };
  overallResponseTime: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  errorRate: number;
  userSessions: number;
  activeUsers: number;
}

export class EnhancedMonitoringService {
  private static instance: EnhancedMonitoringService;
  private config: MonitoringConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    errorRate: 0,
    userSessions: 0,
    activeUsers: 0
  };

  private constructor(config: MonitoringConfig) {
    this.config = config;
    this.initializeSentry();
    this.initializePerformanceMonitoring();
    this.initializeHealthChecks();
  }

  public static getInstance(config?: MonitoringConfig): EnhancedMonitoringService {
    if (!EnhancedMonitoringService.instance) {
      if (!config) {
        throw new Error('Monitoring config is required for first initialization');
      }
      EnhancedMonitoringService.instance = new EnhancedMonitoringService(config);
    }
    return EnhancedMonitoringService.instance;
  }

  /**
   * Инициализация Sentry
   */
  private async initializeSentry(): Promise<void> {
    if (!this.config.sentryDsn) {
      console.warn('Sentry DSN not provided, error tracking disabled');
      return;
    }

    try {
      const Sentry = await import('@sentry/react');

      // Инициализируем Sentry; метрики сэмплирования оставлены отключенными
      const browser = await import('@sentry/browser');
      const integrations = browser.browserTracingIntegration
        ? [browser.browserTracingIntegration({ traceFetch: true })]
        : [];

      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: this.config.environment,
        release: this.config.release,
        integrations,
        // tracesSampleRate: 1.0,
      });

      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Инициализация мониторинга производительности
   */
  private initializePerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) {
      return;
    }

    // Мониторинг загрузки страницы
    this.monitorPageLoad();

    // Мониторинг API запросов
    this.monitorApiRequests();

    // Мониторинг памяти
    this.monitorMemoryUsage();

    // Мониторинг производительности
    this.monitorPerformance();
  }

  /**
   * Инициализация health checks
   */
  private initializeHealthChecks(): void {
    if (!this.config.enableHealthChecks) {
      return;
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Мониторинг загрузки страницы
   */
  private monitorPageLoad(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
        this.metrics.pageLoadTime = pageLoadTime;

        // Отправляем метрику в Sentry
        this.sendMetricToSentry('page_load_time', pageLoadTime);

        // Проверяем пороговые значения
        if (pageLoadTime > this.config.performanceThresholds.pageLoadTime) {
          this.reportPerformanceIssue('slow_page_load', pageLoadTime);
        }
      }
    });
  }

  /**
   * Мониторинг API запросов
   */
  private monitorApiRequests(): void {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.metrics.apiResponseTime = responseTime;

        // Отправляем метрику
        this.sendMetricToSentry('api_response_time', responseTime, { url });

        // Проверяем пороговые значения
        if (responseTime > this.config.performanceThresholds.apiResponseTime) {
          this.reportPerformanceIssue('slow_api_response', responseTime, { url });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Отправляем ошибку в Sentry
        this.sendErrorToSentry(error as Error, { url, responseTime });

        throw error;
      }
    };
  }

  /**
   * Мониторинг использования памяти
   */
  private monitorMemoryUsage(): void {
    type PerformanceWithMemory = Performance & { memory?: { usedJSHeapSize: number } };
    const perfWithMemory = performance as PerformanceWithMemory;
    if (perfWithMemory.memory) {
      const memory = perfWithMemory.memory;

      setInterval(() => {
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        this.metrics.memoryUsage = memoryUsage;

        // Отправляем метрику
        this.sendMetricToSentry('memory_usage', memoryUsage);

        // Проверяем пороговые значения
        if (memoryUsage > this.config.performanceThresholds.memoryUsage) {
          this.reportPerformanceIssue('high_memory_usage', memoryUsage);
        }
      }, 30000); // Каждые 30 секунд
    }
  }

  /**
   * Мониторинг производительности
   */
  private monitorPerformance(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.sendMetricToSentry('custom_measure', entry.duration, { name: entry.name });
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    }
  }

  /**
   * Выполнение health check
   */
  private async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    const checks: HealthCheckResult['checks'] = {};

    // Проверка доступности API
    try {
      const apiStart = performance.now();
      const response = await fetch('/api/health', { method: 'HEAD' });
      const apiEnd = performance.now();

      checks.api = {
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'API is healthy' : 'API is unhealthy',
        responseTime: apiEnd - apiStart
      };
    } catch (error) {
      checks.api = {
        status: 'fail',
        message: `API check failed: ${error}`
      };
    }

    // Проверка использования памяти
    type PerformanceWithMemory = Performance & { memory?: { usedJSHeapSize: number } };
    const perfWithMemory = performance as PerformanceWithMemory;
    if (perfWithMemory.memory) {
      const memory = perfWithMemory.memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024;

      checks.memory = {
        status: memoryUsage < this.config.performanceThresholds.memoryUsage ? 'pass' : 'warn',
        message: `Memory usage: ${memoryUsage.toFixed(2)}MB`
      };
    }

    // Проверка ошибок
    const errorMetrics = EnhancedErrorHandlingService.getInstance().getErrorMetrics();
    checks.errors = {
      status: errorMetrics.errorRate < 0.1 ? 'pass' : 'warn',
      message: `Error rate: ${errorMetrics.errorRate.toFixed(3)}/s`
    };

    const endTime = performance.now();
    const overallResponseTime = endTime - startTime;

    // Определяем общий статус
    const statuses = Object.values(checks).map(check => check.status);
    const hasFailures = statuses.includes('fail');
    const hasWarnings = statuses.includes('warn');

    const status: HealthCheckResult['status'] = hasFailures ? 'unhealthy' :
                                              hasWarnings ? 'degraded' : 'healthy';

    const result: HealthCheckResult = {
      status,
      timestamp: Date.now(),
      checks,
      overallResponseTime
    };

    // Отправляем результат в аналитику
    this.sendHealthCheckResult(result);

    return result;
  }

  /**
   * Отправка метрики в Sentry
   */
  private async sendMetricToSentry(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    try {
      const Sentry = await import('@sentry/react');
      Sentry.addBreadcrumb({
        message: `Metric: ${name}`,
        category: 'performance',
        data: { value, tags },
        level: 'info'
      });
    } catch (error) {
      console.error('Failed to send metric to Sentry:', error);
    }
  }

  /**
   * Отправка ошибки в Sentry
   */
  private async sendErrorToSentry(error: Error, context?: Record<string, unknown>): Promise<void> {
    try {
      const Sentry = await import('@sentry/react');
      Sentry.captureException(error, { extra: context });
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError);
    }
  }

  /**
   * Отправка результата health check
   */
  private sendHealthCheckResult(result: HealthCheckResult): void {
    try {
      usageAnalyticsService.trackEvent(
        'system',
        'health_check',
        undefined,
        undefined,
        {
          status: result.status,
          responseTime: result.overallResponseTime,
          checks: Object.keys(result.checks).length,
        }
      );
    } catch (error) {
      console.error('Failed to send health check result:', error);
    }
  }

  /**
   * Фильтрация событий Sentry
   */
  private shouldFilterEvent(event: SentryEvent): boolean {
    // Фильтруем события от тестов
    if (event.tags?.environment === 'test') {
      return true;
    }

    // Фильтруем события от ботов
    if (event.user?.id?.includes('bot')) {
      return true;
    }

    return false;
  }

  /**
   * Отчет о проблемах производительности
   */
  private reportPerformanceIssue(type: string, value: number, context?: Record<string, unknown>): void {
    console.warn(`Performance issue detected: ${type}`, { value, context });

    // Отправляем в аналитику
    usageAnalyticsService.trackEvent(
      'performance',
      type,
      undefined,
      undefined,
      { value, context }
    );
  }

  /**
   * Получение текущих метрик
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Обновление конфигурации
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Остановка мониторинга
   */
  public stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

// Экспортируем функцию инициализации
export const initializeEnhancedMonitoring = (config: MonitoringConfig): EnhancedMonitoringService => {
  return EnhancedMonitoringService.getInstance(config);
};
