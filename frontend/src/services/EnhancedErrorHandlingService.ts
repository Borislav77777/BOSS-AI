/**
 * Улучшенный сервис обработки ошибок
 * Включает централизованное логирование, retry механизмы и мониторинг
 */


export interface ErrorContext {
  component?: string;
  service?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: Error) => boolean;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByComponent: Record<string, number>;
  errorsByService: Record<string, number>;
  errorsByType: Record<string, number>;
  lastErrorTime: number;
  errorRate: number;
}

export interface CircuitBreaker {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
}

export class EnhancedErrorHandlingService {
  private static instance: EnhancedErrorHandlingService;
  private errorHandlers: Map<string, (error: Error, context: ErrorContext) => void> = new Map();
  private retryConfigs: Map<string, RetryConfig> = new Map();
  private errorMetrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByComponent: {},
    errorsByService: {},
    errorsByType: {},
    lastErrorTime: 0,
    errorRate: 0
  };
  private errorRateWindow: number[] = [];
  private readonly ERROR_RATE_WINDOW_SIZE = 100;
  private readonly ERROR_RATE_WINDOW_MS = 60000; // 1 минута

  private constructor() {
    this.setupDefaultRetryConfigs();
    this.startErrorRateCalculation();
  }

  public static getInstance(): EnhancedErrorHandlingService {
    if (!EnhancedErrorHandlingService.instance) {
      EnhancedErrorHandlingService.instance = new EnhancedErrorHandlingService();
    }
    return EnhancedErrorHandlingService.instance;
  }

  /**
   * Обработка ошибки с контекстом
   */
  public handleError(error: Error, context: ErrorContext = {}): void {
    const timestamp = Date.now();
    const enrichedContext: ErrorContext = {
      ...context,
      timestamp,
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };

    // Обновляем метрики
    this.updateErrorMetrics(error, enrichedContext);

    // Логируем ошибку
    this.logError(error, enrichedContext);

    // Отправляем в аналитику
    this.trackError(error, enrichedContext);

    // Вызываем зарегистрированные обработчики
    this.notifyErrorHandlers(error, enrichedContext);

    // Проверяем критичность ошибки
    if (this.isCriticalError(error)) {
      this.handleCriticalError(error, enrichedContext);
    }
  }

  /**
   * Регистрация обработчика ошибок
   */
  public registerErrorHandler(
    id: string,
    handler: (error: Error, context: ErrorContext) => void
  ): void {
    this.errorHandlers.set(id, handler);
  }

  /**
   * Удаление обработчика ошибок
   */
  public unregisterErrorHandler(id: string): void {
    this.errorHandlers.delete(id);
  }

  /**
   * Retry механизм с экспоненциальным backoff
   */
  public async retry<T>(
    operation: () => Promise<T>,
    operationId: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfigs.get(operationId), ...customConfig };
    if (!config) {
      throw new Error(`No retry config found for operation: ${operationId}`);
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= (config.maxRetries || 3); attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Проверяем условие retry
        if (config.retryCondition && !config.retryCondition(lastError)) {
          throw lastError;
        }

        // Если это последняя попытка, выбрасываем ошибку
        if (attempt === config.maxRetries) {
          throw lastError;
        }

        // Вычисляем задержку с экспоненциальным backoff
        const delay = Math.min(
          (config.baseDelay || 1000) * Math.pow(config.backoffMultiplier || 2, attempt),
          config.maxDelay || 10000
        );

        // Логируем retry
        this.logRetry(operationId, attempt + 1, delay, lastError);

        // Ждем перед следующей попыткой
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Circuit Breaker паттерн
   */
  public async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitId: string,
    failureThreshold: number = 5,
    timeout: number = 10000
  ): Promise<T> {
    const circuit = this.getCircuitBreaker(circuitId);

    if (circuit.state === 'OPEN') {
      if (Date.now() - circuit.lastFailureTime > timeout) {
        circuit.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker ${circuitId} is OPEN`);
      }
    }

    try {
      const result = await operation();

      if (circuit.state === 'HALF_OPEN') {
        circuit.state = 'CLOSED';
        circuit.failureCount = 0;
      }

      return result;
    } catch (error) {
      circuit.failureCount++;
      circuit.lastFailureTime = Date.now();

      if (circuit.failureCount >= failureThreshold) {
        circuit.state = 'OPEN';
      }

      throw error;
    }
  }

  /**
   * Получение метрик ошибок
   */
  public getErrorMetrics(): ErrorMetrics {
    return { ...this.errorMetrics };
  }

  /**
   * Сброс метрик
   */
  public resetMetrics(): void {
    this.errorMetrics = {
      totalErrors: 0,
      errorsByComponent: {},
      errorsByService: {},
      errorsByType: {},
      lastErrorTime: 0,
      errorRate: 0
    };
    this.errorRateWindow = [];
  }

  /**
   * Настройка retry конфигурации
   */
  public setRetryConfig(operationId: string, config: RetryConfig): void {
    this.retryConfigs.set(operationId, config);
  }

  private setupDefaultRetryConfigs(): void {
    // Конфигурация для API запросов
    this.setRetryConfig('api-request', {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryCondition: (error) => {
        return error.message.includes('timeout') ||
               error.message.includes('network') ||
               error.message.includes('5xx');
      }
    });

    // Конфигурация для загрузки сервисов
    this.setRetryConfig('service-load', {
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 2000,
      backoffMultiplier: 2,
      retryCondition: (error) => {
        return error.message.includes('load') ||
               error.message.includes('fetch');
      }
    });
  }

  private updateErrorMetrics(error: Error, context: ErrorContext): void {
    this.errorMetrics.totalErrors++;
    this.errorMetrics.lastErrorTime = context.timestamp || Date.now();

    // Обновляем счетчики по компонентам
    if (context.component) {
      this.errorMetrics.errorsByComponent[context.component] =
        (this.errorMetrics.errorsByComponent[context.component] || 0) + 1;
    }

    // Обновляем счетчики по сервисам
    if (context.service) {
      this.errorMetrics.errorsByService[context.service] =
        (this.errorMetrics.errorsByService[context.service] || 0) + 1;
    }

    // Обновляем счетчики по типам ошибок
    const errorType = error.constructor.name;
    this.errorMetrics.errorsByType[errorType] =
      (this.errorMetrics.errorsByType[errorType] || 0) + 1;

    // Обновляем окно для расчета error rate
    this.errorRateWindow.push(Date.now());
    this.cleanupErrorRateWindow();
    this.calculateErrorRate();
  }

  private cleanupErrorRateWindow(): void {
    const now = Date.now();
    this.errorRateWindow = this.errorRateWindow.filter(
      timestamp => now - timestamp < this.ERROR_RATE_WINDOW_MS
    );
  }

  private calculateErrorRate(): void {
    const now = Date.now();
    const recentErrors = this.errorRateWindow.filter(
      timestamp => now - timestamp < this.ERROR_RATE_WINDOW_MS
    );

    this.errorMetrics.errorRate = recentErrors.length / (this.ERROR_RATE_WINDOW_MS / 1000);
  }

  private startErrorRateCalculation(): void {
    setInterval(() => {
      this.cleanupErrorRateWindow();
      this.calculateErrorRate();
    }, 10000); // Обновляем каждые 10 секунд
  }

  private logError(error: Error, context: ErrorContext): void {
    try {
      import('./ErrorLoggingService').then(({ errorLoggingService }) => {
        errorLoggingService.logError(
          error,
          {
            componentStack: context.component,
            errorBoundary: context.service
          },
          context.metadata
        );
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private trackError(error: Error, context: ErrorContext): void {
    try {
      import('./UsageAnalyticsService').then(({ usageAnalyticsService }) => {
        usageAnalyticsService.trackError(
          error,
          context.component,
          context.service,
          context.metadata
        );
      });
    } catch (trackError) {
      console.error('Failed to track error:', trackError);
    }
  }

  private notifyErrorHandlers(error: Error, context: ErrorContext): void {
    this.errorHandlers.forEach((handler, id) => {
      try {
        handler(error, context);
      } catch (handlerError) {
        console.error(`Error in handler ${id}:`, handlerError);
      }
    });
  }

  private isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      'OutOfMemoryError',
      'StackOverflowError',
      'SecurityException',
      'AuthenticationError',
      'AuthorizationError'
    ];

    return criticalPatterns.some(pattern =>
      error.name.includes(pattern) || error.message.includes(pattern)
    );
  }

  private handleCriticalError(error: Error, context: ErrorContext): void {
    // Отправляем критическую ошибку в мониторинг
    import('./PerformanceMonitoringService').then(({ performanceMonitoringService }) => {
      performanceMonitoringService.addCustomMetric(
        'CriticalError',
        1,
        'count',
        { error: error.name, component: context.component }
      );
    });

    // Уведомляем пользователя о критической ошибке
    this.notifyUserOfCriticalError(error, context);
  }

  private notifyUserOfCriticalError(error: Error, context: ErrorContext): void {
    // Здесь можно добавить уведомление пользователя
    console.error('Critical error occurred:', error, context);
  }

  private logRetry(operationId: string, attempt: number, delay: number, error: Error): void {
    console.warn(`Retrying operation ${operationId}, attempt ${attempt}, delay ${delay}ms:`, error.message);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getSessionId(): string {
    return sessionStorage.getItem('sessionId') || 'unknown';
  }

  private getUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getCircuitBreaker(circuitId: string): CircuitBreaker {
    if (!this.circuitBreakers) {
      this.circuitBreakers = new Map();
    }

    if (!this.circuitBreakers.has(circuitId)) {
      this.circuitBreakers.set(circuitId, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: 0
      });
    }

    return this.circuitBreakers.get(circuitId)!;
  }

  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
}

// Экспортируем singleton
export const enhancedErrorHandlingService = EnhancedErrorHandlingService.getInstance();
