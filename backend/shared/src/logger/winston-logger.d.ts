/**
 * Boss AI Platform - Unified Winston Logger
 * Централизованное логирование с structured logging и ротацией
 */
import winston from "winston";
export type LogLevel = "error" | "warn" | "info" | "debug";
export interface LogContext {
    service?: string;
    userId?: string;
    requestId?: string;
    operation?: string;
    duration?: number;
    [key: string]: any;
}
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    service: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}
/**
 * Unified Logger для всех сервисов Boss AI Platform
 */
export declare class UnifiedLogger {
    private logger;
    private serviceName;
    constructor(serviceName: string, options?: {
        level?: LogLevel;
        logDir?: string;
        enableConsole?: boolean;
        enableFile?: boolean;
    });
    /**
     * Создание Winston logger с конфигурацией
     */
    private createLogger;
    /**
     * Логирование с контекстом
     */
    private log;
    /**
     * Debug level logging
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Info level logging
     */
    info(message: string, context?: LogContext): void;
    /**
     * Warning level logging
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Error level logging
     */
    error(message: string, error?: Error, context?: LogContext): void;
    /**
     * HTTP request logging
     */
    httpRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void;
    /**
     * Database operation logging
     */
    dbOperation(operation: string, table: string, duration: number, context?: LogContext): void;
    /**
     * API call logging
     */
    apiCall(service: string, endpoint: string, method: string, statusCode: number, duration: number, context?: LogContext): void;
    /**
     * Authentication logging
     */
    auth(action: string, userId?: string, success?: boolean, context?: LogContext): void;
    /**
     * Performance logging
     */
    performance(operation: string, duration: number, context?: LogContext): void;
    /**
     * Security logging
     */
    security(event: string, severity: "low" | "medium" | "high" | "critical", context?: LogContext): void;
    /**
     * Business logic logging
     */
    business(event: string, data?: any, context?: LogContext): void;
    /**
     * Получить Winston logger для прямого использования
     */
    getWinstonLogger(): winston.Logger;
    /**
     * Закрытие logger
     */
    close(): void;
}
/**
 * Создание logger для сервиса
 */
export declare function createLogger(serviceName: string, options?: {
    level?: LogLevel;
    logDir?: string;
    enableConsole?: boolean;
    enableFile?: boolean;
}): UnifiedLogger;
/**
 * Глобальные logger'ы для сервисов
 */
export declare const apiGatewayLogger: UnifiedLogger;
export declare const ozonManagerLogger: UnifiedLogger;
export default UnifiedLogger;
//# sourceMappingURL=winston-logger.d.ts.map