"use strict";
/**
 * Boss AI Platform - Unified Winston Logger
 * Централизованное логирование с structured logging и ротацией
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ozonManagerLogger = exports.apiGatewayLogger = exports.UnifiedLogger = void 0;
exports.createLogger = createLogger;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
/**
 * Unified Logger для всех сервисов Boss AI Platform
 */
class UnifiedLogger {
    constructor(serviceName, options) {
        this.serviceName = serviceName;
        this.logger = this.createLogger(serviceName, options);
    }
    /**
     * Создание Winston logger с конфигурацией
     */
    createLogger(serviceName, options = {}) {
        const { level = "info", logDir = "./logs", enableConsole = true, enableFile = true, } = options;
        const transports = [];
        // Console transport
        if (enableConsole) {
            transports.push(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.printf(({ timestamp, level, message, service, context, error }) => {
                    let logMessage = `[${timestamp}] ${level.toUpperCase()} [${service}] ${message}`;
                    if (context && Object.keys(context).length > 0) {
                        logMessage += ` | Context: ${JSON.stringify(context)}`;
                    }
                    if (error) {
                        logMessage += ` | Error: ${error.name}: ${error.message}`;
                    }
                    return logMessage;
                })),
            }));
        }
        // File transports
        if (enableFile) {
            // Combined log file
            transports.push(new winston_daily_rotate_file_1.default({
                filename: `${logDir}/${serviceName}-%DATE%.log`,
                datePattern: "YYYY-MM-DD",
                maxSize: "20m",
                maxFiles: "14d",
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            }));
            // Error log file
            transports.push(new winston_daily_rotate_file_1.default({
                filename: `${logDir}/${serviceName}-error-%DATE%.log`,
                datePattern: "YYYY-MM-DD",
                maxSize: "20m",
                maxFiles: "30d",
                level: "error",
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            }));
        }
        return winston_1.default.createLogger({
            level,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { service: serviceName },
            transports,
        });
    }
    /**
     * Логирование с контекстом
     */
    log(level, message, context, error) {
        const logEntry = {
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
    debug(message, context) {
        this.log("debug", message, context);
    }
    /**
     * Info level logging
     */
    info(message, context) {
        this.log("info", message, context);
    }
    /**
     * Warning level logging
     */
    warn(message, context) {
        this.log("warn", message, context);
    }
    /**
     * Error level logging
     */
    error(message, error, context) {
        this.log("error", message, context, error);
    }
    /**
     * HTTP request logging
     */
    httpRequest(method, url, statusCode, duration, context) {
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
    dbOperation(operation, table, duration, context) {
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
    apiCall(service, endpoint, method, statusCode, duration, context) {
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
    auth(action, userId, success = true, context) {
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
    performance(operation, duration, context) {
        this.info(`Performance: ${operation}`, {
            ...context,
            operation: "performance",
            duration,
        });
    }
    /**
     * Security logging
     */
    security(event, severity, context) {
        const level = severity === "critical" || severity === "high" ? "error" : "warn";
        this.log(level, `Security: ${event}`, {
            ...context,
            operation: "security",
            severity,
        });
    }
    /**
     * Business logic logging
     */
    business(event, data, context) {
        this.info(`Business: ${event}`, {
            ...context,
            operation: "business",
            data,
        });
    }
    /**
     * Получить Winston logger для прямого использования
     */
    getWinstonLogger() {
        return this.logger;
    }
    /**
     * Закрытие logger
     */
    close() {
        this.logger.close();
    }
}
exports.UnifiedLogger = UnifiedLogger;
/**
 * Создание logger для сервиса
 */
function createLogger(serviceName, options) {
    return new UnifiedLogger(serviceName, options);
}
/**
 * Глобальные logger'ы для сервисов
 */
exports.apiGatewayLogger = createLogger("api-gateway", {
    level: process.env.LOG_LEVEL || "info",
    logDir: "./logs",
});
exports.ozonManagerLogger = createLogger("ozon-manager", {
    level: process.env.LOG_LEVEL || "info",
    logDir: "./logs",
});
exports.default = UnifiedLogger;
//# sourceMappingURL=winston-logger.js.map