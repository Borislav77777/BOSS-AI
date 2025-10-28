import path from 'path';
import winston from 'winston';

// Конфигурация логгера для всех сервисов
const createLogger = (serviceName: string) => {
    const logFormat = winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            return JSON.stringify({
                timestamp,
                level,
                service: service || serviceName,
                message,
                ...meta
            });
        })
    );

    return winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        defaultMeta: { service: serviceName },
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
                filename: path.join(process.cwd(), 'logs', 'combined.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5
            }),

            // Файл только для ошибок
            new winston.transports.File({
                filename: path.join(process.cwd(), 'logs', 'error.log'),
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5
            })
        ]
    });
};

// Создаем логгеры для каждого сервиса
export const mainLogger = createLogger('main-api');
export const ozonLogger = createLogger('ozon-manager');
export const aiLogger = createLogger('ai-services');
export const authLogger = createLogger('auth-service');

// Универсальный логгер
export const logger = {
    info: (message: string, meta?: any) => mainLogger.info(message, meta),
    warn: (message: string, meta?: any) => mainLogger.warn(message, meta),
    error: (message: string, meta?: any) => mainLogger.error(message, meta),
    debug: (message: string, meta?: any) => mainLogger.debug(message, meta)
};

export default logger;
