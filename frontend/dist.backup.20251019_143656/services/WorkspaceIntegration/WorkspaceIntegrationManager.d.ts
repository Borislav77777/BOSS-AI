/**
 * Менеджер интеграции сервисов с Workspace
 */
import { WorkspaceIntegrationManager as IWorkspaceIntegrationManager, ServiceWorkspaceIntegration, WorkspaceItem, WorkspaceItemTemplate } from './types';
export declare class WorkspaceIntegrationManager implements IWorkspaceIntegrationManager {
    private serviceIntegrations;
    private workspaceItems;
    private eventListeners;
    /**
     * Регистрирует интеграцию сервиса с Workspace
     */
    registerServiceIntegration(integration: ServiceWorkspaceIntegration): void;
    /**
     * Удаляет интеграцию сервиса
     */
    unregisterServiceIntegration(serviceId: string): void;
    /**
     * Создает элемент Workspace
     */
    createWorkspaceItem(serviceId: string, templateId: string, data?: unknown): WorkspaceItem;
    /**
     * Обновляет элемент Workspace
     */
    updateWorkspaceItem(itemId: string, updates: Partial<WorkspaceItem>): boolean;
    /**
     * Удаляет элемент Workspace
     */
    deleteWorkspaceItem(itemId: string): boolean;
    /**
     * Получает элемент Workspace
     */
    getWorkspaceItem(itemId: string): WorkspaceItem | null;
    /**
     * Получает элементы сервиса
     */
    getServiceItems(serviceId: string): WorkspaceItem[];
    /**
     * Получает все элементы
     */
    getAllItems(): WorkspaceItem[];
    /**
     * Получает шаблоны сервиса
     */
    getItemTemplates(serviceId: string): WorkspaceItemTemplate[];
    /**
     * Подписывается на создание элементов
     */
    onItemCreated(callback: (item: WorkspaceItem) => void): void;
    /**
     * Подписывается на обновление элементов
     */
    onItemUpdated(callback: (item: WorkspaceItem) => void): void;
    /**
     * Подписывается на удаление элементов
     */
    onItemDeleted(callback: (itemId: string) => void): void;
    /**
     * Подписывается на выбор элементов
     */
    onItemSelected(callback: (item: WorkspaceItem) => void): void;
    /**
     * Синхронизируется с платформой
     */
    syncWithPlatform(): void;
    /**
     * Экспортирует элементы
     */
    exportItems(serviceId?: string): WorkspaceItem[];
    /**
     * Импортирует элементы
     */
    importItems(items: WorkspaceItem[]): void;
    /**
     * Генерирует уникальный ID
     */
    private generateId;
}
//# sourceMappingURL=WorkspaceIntegrationManager.d.ts.map