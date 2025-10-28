/**
 * Менеджер интеграции сервисов с чатом
 */
export class ChatIntegrationManager {
    constructor() {
        this.serviceIntegrations = new Map();
        this.handlers = new Map();
        this.chatButtons = new Map();
        this.eventListeners = {
            onMessageReceived: [],
            onResponseGenerated: [],
            onHandlerExecuted: []
        };
    }
    /**
     * Регистрирует интеграцию сервиса с чатом
     */
    registerServiceIntegration(integration) {
        this.serviceIntegrations.set(integration.serviceId, integration);
        // Регистрируем обработчики
        integration.handlers.forEach(handler => {
            this.handlers.set(handler.id, handler);
        });
        // Регистрируем кнопки
        integration.chatButtons.forEach(button => {
            this.chatButtons.set(button.id, button);
        });
        console.log(`[ChatIntegration] Сервис ${integration.serviceId} зарегистрирован`);
    }
    /**
     * Удаляет интеграцию сервиса
     */
    unregisterServiceIntegration(serviceId) {
        const integration = this.serviceIntegrations.get(serviceId);
        if (!integration)
            return;
        // Удаляем обработчики
        integration.handlers.forEach(handler => {
            this.handlers.delete(handler.id);
        });
        // Удаляем кнопки
        integration.chatButtons.forEach(button => {
            this.chatButtons.delete(button.id);
        });
        this.serviceIntegrations.delete(serviceId);
        console.log(`[ChatIntegration] Сервис ${serviceId} удален`);
    }
    /**
     * Регистрирует обработчик
     */
    registerHandler(handler) {
        this.handlers.set(handler.id, handler);
        console.log(`[ChatIntegration] Обработчик ${handler.id} зарегистрирован`);
    }
    /**
     * Удаляет обработчик
     */
    unregisterHandler(handlerId) {
        this.handlers.delete(handlerId);
        console.log(`[ChatIntegration] Обработчик ${handlerId} удален`);
    }
    /**
     * Получает обработчик
     */
    getHandler(handlerId) {
        return this.handlers.get(handlerId) || null;
    }
    /**
     * Получает все обработчики
     */
    getAllHandlers() {
        return Array.from(this.handlers.values());
    }
    /**
     * Получает обработчики сервиса
     */
    getServiceHandlers(serviceId) {
        return Array.from(this.handlers.values())
            .filter(handler => handler.serviceId === serviceId);
    }
    /**
     * Обрабатывает сообщение
     */
    async processMessage(message, context) {
        const responses = [];
        const matchingHandlers = this.findMatchingHandlers(message);
        for (const handler of matchingHandlers) {
            try {
                const response = await this.executeHandler(handler.id, message, context);
                responses.push(response);
            }
            catch (error) {
                console.error(`[ChatIntegration] Ошибка выполнения обработчика ${handler.id}:`, error);
            }
        }
        return responses;
    }
    /**
     * Выполняет обработчик
     */
    async executeHandler(handlerId, message, context) {
        const handler = this.handlers.get(handlerId);
        if (!handler) {
            throw new Error(`Обработчик ${handlerId} не найден`);
        }
        if (!handler.isEnabled) {
            throw new Error(`Обработчик ${handlerId} отключен`);
        }
        const startTime = Date.now();
        try {
            const result = await handler.handler(message, context);
            const processingTime = Date.now() - startTime;
            // Добавляем метаданные
            result.metadata.processingTime = processingTime;
            result.metadata.handlerId = handlerId;
            // Уведомляем слушателей
            this.eventListeners.onHandlerExecuted.forEach(callback => callback(handler, result));
            this.eventListeners.onResponseGenerated.forEach(callback => callback(result));
            console.log(`[ChatIntegration] Обработчик ${handlerId} выполнен за ${processingTime}ms`);
            return result;
        }
        catch (error) {
            console.error(`[ChatIntegration] Ошибка в обработчике ${handlerId}:`, error);
            throw error;
        }
    }
    /**
     * Регистрирует кнопку чата
     */
    registerChatButton(button) {
        this.chatButtons.set(button.id, button);
        console.log(`[ChatIntegration] Кнопка ${button.id} зарегистрирована`);
    }
    /**
     * Удаляет кнопку чата
     */
    unregisterChatButton(buttonId) {
        this.chatButtons.delete(buttonId);
        console.log(`[ChatIntegration] Кнопка ${buttonId} удалена`);
    }
    /**
     * Получает кнопки чата
     */
    getChatButtons(serviceId) {
        const buttons = Array.from(this.chatButtons.values());
        if (serviceId) {
            return buttons.filter(button => button.serviceId === serviceId);
        }
        return buttons;
    }
    /**
     * Подписывается на получение сообщений
     */
    onMessageReceived(callback) {
        this.eventListeners.onMessageReceived.push(callback);
    }
    /**
     * Подписывается на генерацию ответов
     */
    onResponseGenerated(callback) {
        this.eventListeners.onResponseGenerated.push(callback);
    }
    /**
     * Подписывается на выполнение обработчиков
     */
    onHandlerExecuted(callback) {
        this.eventListeners.onHandlerExecuted.push(callback);
    }
    /**
     * Синхронизируется с чатом
     */
    syncWithChat() {
        // TODO: Интеграция с основным Chat компонентом
        console.log('[ChatIntegration] Синхронизация с чатом');
    }
    /**
     * Экспортирует обработчики
     */
    exportHandlers(serviceId) {
        if (serviceId) {
            return this.getServiceHandlers(serviceId);
        }
        return this.getAllHandlers();
    }
    /**
     * Импортирует обработчики
     */
    importHandlers(handlers) {
        handlers.forEach(handler => {
            this.handlers.set(handler.id, handler);
        });
        console.log(`[ChatIntegration] Импортировано ${handlers.length} обработчиков`);
    }
    /**
     * Находит подходящие обработчики для сообщения
     */
    findMatchingHandlers(message) {
        const matchingHandlers = [];
        for (const handler of this.handlers.values()) {
            if (!handler.isEnabled)
                continue;
            // Проверяем триггеры
            const hasTrigger = handler.triggers.some(trigger => message.toLowerCase().includes(trigger.toLowerCase()));
            if (hasTrigger) {
                matchingHandlers.push(handler);
            }
        }
        // Сортируем по приоритету
        return matchingHandlers.sort((a, b) => b.priority - a.priority);
    }
}
//# sourceMappingURL=ChatIntegrationManager.js.map