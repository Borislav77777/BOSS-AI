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
export abstract class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: ErrorContext;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: ErrorContext,
    isOperational: boolean = true
  ) {
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

/**
 * Ошибки валидации
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "VALIDATION_ERROR", 400, context);
  }
}

/**
 * Ошибки аутентификации
 */
export class AuthenticationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "AUTHENTICATION_ERROR", 401, context);
  }
}

/**
 * Ошибки авторизации (алиас для совместимости)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "UNAUTHORIZED_ERROR", 401, context);
  }
}

/**
 * Ошибки авторизации
 */
export class AuthorizationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "AUTHORIZATION_ERROR", 403, context);
  }
}

/**
 * Ошибки авторизации (алиас для совместимости)
 */
export class ForbiddenError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "FORBIDDEN_ERROR", 403, context);
  }
}

/**
 * Ошибки "не найдено"
 */
export class NotFoundError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "NOT_FOUND_ERROR", 404, context);
  }
}

/**
 * Ошибки конфликта
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "CONFLICT_ERROR", 409, context);
  }
}

/**
 * Ошибки rate limiting
 */
export class RateLimitError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "RATE_LIMIT_ERROR", 429, context);
  }
}

/**
 * Ошибки внешних сервисов
 */
export class ExternalServiceError extends AppError {
  constructor(message: string, service: string, context?: ErrorContext) {
    super(message, "EXTERNAL_SERVICE_ERROR", 502, { service, ...context });
  }
}

/**
 * Ошибки базы данных
 */
export class DatabaseError extends AppError {
  constructor(message: string, operation: string, context?: ErrorContext) {
    super(message, "DATABASE_ERROR", 500, { operation, ...context });
  }
}

/**
 * Внутренние ошибки сервера
 */
export class InternalServerError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "INTERNAL_SERVER_ERROR", 500, context);
  }
}

/**
 * Ошибки кэша
 */
export class CacheError extends AppError {
  constructor(message: string, operation: string, context?: ErrorContext) {
    super(message, "CACHE_ERROR", 500, { operation, ...context });
  }
}

/**
 * Ошибки конфигурации
 */
export class ConfigurationError extends AppError {
  constructor(message: string, configKey: string, context?: ErrorContext) {
    super(message, "CONFIGURATION_ERROR", 500, { configKey, ...context });
  }
}

/**
 * Ошибки Telegram Bot
 */
export class TelegramBotError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "TELEGRAM_BOT_ERROR", 500, context);
  }
}

/**
 * Ошибки Ozon API
 */
export class OzonAPIError extends AppError {
  constructor(
    message: string,
    endpoint: string,
    statusCode: number,
    context?: ErrorContext
  ) {
    super(message, "OZON_API_ERROR", statusCode, { endpoint, ...context });
  }
}

/**
 * Ошибки планировщика
 */
export class SchedulerError extends AppError {
  constructor(message: string, taskName: string, context?: ErrorContext) {
    super(message, "SCHEDULER_ERROR", 500, { taskName, ...context });
  }
}

/**
 * Ошибки WebSocket
 */
export class WebSocketError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "WEBSOCKET_ERROR", 500, context);
  }
}

/**
 * Ошибки файловой системы
 */
export class FileSystemError extends AppError {
  constructor(message: string, path: string, context?: ErrorContext) {
    super(message, "FILE_SYSTEM_ERROR", 500, { path, ...context });
  }
}

/**
 * Ошибки сети
 */
export class NetworkError extends AppError {
  constructor(message: string, url: string, context?: ErrorContext) {
    super(message, "NETWORK_ERROR", 500, { url, ...context });
  }
}

/**
 * Ошибки парсинга
 */
export class ParseError extends AppError {
  constructor(message: string, data: string, context?: ErrorContext) {
    super(message, "PARSE_ERROR", 400, { data, ...context });
  }
}

/**
 * Ошибки шифрования
 */
export class EncryptionError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "ENCRYPTION_ERROR", 500, context);
  }
}

/**
 * Ошибки JWT
 */
export class JWTError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "JWT_ERROR", 401, context);
  }
}

/**
 * Ошибки Redis
 */
export class RedisError extends AppError {
  constructor(message: string, operation: string, context?: ErrorContext) {
    super(message, "REDIS_ERROR", 500, { operation, ...context });
  }
}

/**
 * Утилиты для работы с ошибками
 */
export class ErrorUtils {
  /**
   * Проверка, является ли ошибка операционной
   */
  static isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Получение кода ошибки
   */
  static getErrorCode(error: Error): string {
    if (error instanceof AppError) {
      return error.code;
    }
    return "UNKNOWN_ERROR";
  }

  /**
   * Получение статус кода ошибки
   */
  static getStatusCode(error: Error): number {
    if (error instanceof AppError) {
      return error.statusCode;
    }
    return 500;
  }

  /**
   * Создание ошибки из другого типа ошибки
   */
  static wrapError(
    error: Error,
    message?: string,
    context?: ErrorContext
  ): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Fallback to InternalServerError to avoid instantiating abstract class
    return new InternalServerError(message || error.message, context);
  }

  /**
   * Логирование ошибки
   */
  static logError(error: Error, logger: any): void {
    if (error instanceof AppError) {
      logger.error(`[${error.code}] ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
        timestamp: error.timestamp,
        isOperational: error.isOperational,
      });
    } else {
      logger.error(`[UNKNOWN_ERROR] ${error.message}`, {
        name: error.name,
        stack: error.stack,
      });
    }
  }
}

export default AppError;
