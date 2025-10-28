/**
 * Middleware для логирования событий и запросов
 */
export class LoggingMiddleware {
    constructor(enableEventLogging = true, enableRequestLogging = true) {
        this.enableEventLogging = enableEventLogging;
        this.enableRequestLogging = enableRequestLogging;
        this.name = 'LoggingMiddleware';
        this.priority = 100;
    }
    beforeEvent(event) {
        if (this.enableEventLogging) {
            console.log(`[ServiceBus] Событие: ${event.type} от ${event.source}`, {
                id: event.id,
                data: event.data,
                timestamp: event.timestamp
            });
        }
        return event;
    }
    afterEvent(event) {
        if (this.enableEventLogging) {
            console.log(`[ServiceBus] Событие ${event.id} доставлено`);
        }
        return event;
    }
    beforeRequest(request) {
        if (this.enableRequestLogging) {
            console.log(`[ServiceBus] Запрос: ${request.method} от ${request.source} к ${request.target}`, {
                id: request.id,
                params: request.params,
                timestamp: request.timestamp
            });
        }
        return request;
    }
    afterResponse(response) {
        if (this.enableRequestLogging) {
            console.log(`[ServiceBus] Ответ: ${response.requestId}`, {
                success: response.success,
                data: response.data,
                error: response.error,
                timestamp: response.timestamp
            });
        }
        return response;
    }
}
//# sourceMappingURL=LoggingMiddleware.js.map