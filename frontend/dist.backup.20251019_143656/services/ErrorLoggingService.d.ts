/**
 * Сервис для логирования и отслеживания ошибок
 */
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
declare class ErrorLoggingService {
    private errors;
    private readonly maxErrors;
    private readonly retentionDays;
    constructor();
    /**
     * Логирует ошибку
     */
    logError(error: Error, errorInfo?: {
        componentStack?: string;
        errorBoundary?: string;
        props?: any;
        state?: any;
    }, metadata?: Record<string, any>): string;
    /**
     * Получает статистику ошибок
     */
    getErrorStats(): ErrorStats;
    /**
     * Получает все ошибки
     */
    getAllErrors(): ErrorLogEntry[];
    /**
     * Очищает все ошибки
     */
    clearErrors(): void;
    /**
     * Экспортирует ошибки в JSON
     */
    exportErrors(): string;
    private generateErrorId;
    private determineErrorType;
    private determineErrorCode;
    private getCurrentUserId;
    private trimErrors;
    private cleanupOldErrors;
    private loadErrorsFromStorage;
    private saveErrorsToStorage;
    private sendToExternalService;
}
export declare const errorLoggingService: ErrorLoggingService;
export {};
//# sourceMappingURL=ErrorLoggingService.d.ts.map