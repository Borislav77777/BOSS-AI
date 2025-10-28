/**
 * Константы для обработки ошибок
 */
export declare const ERRORS: {
    readonly TYPES: {
        readonly NETWORK: "NETWORK_ERROR";
        readonly VALIDATION: "VALIDATION_ERROR";
        readonly AUTHENTICATION: "AUTHENTICATION_ERROR";
        readonly AUTHORIZATION: "AUTHORIZATION_ERROR";
        readonly NOT_FOUND: "NOT_FOUND_ERROR";
        readonly SERVER: "SERVER_ERROR";
        readonly CLIENT: "CLIENT_ERROR";
        readonly UNKNOWN: "UNKNOWN_ERROR";
    };
    readonly CODES: {
        readonly NETWORK_TIMEOUT: "NETWORK_TIMEOUT";
        readonly NETWORK_OFFLINE: "NETWORK_OFFLINE";
        readonly NETWORK_CONNECTION_FAILED: "NETWORK_CONNECTION_FAILED";
        readonly INVALID_INPUT: "INVALID_INPUT";
        readonly MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD";
        readonly INVALID_FORMAT: "INVALID_FORMAT";
        readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
        readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
        readonly TOKEN_INVALID: "TOKEN_INVALID";
        readonly FILE_TOO_LARGE: "FILE_TOO_LARGE";
        readonly FILE_TYPE_NOT_SUPPORTED: "FILE_TYPE_NOT_SUPPORTED";
        readonly FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED";
        readonly MESSAGE_SEND_FAILED: "MESSAGE_SEND_FAILED";
        readonly MESSAGE_TOO_LONG: "MESSAGE_TOO_LONG";
        readonly CHAT_NOT_FOUND: "CHAT_NOT_FOUND";
    };
    readonly MESSAGES: {
        readonly GENERIC: "Произошла неожиданная ошибка";
        readonly NETWORK: "Ошибка сети. Проверьте подключение к интернету";
        readonly VALIDATION: "Ошибка валидации данных";
        readonly AUTHENTICATION: "Ошибка аутентификации";
        readonly AUTHORIZATION: "Недостаточно прав для выполнения операции";
        readonly NOT_FOUND: "Запрашиваемый ресурс не найден";
        readonly SERVER: "Ошибка сервера. Попробуйте позже";
        readonly FILE_UPLOAD: "Ошибка загрузки файла";
        readonly MESSAGE_SEND: "Ошибка отправки сообщения";
    };
    readonly LOGGING: {
        readonly MAX_ERRORS_IN_STORAGE: 50;
        readonly ERROR_RETENTION_DAYS: 7;
        readonly LOG_LEVELS: {
            readonly ERROR: "error";
            readonly WARNING: "warning";
            readonly INFO: "info";
            readonly DEBUG: "debug";
        };
    };
    readonly RECOVERY: {
        readonly AUTO_RETRY_ATTEMPTS: 3;
        readonly RETRY_DELAY: 1000;
        readonly FALLBACK_TIMEOUT: 5000;
    };
};
export type ErrorConstants = typeof ERRORS;
//# sourceMappingURL=errors.d.ts.map