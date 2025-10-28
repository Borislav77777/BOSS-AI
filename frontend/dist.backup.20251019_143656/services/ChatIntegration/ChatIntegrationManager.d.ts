/**
 * Менеджер интеграции сервисов с чатом
 */
import { ChatContext, ChatHandler, ChatMessage, ChatResponse, ChatIntegrationManager as IChatIntegrationManager, ServiceChatButton, ServiceChatIntegration } from './types';
export declare class ChatIntegrationManager implements IChatIntegrationManager {
    private serviceIntegrations;
    private handlers;
    private chatButtons;
    private eventListeners;
    /**
     * Регистрирует интеграцию сервиса с чатом
     */
    registerServiceIntegration(integration: ServiceChatIntegration): void;
    /**
     * Удаляет интеграцию сервиса
     */
    unregisterServiceIntegration(serviceId: string): void;
    /**
     * Регистрирует обработчик
     */
    registerHandler(handler: ChatHandler): void;
    /**
     * Удаляет обработчик
     */
    unregisterHandler(handlerId: string): void;
    /**
     * Получает обработчик
     */
    getHandler(handlerId: string): ChatHandler | null;
    /**
     * Получает все обработчики
     */
    getAllHandlers(): ChatHandler[];
    /**
     * Получает обработчики сервиса
     */
    getServiceHandlers(serviceId: string): ChatHandler[];
    /**
     * Обрабатывает сообщение
     */
    processMessage(message: string, context: ChatContext): Promise<ChatResponse[]>;
    /**
     * Выполняет обработчик
     */
    executeHandler(handlerId: string, message: string, context: ChatContext): Promise<ChatResponse>;
    /**
     * Регистрирует кнопку чата
     */
    registerChatButton(button: ServiceChatButton): void;
    /**
     * Удаляет кнопку чата
     */
    unregisterChatButton(buttonId: string): void;
    /**
     * Получает кнопки чата
     */
    getChatButtons(serviceId?: string): ServiceChatButton[];
    /**
     * Подписывается на получение сообщений
     */
    onMessageReceived(callback: (message: ChatMessage) => void): void;
    /**
     * Подписывается на генерацию ответов
     */
    onResponseGenerated(callback: (response: ChatResponse) => void): void;
    /**
     * Подписывается на выполнение обработчиков
     */
    onHandlerExecuted(callback: (handler: ChatHandler, result: ChatResponse) => void): void;
    /**
     * Синхронизируется с чатом
     */
    syncWithChat(): void;
    /**
     * Экспортирует обработчики
     */
    exportHandlers(serviceId?: string): ChatHandler[];
    /**
     * Импортирует обработчики
     */
    importHandlers(handlers: ChatHandler[]): void;
    /**
     * Находит подходящие обработчики для сообщения
     */
    private findMatchingHandlers;
}
//# sourceMappingURL=ChatIntegrationManager.d.ts.map