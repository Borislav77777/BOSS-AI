import winston from 'winston';
import { ApiRequest } from '../types';

/**
 * Система логирования для Ozon Manager
 * Портировано из Python logger.py
 */
export class Logger {
  private winston: winston.Logger;

  constructor() {
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'ozon-manager' },
      transports: [
        new winston.transports.File({
          filename: process.env.LOG_FILE || './logs/ozon_manager.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  error(message: string, error?: Error | any, meta?: any): void {
    if (error instanceof Error) {
      this.winston.error(message, { error: error.stack, ...meta });
    } else {
      this.winston.error(message, { error, ...meta });
    }
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  // Aliases for backward compatibility
  logInfo(message: string, meta?: any): void {
    this.info(message, meta);
  }

  logError(message: string, error?: Error, meta?: any): void {
    this.error(message, error, meta);
  }

  logWarning(message: string, meta?: any): void {
    this.warn(message, meta);
  }

  logDebug(message: string, meta?: any): void {
    this.debug(message, meta);
  }

  /**
   * Логирует API запросы
   */
  logApiRequest(request: ApiRequest): void {
    this.winston.info('API Request', {
      method: request.method,
      url: request.url,
      status_code: request.status_code,
      response_time: request.response_time,
      error: request.error
    });
  }

  /**
   * Логирует операции с магазинами
   */
  logStoreOperation(storeName: string, operation: string, result: any): void {
    this.winston.info(`Store Operation: ${storeName}`, {
      operation,
      result
    });
  }

  /**
   * Логирует операции планировщика
   */
  logSchedulerOperation(operation: string, details: any): void {
    this.winston.info(`Scheduler: ${operation}`, details);
  }
}
