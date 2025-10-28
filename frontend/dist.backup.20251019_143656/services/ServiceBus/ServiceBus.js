/**
 * Service Bus - Система событий и запросов между сервисами
 */
export class ServiceBus {
    constructor(config = {}) {
        this.subscriptions = new Map();
        this.activeRequests = new Map();
        this.middleware = [];
        this.isRunningFlag = false;
        this.eventBuffer = [];
        this.requestHandlers = new Map();
        this.config = {
            maxConcurrentRequests: 100,
            defaultTimeout: 30000,
            eventBufferSize: 1000,
            enableLogging: true,
            enableMetrics: true,
            ...config
        };
    }
    /**
     * Публикует событие
     */
    publish(event) {
        if (!this.isRunningFlag) {
            this.log('ServiceBus не запущен, событие добавлено в буфер');
            this.eventBuffer.push(event);
            return;
        }
        // Применяем middleware
        let processedEvent = event;
        for (const middleware of this.middleware.sort((a, b) => a.priority - b.priority)) {
            if (middleware.beforeEvent) {
                const result = middleware.beforeEvent(processedEvent);
                if (result === null) {
                    this.log(`Событие ${event.id} заблокировано middleware ${middleware.name}`);
                    return;
                }
                processedEvent = result;
            }
        }
        // Отправляем событие подписчикам
        this.deliverEvent(processedEvent);
        // Применяем after middleware
        for (const middleware of this.middleware.sort((a, b) => a.priority - b.priority)) {
            if (middleware.afterEvent) {
                middleware.afterEvent(processedEvent);
            }
        }
        this.log(`Событие ${event.id} опубликовано`);
    }
    /**
     * Подписывается на события
     */
    subscribe(eventType, handler) {
        const subscriptionId = this.generateId();
        const subscription = {
            id: subscriptionId,
            eventType,
            handler,
            serviceId: 'unknown', // TODO: получать из контекста
            createdAt: new Date()
        };
        this.subscriptions.set(subscriptionId, subscription);
        this.log(`Подписка ${subscriptionId} создана для события ${eventType}`);
        return subscriptionId;
    }
    /**
     * Отписывается от событий
     */
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            this.subscriptions.delete(subscriptionId);
            this.log(`Подписка ${subscriptionId} удалена`);
        }
    }
    /**
     * Отправляет запрос сервису
     */
    async request(request) {
        if (!this.isRunningFlag) {
            throw new Error('ServiceBus не запущен');
        }
        // Проверяем лимит запросов
        if (this.activeRequests.size >= this.config.maxConcurrentRequests) {
            throw new Error('Превышен лимит одновременных запросов');
        }
        // Применяем middleware
        let processedRequest = request;
        for (const middleware of this.middleware.sort((a, b) => a.priority - b.priority)) {
            if (middleware.beforeRequest) {
                const result = middleware.beforeRequest(processedRequest);
                if (result === null) {
                    throw new Error(`Запрос ${request.id} заблокирован middleware`);
                }
                processedRequest = result;
            }
        }
        // Создаем запрос
        const requestInfo = {
            id: request.id,
            method: request.method,
            source: request.source,
            target: request.target,
            status: 'pending',
            createdAt: new Date()
        };
        this.activeRequests.set(request.id, requestInfo);
        try {
            // Ищем обработчик
            const handlerKey = `${request.target}:${request.method}`;
            const handler = this.requestHandlers.get(handlerKey);
            if (!handler) {
                throw new Error(`Обработчик для ${request.target}:${request.method} не найден`);
            }
            // Выполняем запрос
            const response = await handler(processedRequest);
            // Обновляем статус
            requestInfo.status = 'completed';
            requestInfo.completedAt = new Date();
            // Применяем after middleware
            let processedResponse = response;
            for (const middleware of this.middleware.sort((a, b) => a.priority - b.priority)) {
                if (middleware.afterResponse) {
                    const result = middleware.afterResponse(processedResponse);
                    if (result) {
                        processedResponse = result;
                    }
                }
            }
            this.log(`Запрос ${request.id} выполнен успешно`);
            return processedResponse;
        }
        catch (error) {
            requestInfo.status = 'error';
            requestInfo.completedAt = new Date();
            this.log(`Ошибка выполнения запроса ${request.id}:`, error);
            return {
                id: this.generateId(),
                requestId: request.id,
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
                timestamp: new Date()
            };
        }
        finally {
            this.activeRequests.delete(request.id);
        }
    }
    /**
     * Регистрирует обработчик запросов
     */
    respond(serviceId, method, handler) {
        const handlerKey = `${serviceId}:${method}`;
        this.requestHandlers.set(handlerKey, handler);
        this.log(`Обработчик ${handlerKey} зарегистрирован`);
    }
    /**
     * Удаляет обработчик запросов
     */
    unrespond(serviceId, method) {
        const handlerKey = `${serviceId}:${method}`;
        this.requestHandlers.delete(handlerKey);
        this.log(`Обработчик ${handlerKey} удален`);
    }
    /**
     * Добавляет middleware
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
        this.middleware.sort((a, b) => a.priority - b.priority);
        this.log(`Middleware ${middleware.name} добавлен`);
    }
    /**
     * Удаляет middleware
     */
    removeMiddleware(name) {
        const index = this.middleware.findIndex(m => m.name === name);
        if (index !== -1) {
            this.middleware.splice(index, 1);
            this.log(`Middleware ${name} удален`);
        }
    }
    /**
     * Запускает Service Bus
     */
    start() {
        this.isRunningFlag = true;
        this.log('ServiceBus запущен');
        // Обрабатываем буферизованные события
        while (this.eventBuffer.length > 0) {
            const event = this.eventBuffer.shift();
            if (event) {
                this.publish(event);
            }
        }
    }
    /**
     * Останавливает Service Bus
     */
    stop() {
        this.isRunningFlag = false;
        this.log('ServiceBus остановлен');
    }
    /**
     * Проверяет, запущен ли Service Bus
     */
    isRunning() {
        return this.isRunningFlag;
    }
    /**
     * Получает информацию о подписках
     */
    getSubscriptions() {
        return Array.from(this.subscriptions.values());
    }
    /**
     * Получает информацию об активных запросах
     */
    getActiveRequests() {
        return Array.from(this.activeRequests.values());
    }
    /**
     * Получает список middleware
     */
    getMiddleware() {
        return [...this.middleware];
    }
    /**
     * Доставляет событие подписчикам
     */
    deliverEvent(event) {
        const matchingSubscriptions = Array.from(this.subscriptions.values())
            .filter(sub => sub.eventType === event.type || sub.eventType === '*');
        for (const subscription of matchingSubscriptions) {
            try {
                subscription.handler(event);
            }
            catch (error) {
                this.log(`Ошибка в обработчике события ${subscription.id}:`, error);
            }
        }
    }
    /**
     * Генерирует уникальный ID
     */
    generateId() {
        return `sb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Логирует сообщения
     */
    log(message, ...args) {
        if (this.config.enableLogging) {
            console.log(`[ServiceBus] ${message}`, ...args);
        }
    }
}
//# sourceMappingURL=ServiceBus.js.map