import { ServiceTool } from '@/types/services';
import { cn } from '@/utils';
import React, { memo } from 'react';

interface SidebarToolProps {
    tool: ServiceTool;
    serviceId: string;
    onToolClick: (serviceId: string, toolId: string) => void;
    iconMap: Record<string, React.ComponentType<{ className?: string }>>;
    isCollapsed: boolean;
    className?: string;
}

/**
 * Компонент инструмента сервиса в сайдбаре
 */
export const SidebarTool = memo<SidebarToolProps>(({
    tool,
    serviceId,
    onToolClick,
    iconMap,
    isCollapsed,
    className = ''
}) => {
    const ToolIconCmp = iconMap[tool.icon] || iconMap.Folder;

    const handleClick = () => {
        onToolClick(serviceId, tool.id);
    };

    return (
        <button
            key={tool.id}
            onClick={handleClick}
            className={cn(
                'w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 group',
                'hover:bg-surface-hover hover:shadow-sm text-white hover:text-white',
                isCollapsed ? 'justify-center' : 'justify-start',
                className
            )}
            title={isCollapsed ? tool.name : undefined}
        >
            <ToolIconCmp className={cn(
                'transition-all duration-200',
                isCollapsed ? 'w-4 h-4' : 'w-4 h-4 mr-2',
                'text-icon-muted group-hover:text-icon-primary'
            )} />

            {!isCollapsed && (
                <span className="text-xs font-medium truncate">
                    {tool.name}
                </span>
            )}
        </button>
    );
});

SidebarTool.displayName = 'SidebarTool';
