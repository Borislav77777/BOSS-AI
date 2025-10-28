/**
 * Boss AI Platform - Custom Error Classes
 * Централизованные error classes для всего приложения
 */
export interface ErrorContext {
    userId?: string;
    requestId?: string;
    service?: string;
    operation?: string;
    [key: string]: any;
}
/**
 * Базовый класс для всех ошибок приложения
 */
export declare abstract class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly context?: ErrorContext;
    readonly timestamp: string;
    readonly isOperational: boolean;
    constructor(message: string, code: string, statusCode?: number, context?: ErrorContext, isOperational?: boolean);
    /**
     * Сериализация ошибки для логирования
     */
    toJSON(): {
        name: string;
        message: string;
        code: string;
        statusCode: number;
        context: ErrorContext | undefined;
        timestamp: string;
        isOperational: boolean;
        stack: string | undefined;
    };
}
/**
 * Ошибки валидации
 */
export declare class ValidationError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки аутентификации
 */
export declare class AuthenticationError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки авторизации (алиас для совместимости)
 */
export declare class UnauthorizedError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки авторизации
 */
export declare class AuthorizationError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки авторизации (алиас для совместимости)
 */
export declare class ForbiddenError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки "не найдено"
 */
export declare class NotFoundError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки конфликта
 */
export declare class ConflictError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки rate limiting
 */
export declare class RateLimitError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки внешних сервисов
 */
export declare class ExternalServiceError extends AppError {
    constructor(message: string, service: string, context?: ErrorContext);
}
/**
 * Ошибки базы данных
 */
export declare class DatabaseError extends AppError {
    constructor(message: string, operation: string, context?: ErrorContext);
}
/**
 * Внутренние ошибки сервера
 */
export declare class InternalServerError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки кэша
 */
export declare class CacheError extends AppError {
    constructor(message: string, operation: string, context?: ErrorContext);
}
/**
 * Ошибки конфигурации
 */
export declare class ConfigurationError extends AppError {
    constructor(message: string, configKey: string, context?: ErrorContext);
}
/**
 * Ошибки Telegram Bot
 */
export declare class TelegramBotError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки Ozon API
 */
export declare class OzonAPIError extends AppError {
    constructor(message: string, endpoint: string, statusCode: number, context?: ErrorContext);
}
/**
 * Ошибки планировщика
 */
export declare class SchedulerError extends AppError {
    constructor(message: string, taskName: string, context?: ErrorContext);
}
/**
 * Ошибки WebSocket
 */
export declare class WebSocketError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки файловой системы
 */
export declare class FileSystemError extends AppError {
    constructor(message: string, path: string, context?: ErrorContext);
}
/**
 * Ошибки сети
 */
export declare class NetworkError extends AppError {
    constructor(message: string, url: string, context?: ErrorContext);
}
/**
 * Ошибки парсинга
 */
export declare class ParseError extends AppError {
    constructor(message: string, data: string, context?: ErrorContext);
}
/**
 * Ошибки шифрования
 */
export declare class EncryptionError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки JWT
 */
export declare class JWTError extends AppError {
    constructor(message: string, context?: ErrorContext);
}
/**
 * Ошибки Redis
 */
export declare class RedisError extends AppError {
    constructor(message: string, operation: string, context?: ErrorContext);
}
/**
 * Утилиты для работы с ошибками
 */
export declare class ErrorUtils {
    /**
     * Проверка, является ли ошибка операционной
     */
    static isOperationalError(error: Error): boolean;
    /**
     * Получение кода ошибки
     */
    static getErrorCode(error: Error): string;
    /**
     * Получение статус кода ошибки
     */
    static getStatusCode(error: Error): number;
    /**
     * Создание ошибки из другого типа ошибки
     */
    static wrapError(error: Error, message?: string, context?: ErrorContext): AppError;
    /**
     * Логирование ошибки
     */
    static logError(error: Error, logger: any): void;
}
export default AppError;
//# sourceMappingURL=app-error.d.ts.map