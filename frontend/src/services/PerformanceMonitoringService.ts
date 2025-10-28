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
  sampleRate: number; // 0-1, процент метрик для сбора
  maxMetricsPerSession: number;
  enableReporting: boolean;
  reportingEndpoint?: string;
  reportingInterval: number; // в миллисекундах
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

class PerformanceMonitoringService {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private sessionId: string;
  private observer: PerformanceObserver | null = null;
  private reportingInterval: NodeJS.Timeout | null = null;

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  /**
   * Инициализирует мониторинг производительности
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    // Навигационные метрики
    if (this.config.enableNavigationTiming) {
      this.collectNavigationMetrics();
    }

    // Ресурсные метрики
    if (this.config.enableResourceTiming) {
      this.setupResourceObserver();
    }

    // Paint метрики
    if (this.config.enablePaintTiming) {
      this.setupPaintObserver();
    }

    // Layout метрики
    if (this.config.enableLayoutTiming) {
      this.setupLayoutObserver();
    }

    // Script метрики
    if (this.config.enableScriptTiming) {
      this.setupScriptObserver();
    }

    // Настраиваем периодическую отправку отчетов
    if (this.config.enableReporting) {
      this.setupReporting();
    }
  }

  /**
   * Собирает навигационные метрики
   */
  private collectNavigationMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      const metrics: PerformanceMetric[] = [
        {
          id: this.generateMetricId(),
          name: 'DOMContentLoaded',
          value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          unit: 'ms',
          timestamp: new Date(),
          category: 'navigation'
        },
        {
          id: this.generateMetricId(),
          name: 'LoadComplete',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          unit: 'ms',
          timestamp: new Date(),
          category: 'navigation'
        },
        {
          id: this.generateMetricId(),
          name: 'FirstByte',
          value: navigation.responseStart - navigation.requestStart,
          unit: 'ms',
          timestamp: new Date(),
          category: 'navigation'
        },
        {
          id: this.generateMetricId(),
          name: 'DOMInteractive',
          value: navigation.domInteractive - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
          category: 'navigation'
        }
      ];

      this.addMetrics(metrics);
    }
  }

  /**
   * Настраивает наблюдатель за ресурсами
   */
  private setupResourceObserver(): void {
    if (!window.PerformanceObserver) {
      return;
    }

    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const metrics: PerformanceMetric[] = [];

      entries.forEach((entry) => {
        if (this.shouldSample()) {
          metrics.push({
            id: this.generateMetricId(),
            name: `Resource_${entry.name.split('/').pop()}`,
            value: entry.duration,
            unit: 'ms',
            timestamp: new Date(),
            category: 'resource',
            metadata: {
              resourceType: (entry as PerformanceResourceTiming).initiatorType || 'unknown',
              resourceSize: (entry as PerformanceResourceTiming).transferSize || 0
            }
          });
        }
      });

      this.addMetrics(metrics);
    });

    this.observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Настраивает наблюдатель за paint событиями
   */
  private setupPaintObserver(): void {
    if (!window.PerformanceObserver) {
      return;
    }

    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const metrics: PerformanceMetric[] = [];

      entries.forEach((entry) => {
        if (this.shouldSample()) {
          metrics.push({
            id: this.generateMetricId(),
            name: entry.name,
            value: entry.startTime,
            unit: 'ms',
            timestamp: new Date(),
            category: 'paint'
          });
        }
      });

      this.addMetrics(metrics);
    });

    paintObserver.observe({ entryTypes: ['paint'] });
  }

  /**
   * Настраивает наблюдатель за layout событиями
   */
  private setupLayoutObserver(): void {
    if (!window.PerformanceObserver) {
      return;
    }

    const layoutObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const metrics: PerformanceMetric[] = [];

      entries.forEach((entry) => {
        if (this.shouldSample()) {
          metrics.push({
            id: this.generateMetricId(),
            name: 'LayoutShift',
            value: (entry as PerformanceEntry & { value: number }).value,
            unit: 'count',
            timestamp: new Date(),
            category: 'layout',
            metadata: {
              hadRecentInput: (entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput
            }
          });
        }
      });

      this.addMetrics(metrics);
    });

    layoutObserver.observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Настраивает наблюдатель за script событиями
   */
  private setupScriptObserver(): void {
    if (!window.PerformanceObserver) {
      return;
    }

    const scriptObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const metrics: PerformanceMetric[] = [];

      entries.forEach((entry) => {
        if (this.shouldSample()) {
          metrics.push({
            id: this.generateMetricId(),
            name: 'ScriptExecution',
            value: entry.duration,
            unit: 'ms',
            timestamp: new Date(),
            category: 'script',
            metadata: {
              scriptName: entry.name
            }
          });
        }
      });

      this.addMetrics(metrics);
    });

    scriptObserver.observe({ entryTypes: ['measure', 'mark'] });
  }

  /**
   * Добавляет кастомную метрику
   */
  public addCustomMetric(name: string, value: number, unit: PerformanceMetric['unit'], metadata?: Record<string, unknown>): void {
    if (!this.config.enableCustomMetrics) {
      return;
    }

    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      name,
      value,
      unit,
      timestamp: new Date(),
      category: 'custom',
      metadata
    };

    this.addMetrics([metric]);
  }

  /**
   * Измеряет время выполнения функции
   */
  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    this.addCustomMetric(`Function_${name}`, end - start, 'ms');

    return result;
  }

  /**
   * Измеряет время выполнения асинхронной функции
   */
  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    this.addCustomMetric(`AsyncFunction_${name}`, end - start, 'ms');

    return result;
  }

  /**
   * Получает все метрики
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Получает метрики по категории
   */
  public getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.category === category);
  }

  /**
   * Получает метрики по имени
   */
  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Получает статистику производительности
   */
  public getPerformanceStats(): {
    totalMetrics: number;
    averageLoadTime: number;
    averageRenderTime: number;
    memoryUsage: number;
    slowestResources: PerformanceMetric[];
    fastestResources: PerformanceMetric[];
  } {
    const loadMetrics = this.getMetricsByName('LoadComplete');
    const renderMetrics = this.getMetricsByCategory('paint');
    const resourceMetrics = this.getMetricsByCategory('resource');

    const averageLoadTime = loadMetrics.length > 0
      ? loadMetrics.reduce((sum, metric) => sum + metric.value, 0) / loadMetrics.length
      : 0;

    const averageRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, metric) => sum + metric.value, 0) / renderMetrics.length
      : 0;

    const memoryUsage = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

    const sortedResources = resourceMetrics.sort((a, b) => a.value - b.value);
    const slowestResources = sortedResources.slice(-5);
    const fastestResources = sortedResources.slice(0, 5);

    return {
      totalMetrics: this.metrics.length,
      averageLoadTime,
      averageRenderTime,
      memoryUsage,
      slowestResources,
      fastestResources
    };
  }

  /**
   * Генерирует отчет о производительности
   */
  public generateReport(): PerformanceReport {
    const stats = this.getPerformanceStats();

    return {
      sessionId: this.sessionId,
      timestamp: new Date(),
      metrics: this.metrics,
      summary: {
        totalMetrics: stats.totalMetrics,
        averageLoadTime: stats.averageLoadTime,
        averageRenderTime: stats.averageRenderTime,
        memoryUsage: stats.memoryUsage,
        errorCount: 0 // TODO: Интеграция с ErrorHandlingService
      }
    };
  }

  /**
   * Очищает метрики
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Останавливает мониторинг
   */
  public stopMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
  }

  /**
   * Добавляет метрики
   */
  private addMetrics(metrics: PerformanceMetric[]): void {
    if (this.metrics.length >= this.config.maxMetricsPerSession) {
      return;
    }

    this.metrics.push(...metrics);
  }

  /**
   * Определяет, нужно ли собирать метрику
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Настраивает периодическую отправку отчетов
   */
  private setupReporting(): void {
    if (!this.config.reportingEndpoint) {
      return;
    }

    this.reportingInterval = setInterval(() => {
      const report = this.generateReport();
      this.sendReport(report);
    }, this.config.reportingInterval);
  }

  /**
   * Отправляет отчет на сервер
   */
  private async sendReport(report: PerformanceReport): Promise<void> {
    if (!this.config.reportingEndpoint) {
      return;
    }

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }

  /**
   * Генерирует ID сессии
   */
  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Генерирует ID метрики
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Создаем экземпляр сервиса
export const performanceMonitoringService = new PerformanceMonitoringService({
  enableNavigationTiming: true,
  enableResourceTiming: true,
  enablePaintTiming: true,
  enableLayoutTiming: true,
  enableScriptTiming: true,
  enableCustomMetrics: true,
  sampleRate: 0.1, // 10% метрик
  maxMetricsPerSession: 1000,
  enableReporting: false,
  reportingInterval: 60000 // 1 минута
});
