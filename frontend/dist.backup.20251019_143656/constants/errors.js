/**
 * Константы для обработки ошибок
 */
export const ERRORS = {
    // Типы ошибок
    TYPES: {
        NETWORK: 'NETWORK_ERROR',
        VALIDATION: 'VALIDATION_ERROR',
        AUTHENTICATION: 'AUTHENTICATION_ERROR',
        AUTHORIZATION: 'AUTHORIZATION_ERROR',
        NOT_FOUND: 'NOT_FOUND_ERROR',
        SERVER: 'SERVER_ERROR',
        CLIENT: 'CLIENT_ERROR',
        UNKNOWN: 'UNKNOWN_ERROR',
    },
    // Коды ошибок
    CODES: {
        // Сетевые ошибки
        NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
        NETWORK_OFFLINE: 'NETWORK_OFFLINE',
        NETWORK_CONNECTION_FAILED: 'NETWORK_CONNECTION_FAILED',
        // Ошибки валидации
        INVALID_INPUT: 'INVALID_INPUT',
        MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
        INVALID_FORMAT: 'INVALID_FORMAT',
        // Ошибки аутентификации
        INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
        TOKEN_EXPIRED: 'TOKEN_EXPIRED',
        TOKEN_INVALID: 'TOKEN_INVALID',
        // Ошибки файлов
        FILE_TOO_LARGE: 'FILE_TOO_LARGE',
        FILE_TYPE_NOT_SUPPORTED: 'FILE_TYPE_NOT_SUPPORTED',
        FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
        // Ошибки чата
        MESSAGE_SEND_FAILED: 'MESSAGE_SEND_FAILED',
        MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
        CHAT_NOT_FOUND: 'CHAT_NOT_FOUND',
    },
    // Сообщения об ошибках
    MESSAGES: {
        GENERIC: 'Произошла неожиданная ошибка',
        NETWORK: 'Ошибка сети. Проверьте подключение к интернету',
        VALIDATION: 'Ошибка валидации данных',
        AUTHENTICATION: 'Ошибка аутентификации',
        AUTHORIZATION: 'Недостаточно прав для выполнения операции',
        NOT_FOUND: 'Запрашиваемый ресурс не найден',
        SERVER: 'Ошибка сервера. Попробуйте позже',
        FILE_UPLOAD: 'Ошибка загрузки файла',
        MESSAGE_SEND: 'Ошибка отправки сообщения',
    },
    // Настройки логирования
    LOGGING: {
        MAX_ERRORS_IN_STORAGE: 50,
        ERROR_RETENTION_DAYS: 7,
        LOG_LEVELS: {
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info',
            DEBUG: 'debug',
        },
    },
    // Настройки восстановления
    RECOVERY: {
        AUTO_RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        FALLBACK_TIMEOUT: 5000,
    },
};
//# sourceMappingURL=errors.js.map