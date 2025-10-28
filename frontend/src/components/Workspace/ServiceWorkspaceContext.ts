import type { WorkspaceItem } from '@/services/WorkspaceIntegration/types';
import { createContext, useContext } from 'react';

export interface ServiceWorkspaceContextType {
    serviceItems: WorkspaceItem[];
    selectedItem: WorkspaceItem | null;
    createItem: (serviceId: string, templateId: string, data?: unknown) => WorkspaceItem;
    updateItem: (itemId: string, updates: Partial<WorkspaceItem>) => boolean;
    deleteItem: (itemId: string) => boolean;
    selectItem: (item: WorkspaceItem | null) => void;
    getServiceItems: (serviceId: string) => WorkspaceItem[];
}

export const ServiceWorkspaceContext = createContext<ServiceWorkspaceContextType | null>(null);

export const useServiceWorkspace = () => {
    const context = useContext(ServiceWorkspaceContext);
    if (!context) {
        throw new Error('useServiceWorkspace must be used within ServiceWorkspaceProvider');
    }
    return context;
};
