/**
 * Менеджер прямого взаимодействия между сервисами
 */
export class ServiceCommunicationManager {
    constructor() {
        this.channels = new Map();
        this.messages = new Map();
        this.subscriptions = new Map();
        this.serviceStatuses = new Map();
        this.serviceData = new Map();
        this.isRunningFlag = false;
        this.eventListeners = {
            onMessageReceived: [],
            onChannelCreated: [],
            onChannelDestroyed: [],
            onServiceJoined: [],
            onServiceLeft: []
        };
    }
    /**
     * Создает канал связи
     */
    createChannel(name, type, participants) {
        const channel = {
            id: this.generateId(),
            name,
            type,
            participants,
            isActive: true,
            metadata: {
                createdAt: new Date(),
                lastActivity: new Date(),
                messageCount: 0
            }
        };
        this.channels.set(channel.id, channel);
        this.messages.set(channel.id, []);
        this.eventListeners.onChannelCreated.forEach(callback => callback(channel));
        console.log(`[ServiceCommunication] Создан канал ${name} (${type})`);
        return channel;
    }
    /**
     * Подключает сервис к каналу
     */
    joinChannel(channelId, serviceId) {
        const channel = this.channels.get(channelId);
        if (!channel)
            return false;
        if (!channel.participants.includes(serviceId)) {
            channel.participants.push(serviceId);
            this.eventListeners.onServiceJoined.forEach(callback => callback(channelId, serviceId));
            console.log(`[ServiceCommunication] Сервис ${serviceId} подключен к каналу ${channelId}`);
        }
        return true;
    }
    /**
     * Отключает сервис от канала
     */
    leaveChannel(channelId, serviceId) {
        const channel = this.channels.get(channelId);
        if (!channel)
            return false;
        const index = channel.participants.indexOf(serviceId);
        if (index !== -1) {
            channel.participants.splice(index, 1);
            this.eventListeners.onServiceLeft.forEach(callback => callback(channelId, serviceId));
            console.log(`[ServiceCommunication] Сервис ${serviceId} отключен от канала ${channelId}`);
        }
        return true;
    }
    /**
     * Получает канал
     */
    getChannel(channelId) {
        return this.channels.get(channelId) || null;
    }
    /**
     * Получает каналы сервиса
     */
    getServiceChannels(serviceId) {
        return Array.from(this.channels.values())
            .filter(channel => channel.participants.includes(serviceId));
    }
    /**
     * Отправляет сообщение
     */
    async sendMessage(message) {
        if (!this.isRunningFlag) {
            console.warn('[ServiceCommunication] Менеджер не запущен');
            return false;
        }
        const channel = this.channels.get(message.channelId);
        if (!channel) {
            console.error(`[ServiceCommunication] Канал ${message.channelId} не найден`);
            return false;
        }
        // Проверяем права доступа
        if (!channel.participants.includes(message.senderId)) {
            console.error(`[ServiceCommunication] Сервис ${message.senderId} не имеет доступа к каналу ${message.channelId}`);
            return false;
        }
        // Добавляем сообщение
        const channelMessages = this.messages.get(message.channelId) || [];
        channelMessages.push(message);
        this.messages.set(message.channelId, channelMessages);
        // Обновляем метаданные канала
        channel.metadata.lastActivity = new Date();
        channel.metadata.messageCount++;
        // Уведомляем подписчиков
        this.notifySubscribers(message);
        this.eventListeners.onMessageReceived.forEach(callback => callback(message));
        console.log(`[ServiceCommunication] Сообщение отправлено в канал ${message.channelId}`);
        return true;
    }
    /**
     * Отправляет прямое сообщение
     */
    async sendDirectMessage(recipientId, content, type = 'message') {
        const message = {
            id: this.generateId(),
            channelId: 'direct',
            senderId: 'system',
            recipientId,
            type: type,
            content,
            timestamp: new Date(),
            priority: 'normal',
            metadata: {
                tags: ['direct'],
                correlationId: this.generateId()
            }
        };
        return await this.sendMessage(message);
    }
    /**
     * Отправляет широковещательное сообщение
     */
    async broadcastMessage(content, type = 'notification') {
        const message = {
            id: this.generateId(),
            channelId: 'broadcast',
            senderId: 'system',
            type: type,
            content,
            timestamp: new Date(),
            priority: 'normal',
            metadata: {
                tags: ['broadcast']
            }
        };
        return await this.sendMessage(message);
    }
    /**
     * Отправляет многоадресное сообщение
     */
    async multicastMessage(recipients, content, type = 'message') {
        const message = {
            id: this.generateId(),
            channelId: 'multicast',
            senderId: 'system',
            type: type,
            content,
            timestamp: new Date(),
            priority: 'normal',
            metadata: {
                tags: ['multicast']
            }
        };
        return await this.sendMessage(message);
    }
    /**
     * Получает сообщения канала
     */
    getMessages(channelId, limit) {
        const messages = this.messages.get(channelId) || [];
        return limit ? messages.slice(-limit) : messages;
    }
    /**
     * Получает сообщения сервиса
     */
    getServiceMessages(serviceId, limit) {
        const allMessages = [];
        for (const channelMessages of this.messages.values()) {
            const serviceMessages = channelMessages.filter(msg => msg.senderId === serviceId || msg.recipientId === serviceId);
            allMessages.push(...serviceMessages);
        }
        return limit ? allMessages.slice(-limit) : allMessages;
    }
    /**
     * Получает количество непрочитанных сообщений
     */
    getUnreadCount(serviceId) {
        // TODO: Реализовать отслеживание прочитанных сообщений
        return 0;
    }
    /**
     * Подписывается на канал
     */
    subscribeToChannel(channelId, serviceId, callback) {
        const subscriptionId = this.generateId();
        this.subscriptions.set(subscriptionId, { serviceId, callback });
        console.log(`[ServiceCommunication] Сервис ${serviceId} подписан на канал ${channelId}`);
        return subscriptionId;
    }
    /**
     * Подписывается на сервис
     */
    subscribeToService(serviceId, callback) {
        const subscriptionId = this.generateId();
        this.subscriptions.set(subscriptionId, { serviceId, callback });
        console.log(`[ServiceCommunication] Подписка на сервис ${serviceId}`);
        return subscriptionId;
    }
    /**
     * Отписывается от событий
     */
    unsubscribe(subscriptionId) {
        this.subscriptions.delete(subscriptionId);
        console.log(`[ServiceCommunication] Подписка ${subscriptionId} удалена`);
    }
    /**
     * Подписывается на получение сообщений
     */
    onMessageReceived(callback) {
        this.eventListeners.onMessageReceived.push(callback);
    }
    /**
     * Подписывается на создание каналов
     */
    onChannelCreated(callback) {
        this.eventListeners.onChannelCreated.push(callback);
    }
    /**
     * Подписывается на удаление каналов
     */
    onChannelDestroyed(callback) {
        this.eventListeners.onChannelDestroyed.push(callback);
    }
    /**
     * Подписывается на подключение сервисов
     */
    onServiceJoined(callback) {
        this.eventListeners.onServiceJoined.push(callback);
    }
    /**
     * Подписывается на отключение сервисов
     */
    onServiceLeft(callback) {
        this.eventListeners.onServiceLeft.push(callback);
    }
    /**
     * Получает статус сервиса
     */
    getServiceStatus(serviceId) {
        const status = this.serviceStatuses.get(serviceId);
        return status ? status.status : 'offline';
    }
    /**
     * Устанавливает статус сервиса
     */
    setServiceStatus(serviceId, status) {
        this.serviceStatuses.set(serviceId, {
            serviceId,
            status,
            lastSeen: new Date(),
            capabilities: [],
            metadata: {}
        });
        console.log(`[ServiceCommunication] Статус сервиса ${serviceId}: ${status}`);
    }
    /**
     * Получает онлайн сервисы
     */
    getOnlineServices() {
        return Array.from(this.serviceStatuses.values())
            .filter(status => status.status === 'online')
            .map(status => status.serviceId);
    }
    /**
     * Синхронизирует данные сервиса
     */
    syncServiceData(serviceId, data) {
        this.serviceData.set(serviceId, data);
        console.log(`[ServiceCommunication] Данные сервиса ${serviceId} синхронизированы`);
    }
    /**
     * Получает данные сервиса
     */
    getServiceData(serviceId) {
        return this.serviceData.get(serviceId);
    }
    /**
     * Подписывается на данные сервиса
     */
    subscribeToServiceData(serviceId, callback) {
        // TODO: Реализовать подписку на изменения данных
        const subscriptionId = this.generateId();
        console.log(`[ServiceCommunication] Подписка на данные сервиса ${serviceId}`);
        return subscriptionId;
    }
    /**
     * Запускает менеджер
     */
    start() {
        this.isRunningFlag = true;
        console.log('[ServiceCommunication] Менеджер запущен');
    }
    /**
     * Останавливает менеджер
     */
    stop() {
        this.isRunningFlag = false;
        console.log('[ServiceCommunication] Менеджер остановлен');
    }
    /**
     * Проверяет, запущен ли менеджер
     */
    isRunning() {
        return this.isRunningFlag;
    }
    /**
     * Получает статистику
     */
    getStats() {
        return {
            totalChannels: this.channels.size,
            totalMessages: Array.from(this.messages.values()).reduce((sum, msgs) => sum + msgs.length, 0),
            activeServices: this.getOnlineServices().length,
            onlineServices: this.getOnlineServices(),
            messageRate: 0, // TODO: Реализовать подсчет
            averageLatency: 0, // TODO: Реализовать подсчет
            errorRate: 0 // TODO: Реализовать подсчет
        };
    }
    /**
     * Уведомляет подписчиков
     */
    notifySubscribers(message) {
        for (const subscription of this.subscriptions.values()) {
            if (subscription.serviceId === message.senderId ||
                subscription.serviceId === message.recipientId ||
                message.channelId === 'broadcast') {
                try {
                    subscription.callback(message);
                }
                catch (error) {
                    console.error('[ServiceCommunication] Ошибка в обработчике подписки:', error);
                }
            }
        }
    }
    /**
     * Генерирует уникальный ID
     */
    generateId() {
        return `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
//# sourceMappingURL=ServiceCommunicationManager.js.map