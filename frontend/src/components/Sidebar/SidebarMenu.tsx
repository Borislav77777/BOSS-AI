import { cn } from '@/utils';
import React, { memo } from 'react';

interface MenuItem {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
}

interface SidebarMenuProps {
    items: MenuItem[];
    activeItem: string;
    isCollapsed: boolean;
    className?: string;
}

/**
 * Компонент основного меню сайдбара
 */
export const SidebarMenu = memo<SidebarMenuProps>(({
    items,
    activeItem,
    isCollapsed,
    className = ''
}) => {
    return (
        <ul className={cn('space-y-1', className)}>
            {items.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;

                return (
                    <li key={item.id} className="animate-interface-stagger">
                        <button
                            onClick={item.action}
                            className={cn(
                                'w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group',
                                'hover:bg-surface-hover hover:shadow-sm',
                                isActive ? 'bg-primary text-button-primary-text shadow-lg' : 'text-white hover:text-white',
                                isCollapsed ? 'justify-center' : 'justify-start'
                            )}
                            title={isCollapsed ? item.name : undefined}
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <Icon className={cn(
                                'transition-all duration-200',
                                isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3',
                                isActive ? 'text-button-primary-text' : 'text-white group-hover:text-white'
                            )} />

                            {!isCollapsed && (
                                <span className="text-sm font-medium truncate">
                                    {item.name}
                                </span>
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
});

SidebarMenu.displayName = 'SidebarMenu';
