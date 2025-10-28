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
declare class ErrorHandlingService {
    private config;
    private errorHandlers;
    private errorCount;
    private sessionId;
    private errors;
    constructor(config: ErrorReportingConfig);
    /**
     * Регистрирует обработчик ошибок
     */
    registerErrorHandler(handler: ErrorHandler): void;
    /**
     * Удаляет обработчик ошибок
     */
    unregisterErrorHandler(handler: ErrorHandler): void;
    /**
     * Обрабатывает ошибку
     */
    handleError(error: Error, context?: ErrorContext): void;
    /**
     * Обрабатывает промис-ошибки
     */
    handlePromiseRejection(event: PromiseRejectionEvent): void;
    /**
     * Обрабатывает ошибки ресурсов
     */
    handleResourceError(event: Event): void;
    /**
     * Получает все ошибки
     */
    getErrors(): ErrorInfo[];
    /**
     * Получает ошибки по сервису
     */
    getErrorsByService(service: string): ErrorInfo[];
    /**
     * Получает ошибки по компоненту
     */
    getErrorsByComponent(component: string): ErrorInfo[];
    /**
     * Получает ошибки по серьезности
     */
    getErrorsBySeverity(severity: ErrorInfo['severity']): ErrorInfo[];
    /**
     * Очищает ошибки
     */
    clearErrors(): void;
    /**
     * Получает статистику ошибок
     */
    getErrorStats(): {
        total: number;
        bySeverity: Record<string, number>;
        byService: Record<string, number>;
        byComponent: Record<string, number>;
    };
    /**
     * Настраивает глобальные обработчики ошибок
     */
    private setupGlobalErrorHandlers;
    /**
     * Определяет серьезность ошибки
     */
    private determineSeverity;
    /**
     * Логирует в консоль
     */
    private logToConsole;
    /**
     * Уведомляет пользователя
     */
    private notifyUser;
    /**
     * Отправляет ошибку на удаленный сервер
     */
    private reportToRemote;
    /**
     * Генерирует ID сессии
     */
    private generateSessionId;
    /**
     * Генерирует ID ошибки
     */
    private generateErrorId;
}
export declare const errorHandlingService: ErrorHandlingService;
export {};
//# sourceMappingURL=ErrorHandlingService.d.ts.map