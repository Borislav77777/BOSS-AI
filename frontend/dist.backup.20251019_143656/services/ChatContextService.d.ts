/**
 * Сервис управления контекстом чата
 * Отвечает за прикрепление и отслеживание контекста в чате
 */
import { ChatContext, ChatContextButton } from '@/types/chat';
declare class ChatContextService {
    private context;
    private listeners;
    constructor();
    /**
     * Инициализация слушателей событий
     */
    private initEventListeners;
    /**
     * Обработка прикрепления контекста
     */
    private handleAttachContext;
    /**
     * Обработка удаления контекста
     */
    private handleDetachContext;
    /**
     * Обработка навигации по workspace
     */
    private handleWorkspaceNavigate;
    /**
     * Обработка отправки в чат из workspace
     */
    private handleWorkspaceSendToChat;
    /**
     * Автоматическое прикрепление активного проекта
     */
    private autoAttachActiveProject;
    /**
     * Поиск проекта по ID
     */
    private findProjectById;
    /**
     * Прикрепление контекста
     */
    attachContext(contextButton: ChatContextButton): void;
    /**
     * Удаление контекста
     */
    detachContext(id: string): void;
    /**
     * Получение текущего контекста
     */
    getContext(): ChatContext;
    /**
     * Подписка на изменения контекста
     */
    subscribe(listener: (context: ChatContext) => void): () => void;
    /**
     * Уведомление слушателей об изменениях
     */
    private notifyListeners;
    /**
     * Очистка всего контекста
     */
    clearContext(): void;
    /**
     * Получение контекста для AI Brain
     */
    getContextForAI(): {
        attachedItems: ChatContextButton[];
        activeProject?: {
            id: string;
            title: string;
        };
        userLocation: string;
        contextSummary: string;
    };
    /**
     * Генерация краткого описания контекста для AI
     */
    private generateContextSummary;
}
export declare const chatContextService: ChatContextService;
export {};
//# sourceMappingURL=ChatContextService.d.ts.map