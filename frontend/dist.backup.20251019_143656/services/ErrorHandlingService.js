/**
 * Централизованный сервис обработки ошибок
 */
class ErrorHandlingService {
    constructor(config) {
        this.errorHandlers = [];
        this.errorCount = 0;
        this.errors = [];
        this.config = config;
        this.sessionId = this.generateSessionId();
        this.setupGlobalErrorHandlers();
    }
    /**
     * Регистрирует обработчик ошибок
     */
    registerErrorHandler(handler) {
        this.errorHandlers.push(handler);
    }
    /**
     * Удаляет обработчик ошибок
     */
    unregisterErrorHandler(handler) {
        const index = this.errorHandlers.indexOf(handler);
        if (index > -1) {
            this.errorHandlers.splice(index, 1);
        }
    }
    /**
     * Обрабатывает ошибку
     */
    handleError(error, context) {
        // Проверяем лимит ошибок
        if (this.errorCount >= this.config.maxErrorsPerSession) {
            return;
        }
        this.errorCount++;
        // Создаем информацию об ошибке
        const errorInfo = {
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
            }
            catch (handlerError) {
                console.error('Error in error handler:', handlerError);
            }
        });
    }
    /**
     * Обрабатывает промис-ошибки
     */
    handlePromiseRejection(event) {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        this.handleError(error, {
            component: 'Promise',
            action: 'rejection'
        });
    }
    /**
     * Обрабатывает ошибки ресурсов
     */
    handleResourceError(event) {
        const target = event.target;
        const error = new Error(`Failed to load resource: ${target.tagName}`);
        this.handleError(error, {
            component: 'Resource',
            action: 'load',
            metadata: {
                tagName: target.tagName,
                src: target.src || target.href
            }
        });
    }
    /**
     * Получает все ошибки
     */
    getErrors() {
        return [...this.errors];
    }
    /**
     * Получает ошибки по сервису
     */
    getErrorsByService(service) {
        return this.errors.filter(error => error.service === service);
    }
    /**
     * Получает ошибки по компоненту
     */
    getErrorsByComponent(component) {
        return this.errors.filter(error => error.component === component);
    }
    /**
     * Получает ошибки по серьезности
     */
    getErrorsBySeverity(severity) {
        return this.errors.filter(error => error.severity === severity);
    }
    /**
     * Очищает ошибки
     */
    clearErrors() {
        this.errors = [];
        this.errorCount = 0;
    }
    /**
     * Получает статистику ошибок
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            bySeverity: {},
            byService: {},
            byComponent: {}
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
    setupGlobalErrorHandlers() {
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
    determineSeverity(error, context) {
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
    logToConsole(errorInfo, context) {
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
    notifyUser(errorInfo) {
        // Показываем уведомление только для критических ошибок
        if (errorInfo.severity === 'critical') {
            // Здесь можно интегрировать с NotificationService
            console.warn('Critical error occurred:', errorInfo.message);
        }
    }
    /**
     * Отправляет ошибку на удаленный сервер
     */
    async reportToRemote(errorInfo) {
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
        }
        catch (error) {
            console.error('Failed to report error to remote server:', error);
        }
    }
    /**
     * Генерирует ID сессии
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Генерирует ID ошибки
     */
    generateErrorId() {
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
//# sourceMappingURL=ErrorHandlingService.js.map