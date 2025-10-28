/**
 * Middleware для безопасности Service Bus
 */
export class SecurityMiddleware {
    constructor(allowedSources = [], blockedSources = [], allowedMethods = [], blockedMethods = []) {
        this.allowedSources = allowedSources;
        this.blockedSources = blockedSources;
        this.allowedMethods = allowedMethods;
        this.blockedMethods = blockedMethods;
        this.name = 'SecurityMiddleware';
        this.priority = 10;
    }
    beforeEvent(event) {
        // Проверка заблокированных источников
        if (this.blockedSources.includes(event.source)) {
            console.warn(`[ServiceBus] Событие заблокировано: источник ${event.source} в черном списке`);
            return null;
        }
        // Проверка разрешенных источников
        if (this.allowedSources.length > 0 && !this.allowedSources.includes(event.source)) {
            console.warn(`[ServiceBus] Событие заблокировано: источник ${event.source} не в белом списке`);
            return null;
        }
        // Проверка TTL
        if (event.ttl && event.ttl < Date.now() - event.timestamp.getTime()) {
            console.warn(`[ServiceBus] Событие ${event.id} истекло`);
            return null;
        }
        // Санитизация данных
        if (event.data) {
            event.data = this.sanitizeData(event.data);
        }
        return event;
    }
    afterEvent(event) {
        return event;
    }
    beforeRequest(request) {
        // Проверка заблокированных источников
        if (this.blockedSources.includes(request.source)) {
            console.warn(`[ServiceBus] Запрос заблокирован: источник ${request.source} в черном списке`);
            return null;
        }
        // Проверка разрешенных источников
        if (this.allowedSources.length > 0 && !this.allowedSources.includes(request.source)) {
            console.warn(`[ServiceBus] Запрос заблокирован: источник ${request.source} не в белом списке`);
            return null;
        }
        // Проверка заблокированных методов
        if (this.blockedMethods.includes(request.method)) {
            console.warn(`[ServiceBus] Запрос заблокирован: метод ${request.method} в черном списке`);
            return null;
        }
        // Проверка разрешенных методов
        if (this.allowedMethods.length > 0 && !this.allowedMethods.includes(request.method)) {
            console.warn(`[ServiceBus] Запрос заблокирован: метод ${request.method} не в белом списке`);
            return null;
        }
        // Санитизация параметров
        if (request.params) {
            request.params = this.sanitizeData(request.params);
        }
        return request;
    }
    afterResponse(response) {
        // Санитизация данных ответа
        if (response.data) {
            response.data = this.sanitizeData(response.data);
        }
        return response;
    }
    sanitizeData(data) {
        if (typeof data === 'string') {
            // Удаляем потенциально опасные символы
            return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeData(item));
        }
        if (data && typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                // Пропускаем потенциально опасные ключи
                if (key.startsWith('__') || key.includes('prototype') || key.includes('constructor')) {
                    continue;
                }
                sanitized[key] = this.sanitizeData(value);
            }
            return sanitized;
        }
        return data;
    }
}
//# sourceMappingURL=SecurityMiddleware.js.map