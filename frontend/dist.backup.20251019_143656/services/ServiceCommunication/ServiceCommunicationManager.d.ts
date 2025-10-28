/**
 * Менеджер прямого взаимодействия между сервисами
 */
import { ServiceCommunicationManager as IServiceCommunicationManager, ServiceCommunicationChannel, ServiceCommunicationStats, ServiceMessage } from './types';
export declare class ServiceCommunicationManager implements IServiceCommunicationManager {
    private channels;
    private messages;
    private subscriptions;
    private serviceStatuses;
    private serviceData;
    private isRunningFlag;
    private eventListeners;
    /**
     * Создает канал связи
     */
    createChannel(name: string, type: 'direct' | 'broadcast' | 'multicast' | 'unicast', participants: string[]): ServiceCommunicationChannel;
    /**
     * Подключает сервис к каналу
     */
    joinChannel(channelId: string, serviceId: string): boolean;
    /**
     * Отключает сервис от канала
     */
    leaveChannel(channelId: string, serviceId: string): boolean;
    /**
     * Получает канал
     */
    getChannel(channelId: string): ServiceCommunicationChannel | null;
    /**
     * Получает каналы сервиса
     */
    getServiceChannels(serviceId: string): ServiceCommunicationChannel[];
    /**
     * Отправляет сообщение
     */
    sendMessage(message: ServiceMessage): Promise<boolean>;
    /**
     * Отправляет прямое сообщение
     */
    sendDirectMessage(recipientId: string, content: any, type?: string): Promise<boolean>;
    /**
     * Отправляет широковещательное сообщение
     */
    broadcastMessage(content: any, type?: string): Promise<boolean>;
    /**
     * Отправляет многоадресное сообщение
     */
    multicastMessage(recipients: string[], content: any, type?: string): Promise<boolean>;
    /**
     * Получает сообщения канала
     */
    getMessages(channelId: string, limit?: number): ServiceMessage[];
    /**
     * Получает сообщения сервиса
     */
    getServiceMessages(serviceId: string, limit?: number): ServiceMessage[];
    /**
     * Получает количество непрочитанных сообщений
     */
    getUnreadCount(serviceId: string): number;
    /**
     * Подписывается на канал
     */
    subscribeToChannel(channelId: string, serviceId: string, callback: (message: ServiceMessage) => void): string;
    /**
     * Подписывается на сервис
     */
    subscribeToService(serviceId: string, callback: (message: ServiceMessage) => void): string;
    /**
     * Отписывается от событий
     */
    unsubscribe(subscriptionId: string): void;
    /**
     * Подписывается на получение сообщений
     */
    onMessageReceived(callback: (message: ServiceMessage) => void): void;
    /**
     * Подписывается на создание каналов
     */
    onChannelCreated(callback: (channel: ServiceCommunicationChannel) => void): void;
    /**
     * Подписывается на удаление каналов
     */
    onChannelDestroyed(callback: (channelId: string) => void): void;
    /**
     * Подписывается на подключение сервисов
     */
    onServiceJoined(callback: (channelId: string, serviceId: string) => void): void;
    /**
     * Подписывается на отключение сервисов
     */
    onServiceLeft(callback: (channelId: string, serviceId: string) => void): void;
    /**
     * Получает статус сервиса
     */
    getServiceStatus(serviceId: string): 'online' | 'offline' | 'busy' | 'away';
    /**
     * Устанавливает статус сервиса
     */
    setServiceStatus(serviceId: string, status: 'online' | 'offline' | 'busy' | 'away'): void;
    /**
     * Получает онлайн сервисы
     */
    getOnlineServices(): string[];
    /**
     * Синхронизирует данные сервиса
     */
    syncServiceData(serviceId: string, data: any): void;
    /**
     * Получает данные сервиса
     */
    getServiceData(serviceId: string): any;
    /**
     * Подписывается на данные сервиса
     */
    subscribeToServiceData(serviceId: string, callback: (data: any) => void): string;
    /**
     * Запускает менеджер
     */
    start(): void;
    /**
     * Останавливает менеджер
     */
    stop(): void;
    /**
     * Проверяет, запущен ли менеджер
     */
    isRunning(): boolean;
    /**
     * Получает статистику
     */
    getStats(): ServiceCommunicationStats;
    /**
     * Уведомляет подписчиков
     */
    private notifySubscribers;
    /**
     * Генерирует уникальный ID
     */
    private generateId;
}
//# sourceMappingURL=ServiceCommunicationManager.d.ts.map