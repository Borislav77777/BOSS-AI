/**
 * Типы для интеграции сервисов с Workspace
 */

export interface WorkspaceItem {
  id: string;
  name: string;
  type: 'document' | 'folder' | 'service' | 'widget';
  icon: string;
  description?: string;
  content?: unknown;
  metadata: {
    serviceId?: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    size?: number;
    permissions: {
      read: boolean;
      write: boolean;
      delete: boolean;
    };
  };
  children?: WorkspaceItem[];
  parentId?: string;
}

export interface ServiceWorkspaceIntegration {
  serviceId: string;
  workspaceItems: WorkspaceItem[];
  autoCreateItems: boolean;
  itemTemplates: WorkspaceItemTemplate[];
  eventHandlers: {
    onItemCreate?: (item: WorkspaceItem) => void;
    onItemUpdate?: (item: WorkspaceItem) => void;
    onItemDelete?: (itemId: string) => void;
    onItemSelect?: (item: WorkspaceItem) => void;
  };
}

export interface WorkspaceItemTemplate {
  id: string;
  name: string;
  type: 'document' | 'folder' | 'service' | 'widget';
  icon: string;
  description: string;
  template: Partial<WorkspaceItem>;
  serviceId: string;
  category: string;
  tags: string[];
}

export interface WorkspaceIntegrationManager {
  // Регистрация сервисов
  registerServiceIntegration(integration: ServiceWorkspaceIntegration): void;
  unregisterServiceIntegration(serviceId: string): void;

  // Управление элементами
  createWorkspaceItem(serviceId: string, templateId: string, data?: unknown): WorkspaceItem;
  updateWorkspaceItem(itemId: string, updates: Partial<WorkspaceItem>): boolean;
  deleteWorkspaceItem(itemId: string): boolean;
  getWorkspaceItem(itemId: string): WorkspaceItem | null;

  // Получение информации
  getServiceItems(serviceId: string): WorkspaceItem[];
  getAllItems(): WorkspaceItem[];
  getItemTemplates(serviceId: string): WorkspaceItemTemplate[];

  // События
  onItemCreated: (callback: (item: WorkspaceItem) => void) => void;
  onItemUpdated: (callback: (item: WorkspaceItem) => void) => void;
  onItemDeleted: (callback: (itemId: string) => void) => void;
  onItemSelected: (callback: (item: WorkspaceItem) => void) => void;

  // Интеграция с платформой
  syncWithPlatform(): void;
  exportItems(serviceId?: string): WorkspaceItem[];
  importItems(items: WorkspaceItem[]): void;
}
