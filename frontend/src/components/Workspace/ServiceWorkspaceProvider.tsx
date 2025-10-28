/**
 * Провайдер для интеграции сервисов с Workspace
 */

import { workspaceIntegrationManager } from '@/services/WorkspaceIntegration';
import { WorkspaceItem } from '@/services/WorkspaceIntegration/types';
import { useEffect, useState, type FC, type ReactNode } from 'react';
import { ServiceWorkspaceContext, type ServiceWorkspaceContextType } from './ServiceWorkspaceContext';

interface ServiceWorkspaceProviderProps {
    children: ReactNode;
}

export const ServiceWorkspaceProvider: FC<ServiceWorkspaceProviderProps> = ({ children }) => {
    const [serviceItems, setServiceItems] = useState<WorkspaceItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<WorkspaceItem | null>(null);

    useEffect(() => {
        // Загружаем элементы при инициализации
        const loadItems = () => {
            const items = workspaceIntegrationManager.getAllItems();
            setServiceItems(items);
        };

        loadItems();

        // Подписываемся на события
        const handleItemCreated = (item: WorkspaceItem) => {
            setServiceItems(prev => [...prev, item]);
        };

        const handleItemUpdated = (item: WorkspaceItem) => {
            setServiceItems(prev =>
                prev.map(i => i.id === item.id ? item : i)
            );
        };

        const handleItemDeleted = (itemId: string) => {
            setServiceItems(prev => prev.filter(item => item.id !== itemId));
            if (selectedItem?.id === itemId) {
                setSelectedItem(null);
            }
        };

        workspaceIntegrationManager.onItemCreated(handleItemCreated);
        workspaceIntegrationManager.onItemUpdated(handleItemUpdated);
        workspaceIntegrationManager.onItemDeleted(handleItemDeleted);

        return () => {
            // Очистка подписок
        };
    }, [selectedItem]);

    const createItem = (serviceId: string, templateId: string, data?: unknown): WorkspaceItem => {
        return workspaceIntegrationManager.createWorkspaceItem(serviceId, templateId, data);
    };

    const updateItem = (itemId: string, updates: Partial<WorkspaceItem>): boolean => {
        return workspaceIntegrationManager.updateWorkspaceItem(itemId, updates);
    };

    const deleteItem = (itemId: string): boolean => {
        return workspaceIntegrationManager.deleteWorkspaceItem(itemId);
    };

    const selectItem = (item: WorkspaceItem | null) => {
        setSelectedItem(item);
        // Уведомление подписчиков выполняется через сам менеджер.
        // Здесь достаточно обновить локальное состояние выбранного элемента.
    };

    const getServiceItems = (serviceId: string): WorkspaceItem[] => {
        return workspaceIntegrationManager.getServiceItems(serviceId);
    };

    const value: ServiceWorkspaceContextType = {
        serviceItems,
        selectedItem,
        createItem,
        updateItem,
        deleteItem,
        selectItem,
        getServiceItems
    };

    return (
        <ServiceWorkspaceContext.Provider value={value}>
            {children}
        </ServiceWorkspaceContext.Provider>
    );
};
