/**
 * Boss AI Platform - Unified Winston Logger
 * Централизованное логирование с structured logging и ротацией
 */

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

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
export class UnifiedLogger {
  private logger: winston.Logger;
  private serviceName: string;

  constructor(
    serviceName: string,
    options?: {
      level?: LogLevel;
      logDir?: string;
      enableConsole?: boolean;
      enableFile?: boolean;
    }
  ) {
    this.serviceName = serviceName;
    this.logger = this.createLogger(serviceName, options);
  }

  /**
   * Создание Winston logger с конфигурацией
   */
  private createLogger(
    serviceName: string,
    options: {
      level?: LogLevel;
      logDir?: string;
      enableConsole?: boolean;
      enableFile?: boolean;
    } = {}
  ): winston.Logger {
    const {
      level = "info",
      logDir = "./logs",
      enableConsole = true,
      enableFile = true,
    } = options;

    const transports: winston.transport[] = [];

    // Console transport
    if (enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.printf(
              ({ timestamp, level, message, service, context, error }: any) => {
                let logMessage = `[${timestamp}] ${level.toUpperCase()} [${service}] ${message}`;

                if (context && Object.keys(context).length > 0) {
                  logMessage += ` | Context: ${JSON.stringify(context)}`;
                }

                if (error) {
                  logMessage += ` | Error: ${error.name}: ${error.message}`;
                }

                return logMessage;
              }
            )
          ),
        })
      );
    }

    // File transports
    if (enableFile) {
      // Combined log file
      transports.push(
        new DailyRotateFile({
          filename: `${logDir}/${serviceName}-%DATE%.log`,
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "14d",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );

      // Error log file
      transports.push(
        new DailyRotateFile({
          filename: `${logDir}/${serviceName}-error-%DATE%.log`,
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "30d",
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );
    }

    return winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: serviceName },
      transports,
    });
  }

  /**
   * Логирование с контекстом
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    this.logger.log(level, message, { context, error });
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, context, error);
  }

  /**
   * HTTP request logging
   */
  httpRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info(`HTTP ${method} ${url}`, {
      ...context,
      operation: "http_request",
      method,
      url,
      statusCode,
      duration,
    });
  }

  /**
   * Database operation logging
   */
  dbOperation(
    operation: string,
    table: string,
    duration: number,
    context?: LogContext
  ): void {
    this.debug(`DB ${operation} on ${table}`, {
      ...context,
      operation: "db_operation",
      table,
      duration,
    });
  }

  /**
   * API call logging
   */
  apiCall(
    service: string,
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info(`API ${method} ${service}${endpoint}`, {
      ...context,
      operation: "api_call",
      service,
      endpoint,
      method,
      statusCode,
      duration,
    });
  }

  /**
   * Authentication logging
   */
  auth(
    action: string,
    userId?: string,
    success: boolean = true,
    context?: LogContext
  ): void {
    const level = success ? "info" : "warn";
    this.log(level, `Auth ${action}`, {
      ...context,
      operation: "auth",
      action,
      userId,
      success,
    });
  }

  /**
   * Performance logging
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      operation: "performance",
      duration,
    });
  }

  /**
   * Security logging
   */
  security(
    event: string,
    severity: "low" | "medium" | "high" | "critical",
    context?: LogContext
  ): void {
    const level =
      severity === "critical" || severity === "high" ? "error" : "warn";
    this.log(level, `Security: ${event}`, {
      ...context,
      operation: "security",
      severity,
    });
  }

  /**
   * Business logic logging
   */
  business(event: string, data?: any, context?: LogContext): void {
    this.info(`Business: ${event}`, {
      ...context,
      operation: "business",
      data,
    });
  }

  /**
   * Получить Winston logger для прямого использования
   */
  getWinstonLogger(): winston.Logger {
    return this.logger;
  }

  /**
   * Закрытие logger
   */
  close(): void {
    this.logger.close();
  }
}

/**
 * Создание logger для сервиса
 */
export function createLogger(
  serviceName: string,
  options?: {
    level?: LogLevel;
    logDir?: string;
    enableConsole?: boolean;
    enableFile?: boolean;
  }
): UnifiedLogger {
  return new UnifiedLogger(serviceName, options);
}

/**
 * Глобальные logger'ы для сервисов
 */
export const apiGatewayLogger = createLogger("api-gateway", {
  level: (process.env.LOG_LEVEL as LogLevel) || "info",
  logDir: "./logs",
});

export const ozonManagerLogger = createLogger("ozon-manager", {
  level: (process.env.LOG_LEVEL as LogLevel) || "info",
  logDir: "./logs",
});

export default UnifiedLogger;
