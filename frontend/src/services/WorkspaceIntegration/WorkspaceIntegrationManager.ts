/**
 * Менеджер интеграции сервисов с Workspace
 */

import {
    WorkspaceIntegrationManager as IWorkspaceIntegrationManager,
    ServiceWorkspaceIntegration,
    WorkspaceItem,
    WorkspaceItemTemplate
} from './types';

export class WorkspaceIntegrationManager implements IWorkspaceIntegrationManager {
  private serviceIntegrations: Map<string, ServiceWorkspaceIntegration> = new Map();
  private workspaceItems: Map<string, WorkspaceItem> = new Map();
  private eventListeners: {
    onItemCreated: ((item: WorkspaceItem) => void)[];
    onItemUpdated: ((item: WorkspaceItem) => void)[];
    onItemDeleted: ((itemId: string) => void)[];
    onItemSelected: ((item: WorkspaceItem) => void)[];
  } = {
    onItemCreated: [],
    onItemUpdated: [],
    onItemDeleted: [],
    onItemSelected: []
  };

  /**
   * Регистрирует интеграцию сервиса с Workspace
   */
  registerServiceIntegration(integration: ServiceWorkspaceIntegration): void {
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
  unregisterServiceIntegration(serviceId: string): void {
    const integration = this.serviceIntegrations.get(serviceId);
    if (!integration) return;

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
  createWorkspaceItem(serviceId: string, templateId: string, data?: unknown): WorkspaceItem {
    const integration = this.serviceIntegrations.get(serviceId);
    if (!integration) {
      throw new Error(`Сервис ${serviceId} не зарегистрирован`);
    }

    const template = integration.itemTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Шаблон ${templateId} не найден для сервиса ${serviceId}`);
    }

    const item: WorkspaceItem = {
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
  updateWorkspaceItem(itemId: string, updates: Partial<WorkspaceItem>): boolean {
    const item = this.workspaceItems.get(itemId);
    if (!item) return false;

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
  deleteWorkspaceItem(itemId: string): boolean {
    const item = this.workspaceItems.get(itemId);
    if (!item) return false;

    this.workspaceItems.delete(itemId);
    this.eventListeners.onItemDeleted.forEach(callback => callback(itemId));

    console.log(`[WorkspaceIntegration] Удален элемент ${itemId}`);
    return true;
  }

  /**
   * Получает элемент Workspace
   */
  getWorkspaceItem(itemId: string): WorkspaceItem | null {
    return this.workspaceItems.get(itemId) || null;
  }

  /**
   * Получает элементы сервиса
   */
  getServiceItems(serviceId: string): WorkspaceItem[] {
    return Array.from(this.workspaceItems.values())
      .filter(item => item.metadata.serviceId === serviceId);
  }

  /**
   * Получает все элементы
   */
  getAllItems(): WorkspaceItem[] {
    return Array.from(this.workspaceItems.values());
  }

  /**
   * Получает шаблоны сервиса
   */
  getItemTemplates(serviceId: string): WorkspaceItemTemplate[] {
    const integration = this.serviceIntegrations.get(serviceId);
    return integration ? integration.itemTemplates : [];
  }

  /**
   * Подписывается на создание элементов
   */
  onItemCreated(callback: (item: WorkspaceItem) => void): void {
    this.eventListeners.onItemCreated.push(callback);
  }

  /**
   * Подписывается на обновление элементов
   */
  onItemUpdated(callback: (item: WorkspaceItem) => void): void {
    this.eventListeners.onItemUpdated.push(callback);
  }

  /**
   * Подписывается на удаление элементов
   */
  onItemDeleted(callback: (itemId: string) => void): void {
    this.eventListeners.onItemDeleted.push(callback);
  }

  /**
   * Подписывается на выбор элементов
   */
  onItemSelected(callback: (item: WorkspaceItem) => void): void {
    this.eventListeners.onItemSelected.push(callback);
  }

  /**
   * Синхронизируется с платформой
   */
  syncWithPlatform(): void {
    // TODO: Интеграция с основным Workspace компонентом
    console.log('[WorkspaceIntegration] Синхронизация с платформой');
  }

  /**
   * Экспортирует элементы
   */
  exportItems(serviceId?: string): WorkspaceItem[] {
    if (serviceId) {
      return this.getServiceItems(serviceId);
    }
    return this.getAllItems();
  }

  /**
   * Импортирует элементы
   */
  importItems(items: WorkspaceItem[]): void {
    items.forEach(item => {
      this.workspaceItems.set(item.id, item);
      this.eventListeners.onItemCreated.forEach(callback => callback(item));
    });
    console.log(`[WorkspaceIntegration] Импортировано ${items.length} элементов`);
  }

  /**
   * Генерирует уникальный ID
   */
  private generateId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
