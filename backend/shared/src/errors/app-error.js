"use strict";
/**
 * Boss AI Platform - Custom Error Classes
 * Централизованные error classes для всего приложения
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorUtils = exports.RedisError = exports.JWTError = exports.EncryptionError = exports.ParseError = exports.NetworkError = exports.FileSystemError = exports.WebSocketError = exports.SchedulerError = exports.OzonAPIError = exports.TelegramBotError = exports.ConfigurationError = exports.CacheError = exports.InternalServerError = exports.DatabaseError = exports.ExternalServiceError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.AuthorizationError = exports.UnauthorizedError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
/**
 * Базовый класс для всех ошибок приложения
 */
class AppError extends Error {
    constructor(message, code, statusCode = 500, context, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
        this.timestamp = new Date().toISOString();
        this.isOperational = isOperational;
        // Устанавливаем prototype для правильного наследования
        Object.setPrototypeOf(this, new.target.prototype);
        // Сохраняем stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    /**
     * Сериализация ошибки для логирования
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            context: this.context,
            timestamp: this.timestamp,
            isOperational: this.isOperational,
            stack: this.stack,
        };
    }
}
exports.AppError = AppError;
/**
 * Ошибки валидации
 */
class ValidationError extends AppError {
    constructor(message, context) {
        super(message, "VALIDATION_ERROR", 400, context);
    }
}
exports.ValidationError = ValidationError;
/**
 * Ошибки аутентификации
 */
class AuthenticationError extends AppError {
    constructor(message, context) {
        super(message, "AUTHENTICATION_ERROR", 401, context);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Ошибки авторизации (алиас для совместимости)
 */
class UnauthorizedError extends AppError {
    constructor(message, context) {
        super(message, "UNAUTHORIZED_ERROR", 401, context);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * Ошибки авторизации
 */
class AuthorizationError extends AppError {
    constructor(message, context) {
        super(message, "AUTHORIZATION_ERROR", 403, context);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Ошибки авторизации (алиас для совместимости)
 */
class ForbiddenError extends AppError {
    constructor(message, context) {
        super(message, "FORBIDDEN_ERROR", 403, context);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * Ошибки "не найдено"
 */
class NotFoundError extends AppError {
    constructor(message, context) {
        super(message, "NOT_FOUND_ERROR", 404, context);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Ошибки конфликта
 */
class ConflictError extends AppError {
    constructor(message, context) {
        super(message, "CONFLICT_ERROR", 409, context);
    }
}
exports.ConflictError = ConflictError;
/**
 * Ошибки rate limiting
 */
class RateLimitError extends AppError {
    constructor(message, context) {
        super(message, "RATE_LIMIT_ERROR", 429, context);
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Ошибки внешних сервисов
 */
class ExternalServiceError extends AppError {
    constructor(message, service, context) {
        super(message, "EXTERNAL_SERVICE_ERROR", 502, { service, ...context });
    }
}
exports.ExternalServiceError = ExternalServiceError;
/**
 * Ошибки базы данных
 */
class DatabaseError extends AppError {
    constructor(message, operation, context) {
        super(message, "DATABASE_ERROR", 500, { operation, ...context });
    }
}
exports.DatabaseError = DatabaseError;
/**
 * Внутренние ошибки сервера
 */
class InternalServerError extends AppError {
    constructor(message, context) {
        super(message, "INTERNAL_SERVER_ERROR", 500, context);
    }
}
exports.InternalServerError = InternalServerError;
/**
 * Ошибки кэша
 */
class CacheError extends AppError {
    constructor(message, operation, context) {
        super(message, "CACHE_ERROR", 500, { operation, ...context });
    }
}
exports.CacheError = CacheError;
/**
 * Ошибки конфигурации
 */
class ConfigurationError extends AppError {
    constructor(message, configKey, context) {
        super(message, "CONFIGURATION_ERROR", 500, { configKey, ...context });
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * Ошибки Telegram Bot
 */
class TelegramBotError extends AppError {
    constructor(message, context) {
        super(message, "TELEGRAM_BOT_ERROR", 500, context);
    }
}
exports.TelegramBotError = TelegramBotError;
/**
 * Ошибки Ozon API
 */
class OzonAPIError extends AppError {
    constructor(message, endpoint, statusCode, context) {
        super(message, "OZON_API_ERROR", statusCode, { endpoint, ...context });
    }
}
exports.OzonAPIError = OzonAPIError;
/**
 * Ошибки планировщика
 */
class SchedulerError extends AppError {
    constructor(message, taskName, context) {
        super(message, "SCHEDULER_ERROR", 500, { taskName, ...context });
    }
}
exports.SchedulerError = SchedulerError;
/**
 * Ошибки WebSocket
 */
class WebSocketError extends AppError {
    constructor(message, context) {
        super(message, "WEBSOCKET_ERROR", 500, context);
    }
}
exports.WebSocketError = WebSocketError;
/**
 * Ошибки файловой системы
 */
class FileSystemError extends AppError {
    constructor(message, path, context) {
        super(message, "FILE_SYSTEM_ERROR", 500, { path, ...context });
    }
}
exports.FileSystemError = FileSystemError;
/**
 * Ошибки сети
 */
class NetworkError extends AppError {
    constructor(message, url, context) {
        super(message, "NETWORK_ERROR", 500, { url, ...context });
    }
}
exports.NetworkError = NetworkError;
/**
 * Ошибки парсинга
 */
class ParseError extends AppError {
    constructor(message, data, context) {
        super(message, "PARSE_ERROR", 400, { data, ...context });
    }
}
exports.ParseError = ParseError;
/**
 * Ошибки шифрования
 */
class EncryptionError extends AppError {
    constructor(message, context) {
        super(message, "ENCRYPTION_ERROR", 500, context);
    }
}
exports.EncryptionError = EncryptionError;
/**
 * Ошибки JWT
 */
class JWTError extends AppError {
    constructor(message, context) {
        super(message, "JWT_ERROR", 401, context);
    }
}
exports.JWTError = JWTError;
/**
 * Ошибки Redis
 */
class RedisError extends AppError {
    constructor(message, operation, context) {
        super(message, "REDIS_ERROR", 500, { operation, ...context });
    }
}
exports.RedisError = RedisError;
/**
 * Утилиты для работы с ошибками
 */
class ErrorUtils {
    /**
     * Проверка, является ли ошибка операционной
     */
    static isOperationalError(error) {
        if (error instanceof AppError) {
            return error.isOperational;
        }
        return false;
    }
    /**
     * Получение кода ошибки
     */
    static getErrorCode(error) {
        if (error instanceof AppError) {
            return error.code;
        }
        return "UNKNOWN_ERROR";
    }
    /**
     * Получение статус кода ошибки
     */
    static getStatusCode(error) {
        if (error instanceof AppError) {
            return error.statusCode;
        }
        return 500;
    }
    /**
     * Создание ошибки из другого типа ошибки
     */
    static wrapError(error, message, context) {
        if (error instanceof AppError) {
            return error;
        }
        return new AppError(message || error.message, "WRAPPED_ERROR", 500, context, false);
    }
    /**
     * Логирование ошибки
     */
    static logError(error, logger) {
        if (error instanceof AppError) {
            logger.error(`[${error.code}] ${error.message}`, {
                code: error.code,
                statusCode: error.statusCode,
                context: error.context,
                timestamp: error.timestamp,
                isOperational: error.isOperational,
            });
        }
        else {
            logger.error(`[UNKNOWN_ERROR] ${error.message}`, {
                name: error.name,
                stack: error.stack,
            });
        }
    }
}
exports.ErrorUtils = ErrorUtils;
exports.default = AppError;
//# sourceMappingURL=app-error.js.map