/**
 * Менеджер интеграции сервисов с Workspace
 */
export class WorkspaceIntegrationManager {
    constructor() {
        this.serviceIntegrations = new Map();
        this.workspaceItems = new Map();
        this.eventListeners = {
            onItemCreated: [],
            onItemUpdated: [],
            onItemDeleted: [],
            onItemSelected: []
        };
    }
    /**
     * Регистрирует интеграцию сервиса с Workspace
     */
    registerServiceIntegration(integration) {
        this.serviceIntegrations.set(integration.serviceId, integration);
        // Автоматически создаем элементы, если включено
        if (integration.autoCreateItems) {
            integration.workspaceItems.forEach(item => {
                this.workspaceItems.set(item.id, item);
                this.eventListeners.onItemCreated.forEach(callback => callback(item));
            });
        }
        console.log(`[WorkspaceIntegration] Сервис ${integration.serviceId} зарегистрирован`);
    }
    /**
     * Удаляет интеграцию сервиса
     */
    unregisterServiceIntegration(serviceId) {
        const integration = this.serviceIntegrations.get(serviceId);
        if (!integration)
            return;
        // Удаляем все элементы сервиса
        integration.workspaceItems.forEach(item => {
            this.workspaceItems.delete(item.id);
            this.eventListeners.onItemDeleted.forEach(callback => callback(item.id));
        });
        this.serviceIntegrations.delete(serviceId);
        console.log(`[WorkspaceIntegration] Сервис ${serviceId} удален`);
    }
    /**
     * Создает элемент Workspace
     */
    createWorkspaceItem(serviceId, templateId, data) {
        const integration = this.serviceIntegrations.get(serviceId);
        if (!integration) {
            throw new Error(`Сервис ${serviceId} не зарегистрирован`);
        }
        const template = integration.itemTemplates.find(t => t.id === templateId);
        if (!template) {
            throw new Error(`Шаблон ${templateId} не найден для сервиса ${serviceId}`);
        }
        const item = {
            id: this.generateId(),
            name: template.name,
            type: template.type,
            icon: template.icon,
            description: template.description,
            content: data || template.template.content,
            metadata: {
                serviceId,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: template.tags,
                permissions: {
                    read: true,
                    write: true,
                    delete: true
                }
            },
            ...template.template
        };
        this.workspaceItems.set(item.id, item);
        this.eventListeners.onItemCreated.forEach(callback => callback(item));
        console.log(`[WorkspaceIntegration] Создан элемент ${item.name} для сервиса ${serviceId}`);
        return item;
    }
    /**
     * Обновляет элемент Workspace
     */
    updateWorkspaceItem(itemId, updates) {
        const item = this.workspaceItems.get(itemId);
        if (!item)
            return false;
        const updatedItem = {
            ...item,
            ...updates,
            metadata: {
                ...item.metadata,
                updatedAt: new Date()
            }
        };
        this.workspaceItems.set(itemId, updatedItem);
        this.eventListeners.onItemUpdated.forEach(callback => callback(updatedItem));
        console.log(`[WorkspaceIntegration] Обновлен элемент ${itemId}`);
        return true;
    }
    /**
     * Удаляет элемент Workspace
     */
    deleteWorkspaceItem(itemId) {
        const item = this.workspaceItems.get(itemId);
        if (!item)
            return false;
        this.workspaceItems.delete(itemId);
        this.eventListeners.onItemDeleted.forEach(callback => callback(itemId));
        console.log(`[WorkspaceIntegration] Удален элемент ${itemId}`);
        return true;
    }
    /**
     * Получает элемент Workspace
     */
    getWorkspaceItem(itemId) {
        return this.workspaceItems.get(itemId) || null;
    }
    /**
     * Получает элементы сервиса
     */
    getServiceItems(serviceId) {
        return Array.from(this.workspaceItems.values())
            .filter(item => item.metadata.serviceId === serviceId);
    }
    /**
     * Получает все элементы
     */
    getAllItems() {
        return Array.from(this.workspaceItems.values());
    }
    /**
     * Получает шаблоны сервиса
     */
    getItemTemplates(serviceId) {
        const integration = this.serviceIntegrations.get(serviceId);
        return integration ? integration.itemTemplates : [];
    }
    /**
     * Подписывается на создание элементов
     */
    onItemCreated(callback) {
        this.eventListeners.onItemCreated.push(callback);
    }
    /**
     * Подписывается на обновление элементов
     */
    onItemUpdated(callback) {
        this.eventListeners.onItemUpdated.push(callback);
    }
    /**
     * Подписывается на удаление элементов
     */
    onItemDeleted(callback) {
        this.eventListeners.onItemDeleted.push(callback);
    }
    /**
     * Подписывается на выбор элементов
     */
    onItemSelected(callback) {
        this.eventListeners.onItemSelected.push(callback);
    }
    /**
     * Синхронизируется с платформой
     */
    syncWithPlatform() {
        // TODO: Интеграция с основным Workspace компонентом
        console.log('[WorkspaceIntegration] Синхронизация с платформой');
    }
    /**
     * Экспортирует элементы
     */
    exportItems(serviceId) {
        if (serviceId) {
            return this.getServiceItems(serviceId);
        }
        return this.getAllItems();
    }
    /**
     * Импортирует элементы
     */
    importItems(items) {
        items.forEach(item => {
            this.workspaceItems.set(item.id, item);
            this.eventListeners.onItemCreated.forEach(callback => callback(item));
        });
        console.log(`[WorkspaceIntegration] Импортировано ${items.length} элементов`);
    }
    /**
     * Генерирует уникальный ID
     */
    generateId() {
        return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
//# sourceMappingURL=WorkspaceIntegrationManager.js.map