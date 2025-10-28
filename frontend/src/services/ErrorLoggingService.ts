/**
 * Сервис для логирования и отслеживания ошибок
 */

import { ERRORS } from '@/constants/errors';

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  type: string;
  code: string;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByCode: Record<string, number>;
  recentErrors: ErrorLogEntry[];
}

class ErrorLoggingService {
  private errors: ErrorLogEntry[] = [];
  private readonly maxErrors = ERRORS.LOGGING.MAX_ERRORS_IN_STORAGE;
  private readonly retentionDays = ERRORS.LOGGING.ERROR_RETENTION_DAYS;

  constructor() {
    this.loadErrorsFromStorage();
    this.cleanupOldErrors();
  }

  /**
   * Логирует ошибку
   */
  logError(
    error: Error,
    errorInfo?: {
      componentStack?: string;
      errorBoundary?: string;
      props?: any;
      state?: any;
    },
    metadata?: Record<string, any>
  ): string {
    const errorEntry: ErrorLogEntry = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      type: this.determineErrorType(error),
      code: this.determineErrorCode(error),
      message: error.message || ERRORS.MESSAGES.GENERIC,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      metadata: {
        ...metadata,
        errorBoundary: errorInfo?.errorBoundary,
        props: errorInfo?.props,
        state: errorInfo?.state,
      },
    };

    this.errors.unshift(errorEntry);
    this.trimErrors();
    this.saveErrorsToStorage();

    // Отправляем в внешний сервис мониторинга (если настроен)
    this.sendToExternalService(errorEntry);

    console.error('Error logged:', errorEntry);
    return errorEntry.id;
  }

  /**
   * Получает статистику ошибок
   */
  getErrorStats(): ErrorStats {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - this.retentionDays * 24 * 60 * 60 * 1000);

    const recentErrors = this.errors.filter(error => error.timestamp >= cutoffDate);

    const errorsByType = recentErrors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsByCode = recentErrors.reduce((acc, error) => {
      acc[error.code] = (acc[error.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: recentErrors.length,
      errorsByType,
      errorsByCode,
      recentErrors: recentErrors.slice(0, 10), // Последние 10 ошибок
    };
  }

  /**
   * Получает все ошибки
   */
  getAllErrors(): ErrorLogEntry[] {
    return [...this.errors];
  }

  /**
   * Очищает все ошибки
   */
  clearErrors(): void {
    this.errors = [];
    this.saveErrorsToStorage();
  }

  /**
   * Экспортирует ошибки в JSON
   */
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineErrorType(error: Error): string {
    if (error.name === 'TypeError') return ERRORS.TYPES.CLIENT;
    if (error.name === 'ReferenceError') return ERRORS.TYPES.CLIENT;
    if (error.name === 'NetworkError') return ERRORS.TYPES.NETWORK;
    if (error.message.includes('fetch')) return ERRORS.TYPES.NETWORK;
    if (error.message.includes('auth')) return ERRORS.TYPES.AUTHENTICATION;
    if (error.message.includes('permission')) return ERRORS.TYPES.AUTHORIZATION;
    return ERRORS.TYPES.UNKNOWN;
  }

  private determineErrorCode(error: Error): string {
    if (error.message.includes('timeout')) return ERRORS.CODES.NETWORK_TIMEOUT;
    if (error.message.includes('offline')) return ERRORS.CODES.NETWORK_OFFLINE;
    if (error.message.includes('file')) return ERRORS.CODES.FILE_UPLOAD_FAILED;
    if (error.message.includes('message')) return ERRORS.CODES.MESSAGE_SEND_FAILED;
    return ERRORS.CODES.INVALID_INPUT;
  }

  private getCurrentUserId(): string | undefined {
    try {
      const user = localStorage.getItem('barsukov-user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  private trimErrors(): void {
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
  }

  private cleanupOldErrors(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    this.errors = this.errors.filter(error => error.timestamp >= cutoffDate);
    this.saveErrorsToStorage();
  }

  private loadErrorsFromStorage(): void {
    try {
      const stored = localStorage.getItem('barsukov-error-log');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.errors = parsed.map((error: any) => ({
          ...error,
          timestamp: new Date(error.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to load errors from storage:', error);
    }
  }

  private saveErrorsToStorage(): void {
    try {
      localStorage.setItem('barsukov-error-log', JSON.stringify(this.errors));
    } catch (error) {
      console.warn('Failed to save errors to storage:', error);
    }
  }

  private sendToExternalService(_errorEntry: ErrorLogEntry): void {
    // Здесь можно добавить интеграцию с внешними сервисами мониторинга
    // Например, Sentry, LogRocket, Bugsnag и т.д.

    // Пример для Sentry:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(new Error(errorEntry.message), {
    //     extra: errorEntry.metadata,
    //     tags: {
    //       errorType: errorEntry.type,
    //       errorCode: errorEntry.code,
    //     },
    //   });
    // }
  }
}

export const errorLoggingService = new ErrorLoggingService();
