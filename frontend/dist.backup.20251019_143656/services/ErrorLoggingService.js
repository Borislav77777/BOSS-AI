/**
 * Сервис для логирования и отслеживания ошибок
 */
import { ERRORS } from '@/constants/errors';
class ErrorLoggingService {
    constructor() {
        this.errors = [];
        this.maxErrors = ERRORS.LOGGING.MAX_ERRORS_IN_STORAGE;
        this.retentionDays = ERRORS.LOGGING.ERROR_RETENTION_DAYS;
        this.loadErrorsFromStorage();
        this.cleanupOldErrors();
    }
    /**
     * Логирует ошибку
     */
    logError(error, errorInfo, metadata) {
        const errorEntry = {
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
    getErrorStats() {
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - this.retentionDays * 24 * 60 * 60 * 1000);
        const recentErrors = this.errors.filter(error => error.timestamp >= cutoffDate);
        const errorsByType = recentErrors.reduce((acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
        }, {});
        const errorsByCode = recentErrors.reduce((acc, error) => {
            acc[error.code] = (acc[error.code] || 0) + 1;
            return acc;
        }, {});
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
    getAllErrors() {
        return [...this.errors];
    }
    /**
     * Очищает все ошибки
     */
    clearErrors() {
        this.errors = [];
        this.saveErrorsToStorage();
    }
    /**
     * Экспортирует ошибки в JSON
     */
    exportErrors() {
        return JSON.stringify(this.errors, null, 2);
    }
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    determineErrorType(error) {
        if (error.name === 'TypeError')
            return ERRORS.TYPES.CLIENT;
        if (error.name === 'ReferenceError')
            return ERRORS.TYPES.CLIENT;
        if (error.name === 'NetworkError')
            return ERRORS.TYPES.NETWORK;
        if (error.message.includes('fetch'))
            return ERRORS.TYPES.NETWORK;
        if (error.message.includes('auth'))
            return ERRORS.TYPES.AUTHENTICATION;
        if (error.message.includes('permission'))
            return ERRORS.TYPES.AUTHORIZATION;
        return ERRORS.TYPES.UNKNOWN;
    }
    determineErrorCode(error) {
        if (error.message.includes('timeout'))
            return ERRORS.CODES.NETWORK_TIMEOUT;
        if (error.message.includes('offline'))
            return ERRORS.CODES.NETWORK_OFFLINE;
        if (error.message.includes('file'))
            return ERRORS.CODES.FILE_UPLOAD_FAILED;
        if (error.message.includes('message'))
            return ERRORS.CODES.MESSAGE_SEND_FAILED;
        return ERRORS.CODES.INVALID_INPUT;
    }
    getCurrentUserId() {
        try {
            const user = localStorage.getItem('barsukov-user');
            return user ? JSON.parse(user).id : undefined;
        }
        catch {
            return undefined;
        }
    }
    trimErrors() {
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }
    }
    cleanupOldErrors() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
        this.errors = this.errors.filter(error => error.timestamp >= cutoffDate);
        this.saveErrorsToStorage();
    }
    loadErrorsFromStorage() {
        try {
            const stored = localStorage.getItem('barsukov-error-log');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.errors = parsed.map((error) => ({
                    ...error,
                    timestamp: new Date(error.timestamp),
                }));
            }
        }
        catch (error) {
            console.warn('Failed to load errors from storage:', error);
        }
    }
    saveErrorsToStorage() {
        try {
            localStorage.setItem('barsukov-error-log', JSON.stringify(this.errors));
        }
        catch (error) {
            console.warn('Failed to save errors to storage:', error);
        }
    }
    sendToExternalService(_errorEntry) {
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
//# sourceMappingURL=ErrorLoggingService.js.map