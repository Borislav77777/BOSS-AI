/**
 * Холст проекта - визуальное рабочее пространство
 * Позволяет работать с элементами проекта в интерактивном режиме
 */
import { WorkspaceItem } from '@/types';
import React from 'react';
interface ProjectCanvasProps {
    project: WorkspaceItem;
    items: WorkspaceItem[];
    onItemClick: (item: WorkspaceItem) => void;
    onItemSendToChat: (item: WorkspaceItem) => void;
    onItemDelete: (item: WorkspaceItem) => void;
    className?: string;
}
export declare const ProjectCanvas: React.FC<ProjectCanvasProps>;
export {};
//# sourceMappingURL=ProjectCanvas.d.ts.map