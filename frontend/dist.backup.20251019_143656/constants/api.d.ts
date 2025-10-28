/**
 * Константы для API и внешних сервисов
 */
export declare const API: {
    readonly BASE_URL: any;
    readonly TIMEOUTS: {
        readonly REQUEST: 10000;
        readonly UPLOAD: 30000;
        readonly DOWNLOAD: 60000;
        readonly CONNECTION: 5000;
    };
    readonly STATUS_CODES: {
        readonly OK: 200;
        readonly CREATED: 201;
        readonly NO_CONTENT: 204;
        readonly BAD_REQUEST: 400;
        readonly UNAUTHORIZED: 401;
        readonly FORBIDDEN: 403;
        readonly NOT_FOUND: 404;
        readonly INTERNAL_SERVER_ERROR: 500;
    };
    readonly RETRY: {
        readonly MAX_ATTEMPTS: 3;
        readonly DELAY: 1000;
        readonly BACKOFF_MULTIPLIER: 2;
    };
    readonly LIMITS: {
        readonly MAX_REQUEST_SIZE: number;
        readonly MAX_RESPONSE_SIZE: number;
    };
    readonly HEADERS: {
        readonly CONTENT_TYPE: "Content-Type";
        readonly AUTHORIZATION: "Authorization";
        readonly USER_AGENT: "User-Agent";
    };
};
export type ApiConstants = typeof API;
//# sourceMappingURL=api.d.ts.map