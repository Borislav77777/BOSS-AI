/**
 * Централизованный сервис обработки ошибок
 */

export interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  component?: string;
  service?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

export interface ErrorContext {
  component?: string;
  service?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorHandler {
  (error: Error, context?: ErrorContext): void;
}

export interface ErrorReportingConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  enableUserNotifications: boolean;
  enableErrorBoundary: boolean;
  maxErrorsPerSession: number;
  remoteEndpoint?: string;
  apiKey?: string;
}

class ErrorHandlingService {
  private config: ErrorReportingConfig;
  private errorHandlers: ErrorHandler[] = [];
  private errorCount = 0;
  private sessionId: string;
  private errors: ErrorInfo[] = [];

  constructor(config: ErrorReportingConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Регистрирует обработчик ошибок
   */
  public registerErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Удаляет обработчик ошибок
   */
  public unregisterErrorHandler(handler: ErrorHandler): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  /**
   * Обрабатывает ошибку
   */
  public handleError(error: Error, context?: ErrorContext): void {
    // Проверяем лимит ошибок
    if (this.errorCount >= this.config.maxErrorsPerSession) {
      return;
    }

    this.errorCount++;

    // Создаем информацию об ошибке
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      component: context?.component,
      service: context?.service,
      timestamp: new Date(),
      severity: this.determineSeverity(error, context),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context?.userId,
      sessionId: this.sessionId
    };

    // Сохраняем ошибку
    this.errors.push(errorInfo);

    // Консольное логирование
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorInfo, context);
    }

    // Уведомления пользователя
    if (this.config.enableUserNotifications) {
      this.notifyUser(errorInfo);
    }

    // Удаленное логирование
    if (this.config.enableRemoteLogging) {
      this.reportToRemote(errorInfo);
    }

    // Вызываем зарегистрированные обработчики
    this.errorHandlers.forEach(handler => {
      try {
        handler(error, context);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  /**
   * Обрабатывает промис-ошибки
   */
  public handlePromiseRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    this.handleError(error, {
      component: 'Promise',
      action: 'rejection'
    });
  }

  /**
   * Обрабатывает ошибки ресурсов
   */
  public handleResourceError(event: Event): void {
    const target = event.target as HTMLElement;
    const error = new Error(`Failed to load resource: ${target.tagName}`);
    this.handleError(error, {
      component: 'Resource',
      action: 'load',
      metadata: {
        tagName: target.tagName,
        src: (target as HTMLImageElement).src || (target as HTMLLinkElement).href
      }
    });
  }

  /**
   * Получает все ошибки
   */
  public getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  /**
   * Получает ошибки по сервису
   */
  public getErrorsByService(service: string): ErrorInfo[] {
    return this.errors.filter(error => error.service === service);
  }

  /**
   * Получает ошибки по компоненту
   */
  public getErrorsByComponent(component: string): ErrorInfo[] {
    return this.errors.filter(error => error.component === component);
  }

  /**
   * Получает ошибки по серьезности
   */
  public getErrorsBySeverity(severity: ErrorInfo['severity']): ErrorInfo[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Очищает ошибки
   */
  public clearErrors(): void {
    this.errors = [];
    this.errorCount = 0;
  }

  /**
   * Получает статистику ошибок
   */
  public getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byService: Record<string, number>;
    byComponent: Record<string, number>;
  } {
    const stats = {
      total: this.errors.length,
      bySeverity: {} as Record<string, number>,
      byService: {} as Record<string, number>,
      byComponent: {} as Record<string, number>
    };

    this.errors.forEach(error => {
      // По серьезности
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;

      // По сервису
      if (error.service) {
        stats.byService[error.service] = (stats.byService[error.service] || 0) + 1;
      }

      // По компоненту
      if (error.component) {
        stats.byComponent[error.component] = (stats.byComponent[error.component] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Настраивает глобальные обработчики ошибок
   */
  private setupGlobalErrorHandlers(): void {
    if (this.config.enableErrorBoundary) {
      // Обработка необработанных ошибок
      window.addEventListener('error', (event) => {
        this.handleError(event.error, {
          component: 'Global',
          action: 'unhandled'
        });
      });

      // Обработка отклоненных промисов
      window.addEventListener('unhandledrejection', (event) => {
        this.handlePromiseRejection(event);
      });

      // Обработка ошибок ресурсов
      window.addEventListener('error', (event) => {
        if (event.target !== window) {
          this.handleResourceError(event);
        }
      }, true);
    }
  }

  /**
   * Определяет серьезность ошибки
   */
  private determineSeverity(error: Error, context?: ErrorContext): ErrorInfo['severity'] {
    // Критические ошибки
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'critical';
    }

    // Высокая серьезность для ошибок сервисов
    if (context?.service) {
      return 'high';
    }

    // Средняя серьезность для ошибок компонентов
    if (context?.component) {
      return 'medium';
    }

    // Низкая серьезность по умолчанию
    return 'low';
  }

  /**
   * Логирует в консоль
   */
  private logToConsole(errorInfo: ErrorInfo, context?: ErrorContext): void {
    const logMessage = `[ErrorHandlingService] ${errorInfo.severity.toUpperCase()}: ${errorInfo.message}`;

    switch (errorInfo.severity) {
      case 'critical':
        console.error(logMessage, errorInfo, context);
        break;
      case 'high':
        console.error(logMessage, errorInfo, context);
        break;
      case 'medium':
        console.warn(logMessage, errorInfo, context);
        break;
      case 'low':
        console.info(logMessage, errorInfo, context);
        break;
    }
  }

  /**
   * Уведомляет пользователя
   */
  private notifyUser(errorInfo: ErrorInfo): void {
    // Показываем уведомление только для критических ошибок
    if (errorInfo.severity === 'critical') {
      // Здесь можно интегрировать с NotificationService
      console.warn('Critical error occurred:', errorInfo.message);
    }
  }

  /**
   * Отправляет ошибку на удаленный сервер
   */
  private async reportToRemote(errorInfo: ErrorInfo): Promise<void> {
    if (!this.config.remoteEndpoint || !this.config.apiKey) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (error) {
      console.error('Failed to report error to remote server:', error);
    }
  }

  /**
   * Генерирует ID сессии
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Генерирует ID ошибки
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Создаем экземпляр сервиса
export const errorHandlingService = new ErrorHandlingService({
  enableConsoleLogging: true,
  enableRemoteLogging: false,
  enableUserNotifications: true,
  enableErrorBoundary: true,
  maxErrorsPerSession: 100
});
