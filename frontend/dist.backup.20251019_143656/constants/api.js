/**
 * Константы для API и внешних сервисов
 */
export const API = {
    // Базовые URL
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    // Таймауты (в миллисекундах)
    TIMEOUTS: {
        REQUEST: 10000,
        UPLOAD: 30000,
        DOWNLOAD: 60000,
        CONNECTION: 5000,
    },
    // Коды ответов
    STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
    // Настройки повторных попыток
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY: 1000,
        BACKOFF_MULTIPLIER: 2,
    },
    // Размеры запросов
    LIMITS: {
        MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
        MAX_RESPONSE_SIZE: 50 * 1024 * 1024, // 50MB
    },
    // Заголовки
    HEADERS: {
        CONTENT_TYPE: 'Content-Type',
        AUTHORIZATION: 'Authorization',
        USER_AGENT: 'User-Agent',
    },
};
//# sourceMappingURL=api.js.map