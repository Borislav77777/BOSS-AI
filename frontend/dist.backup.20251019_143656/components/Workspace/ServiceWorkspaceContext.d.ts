import type { WorkspaceItem } from '@/services/WorkspaceIntegration/types';
export interface ServiceWorkspaceContextType {
    serviceItems: WorkspaceItem[];
    selectedItem: WorkspaceItem | null;
    createItem: (serviceId: string, templateId: string, data?: unknown) => WorkspaceItem;
    updateItem: (itemId: string, updates: Partial<WorkspaceItem>) => boolean;
    deleteItem: (itemId: string) => boolean;
    selectItem: (item: WorkspaceItem | null) => void;
    getServiceItems: (serviceId: string) => WorkspaceItem[];
}
export declare const ServiceWorkspaceContext: any;
export declare const useServiceWorkspace: () => any;
//# sourceMappingURL=ServiceWorkspaceContext.d.ts.map