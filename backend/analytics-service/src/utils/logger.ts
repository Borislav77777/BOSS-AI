import path from 'path';
import winston from 'winston';

/**
 * Логгер для Analytics Service
 * Настроен для записи в файлы и консоль с ротацией
 */

export class Logger {
  private winston: winston.Logger;

  constructor() {
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            service: service || 'analytics-service',
            message,
            ...meta
          });
        })
      ),
      defaultMeta: { service: 'analytics-service' },
      transports: [
        // Консоль
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),

        // Файл для всех логов
        new winston.transports.File({
          filename: process.env.LOG_FILE || path.join(process.cwd(), 'logs', 'analytics.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),

        // Файл только для ошибок
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'analytics-error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.winston.error(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  // Специальные методы для аналитики
  trackEvent(eventType: string, userId: string, meta?: any): void {
    this.info(`Event tracked: ${eventType}`, {
      eventType,
      userId,
      ...meta
    });
  }

  trackError(error: Error, context?: any): void {
    this.error('Analytics error occurred', {
      error: error.message,
      stack: error.stack,
      context
    });
  }

  trackPerformance(metricName: string, value: number, unit: string, meta?: any): void {
    this.info(`Performance metric: ${metricName}`, {
      metricName,
      value,
      unit,
      ...meta
    });
  }
}

// Экспортируем singleton instance
export const logger = new Logger();
