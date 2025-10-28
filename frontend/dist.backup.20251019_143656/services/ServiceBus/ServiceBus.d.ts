/**
 * Service Bus - Система событий и запросов между сервисами
 */
import { EventHandler, ServiceBus as IServiceBus, RequestHandler, RequestInfo, ServiceBusConfig, ServiceEvent, ServiceMiddleware, ServiceRequest, ServiceResponse, SubscriptionInfo } from './types';
export declare class ServiceBus implements IServiceBus {
    private subscriptions;
    private activeRequests;
    private middleware;
    private isRunningFlag;
    private config;
    private eventBuffer;
    private requestHandlers;
    constructor(config?: Partial<ServiceBusConfig>);
    /**
     * Публикует событие
     */
    publish(event: ServiceEvent): void;
    /**
     * Подписывается на события
     */
    subscribe(eventType: string, handler: EventHandler): string;
    /**
     * Отписывается от событий
     */
    unsubscribe(subscriptionId: string): void;
    /**
     * Отправляет запрос сервису
     */
    request(request: ServiceRequest): Promise<ServiceResponse>;
    /**
     * Регистрирует обработчик запросов
     */
    respond(serviceId: string, method: string, handler: RequestHandler): void;
    /**
     * Удаляет обработчик запросов
     */
    unrespond(serviceId: string, method: string): void;
    /**
     * Добавляет middleware
     */
    addMiddleware(middleware: ServiceMiddleware): void;
    /**
     * Удаляет middleware
     */
    removeMiddleware(name: string): void;
    /**
     * Запускает Service Bus
     */
    start(): void;
    /**
     * Останавливает Service Bus
     */
    stop(): void;
    /**
     * Проверяет, запущен ли Service Bus
     */
    isRunning(): boolean;
    /**
     * Получает информацию о подписках
     */
    getSubscriptions(): SubscriptionInfo[];
    /**
     * Получает информацию об активных запросах
     */
    getActiveRequests(): RequestInfo[];
    /**
     * Получает список middleware
     */
    getMiddleware(): ServiceMiddleware[];
    /**
     * Доставляет событие подписчикам
     */
    private deliverEvent;
    /**
     * Генерирует уникальный ID
     */
    private generateId;
    /**
     * Логирует сообщения
     */
    private log;
}
//# sourceMappingURL=ServiceBus.d.ts.map