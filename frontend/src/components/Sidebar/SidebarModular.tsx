import { usePlatform } from '@/hooks/usePlatform';
import { cn } from '@/utils';
import {
    Folder
} from 'lucide-react';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { SidebarMenu } from './SidebarMenu';
import { SidebarToggle } from './SidebarToggle';

interface SidebarProps {
    className?: string;
}

/**
 * Модульный сайдбар с разбиением на подкомпоненты
 */
export const SidebarModular: React.FC<SidebarProps> = memo(({ className }) => {
    const { state, toggleSidebar, switchSection } = usePlatform();
    const [activeItem, setActiveItem] = useState<string>('workspace');

    const isCollapsed = state.layout.sidebarCollapsed;

    // Инициализация CSS переменной при загрузке
    useEffect(() => {
        const el = document.querySelector('.sidebar-dynamic-width') as HTMLElement | null;
        if (el && !el.style.getPropertyValue('--sidebar-width')) {
            const targetWidth = isCollapsed ? 60 : state.layout.sidebarWidth;
            el.style.setProperty('--sidebar-width', `${targetWidth}px`);
        }
    }, [isCollapsed, state.layout.sidebarWidth]);

    // Обновление CSS переменной при сворачивании/разворачивании
    useEffect(() => {
        const el = document.querySelector('.sidebar-dynamic-width') as HTMLElement | null;
        if (el) {
            const targetWidth = isCollapsed ? 60 : state.layout.sidebarWidth;
            el.style.setProperty('--sidebar-width', `${targetWidth}px`);
        }
    }, [isCollapsed, state.layout.sidebarWidth]);

    // Мемоизированные пункты меню
    const menuItems = useMemo(() => [
        {
            id: 'workspace',
            name: 'Рабочее пространство',
            icon: Folder,
            action: () => {
                setActiveItem('workspace');
                switchSection('workspace');
            },
        },
    ], [switchSection]);


    // Обработчики


    return (
        <div
            className={cn(
                'sidebar-container relative flex flex-col h-full transition-all duration-300 ease-in-out',
                'bg-surface border-r border-border',
                isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded',
                className
            )}
        >
            {/* Кнопка сворачивания */}
            <SidebarToggle
                isCollapsed={isCollapsed}
                onToggle={toggleSidebar}
            />

            {/* Заголовок */}
            {!isCollapsed && (
                <div className="p-4 border-b border-border">
                    <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                            <span className="font-bold text-sm text-primary">B</span>
                        </div>
                        <h2 className="text-lg font-semibold text-white">
                            <span className="font-bold">oss</span> <span className="font-bold">Ai</span>
                        </h2>
                    </div>
                    <p className="text-xs text-white mt-1">
                        BARSUKOV OS v2.1.0
                    </p>
                </div>
            )}

            {/* Основное меню */}
            <div className="flex-1 p-4 space-y-6">
                <SidebarMenu
                    items={menuItems}
                    activeItem={activeItem}
                    isCollapsed={isCollapsed}
                />

            </div>

            {/* Футер */}
            {!isCollapsed && (
                <div className="p-4 border-t border-border">
                    <div className="text-xs text-white text-center">
                        © 2024 Boss Ai
                    </div>
                </div>
            )}
        </div>
    );
});

SidebarModular.displayName = 'SidebarModular';
