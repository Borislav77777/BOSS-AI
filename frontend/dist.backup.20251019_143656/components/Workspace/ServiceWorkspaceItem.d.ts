/**
 * Компонент элемента Workspace для сервисов
 */
import { WorkspaceItem } from '@/services/WorkspaceIntegration/types';
import React from 'react';
interface ServiceWorkspaceItemProps {
    item: WorkspaceItem;
    isSelected?: boolean;
    onSelect?: (item: WorkspaceItem) => void;
    onDoubleClick?: (item: WorkspaceItem) => void;
    onContextMenu?: (item: WorkspaceItem, event: React.MouseEvent) => void;
    className?: string;
}
export declare const ServiceWorkspaceItem: React.FC<ServiceWorkspaceItemProps>;
export {};
//# sourceMappingURL=ServiceWorkspaceItem.d.ts.map