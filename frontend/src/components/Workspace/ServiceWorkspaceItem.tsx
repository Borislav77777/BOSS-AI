/**
 * Компонент элемента Workspace для сервисов
 */

import { WorkspaceItem } from '@/services/WorkspaceIntegration/types';
import { cn } from '@/utils';
import React from 'react';

interface ServiceWorkspaceItemProps {
    item: WorkspaceItem;
    isSelected?: boolean;
    onSelect?: (item: WorkspaceItem) => void;
    onDoubleClick?: (item: WorkspaceItem) => void;
    onContextMenu?: (item: WorkspaceItem, event: React.MouseEvent) => void;
    className?: string;
}

export const ServiceWorkspaceItem: React.FC<ServiceWorkspaceItemProps> = ({
    item,
    isSelected = false,
    onSelect,
    onDoubleClick,
    onContextMenu,
    className
}) => {
    const handleClick = () => {
        onSelect?.(item);
    };

    const handleDoubleClick = () => {
        onDoubleClick?.(item);
    };

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        onContextMenu?.(item, event);
    };

    const getItemIcon = () => {
        // TODO: Реализовать отображение иконок сервисов
        switch (item.type) {
            case 'service':
                return '🔧';
            case 'document':
                return '📄';
            case 'folder':
                return '📁';
            case 'widget':
                return '⚡';
            default:
                return '📄';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div
            className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                "hover:bg-surface-hover hover:border-primary/50",
                isSelected
                    ? "bg-primary/10 border-primary/50 shadow-sm"
                    : "bg-surface border-border",
                className
            )}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
        >
            <div className="flex items-start space-x-3">
                {/* Иконка */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                    {getItemIcon()}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-text truncate">
                            {item.name}
                        </h3>
                        <span className="text-xs text-text-secondary">
                            {item.metadata.serviceId}
                        </span>
                    </div>

                    {item.description && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                            {item.description}
                        </p>
                    )}

                    {/* Метаданные */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                            {item.metadata.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <span className="text-xs text-text-secondary">
                            {formatDate(item.metadata.updatedAt)}
                        </span>
                    </div>

                    {/* Размер файла */}
                    {item.metadata.size && (
                        <div className="mt-1">
                            <span className="text-xs text-text-secondary">
                                {(item.metadata.size / 1024).toFixed(1)} KB
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
