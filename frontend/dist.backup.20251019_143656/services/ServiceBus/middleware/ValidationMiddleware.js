/**
 * Middleware для валидации событий и запросов
 */
export class ValidationMiddleware {
    constructor(strictMode = false) {
        this.strictMode = strictMode;
        this.name = 'ValidationMiddleware';
        this.priority = 50;
    }
    beforeEvent(event) {
        // Валидация обязательных полей
        if (!event.id || !event.type || !event.source) {
            console.error('[ServiceBus] Невалидное событие: отсутствуют обязательные поля');
            return null;
        }
        // Валидация типа события
        if (!this.isValidEventType(event.type)) {
            console.error(`[ServiceBus] Невалидный тип события: ${event.type}`);
            return null;
        }
        // Валидация данных
        if (event.data && typeof event.data !== 'object') {
            console.error('[ServiceBus] Данные события должны быть объектом');
            return null;
        }
        return event;
    }
    afterEvent(event) {
        return event;
    }
    beforeRequest(request) {
        // Валидация обязательных полей
        if (!request.id || !request.method || !request.source || !request.target) {
            console.error('[ServiceBus] Невалидный запрос: отсутствуют обязательные поля');
            return null;
        }
        // Валидация метода
        if (!this.isValidMethod(request.method)) {
            console.error(`[ServiceBus] Невалидный метод: ${request.method}`);
            return null;
        }
        // Валидация параметров
        if (request.params && typeof request.params !== 'object') {
            console.error('[ServiceBus] Параметры запроса должны быть объектом');
            return null;
        }
        return request;
    }
    afterResponse(response) {
        // Валидация ответа
        if (typeof response.success !== 'boolean') {
            console.error('[ServiceBus] Поле success в ответе должно быть булевым');
            return null;
        }
        if (!response.success && !response.error) {
            console.warn('[ServiceBus] Неуспешный ответ без описания ошибки');
        }
        return response;
    }
    isValidEventType(type) {
        const validTypes = [
            'service.registered',
            'service.unregistered',
            'service.activated',
            'service.deactivated',
            'service.error',
            'data.changed',
            'user.action',
            'system.notification'
        ];
        return validTypes.includes(type) || type.startsWith('custom.');
    }
    isValidMethod(method) {
        const validMethods = [
            'get',
            'set',
            'create',
            'update',
            'delete',
            'execute',
            'process',
            'validate',
            'transform'
        ];
        return validMethods.includes(method) || method.includes('.');
    }
}
//# sourceMappingURL=ValidationMiddleware.js.map