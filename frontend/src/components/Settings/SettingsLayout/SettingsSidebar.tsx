/**
 * Компонент боковой панели настроек
 */

import { cn } from '@/utils';
import {
    Bell,
    Eye,
    MessageSquare,
    Monitor,
    Palette,
    Settings as SettingsIcon
} from 'lucide-react';
import React from 'react';
import { SettingsSidebarProps } from '../types';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    appearance: Palette,
    behavior: Bell,
    layout: Monitor,
    system: SettingsIcon,
    advanced: Eye,
    chat: MessageSquare,
    services: SettingsIcon
};

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
    categories,
    selectedCategory,
    onCategorySelect
}) => {
    return (
        <div className="w-64 bg-surface border-r border-border">
            <div className="p-4">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                    Категории
                </h2>

                <nav className="space-y-1">
                    {/* Все настройки */}
                    <button
                        onClick={() => onCategorySelect(null)}
                        className={cn(
                            "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left",
                            "transition-all duration-200",
                            selectedCategory === null
                                ? "bg-primary text-background"
                                : "text-text-secondary hover:bg-surface-hover hover:text-text"
                        )}
                    >
                        <SettingsIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Все настройки</span>
                    </button>

                    {/* Категории */}
                    {categories.map((category) => {
                        const Icon = categoryIcons[category.id] || SettingsIcon;

                        return (
                            <button
                                key={category.id}
                                onClick={() => onCategorySelect(category.id)}
                                className={cn(
                                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left",
                                    "transition-all duration-200",
                                    selectedCategory === category.id
                                        ? "bg-primary text-button-primary-text shadow-[0_2px_8px_var(--success-hover)]"
                                        : "text-text-secondary hover:bg-surface-hover hover:text-text hover:shadow-[0_2px_8px_var(--success-hover)]"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {category.name}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};
