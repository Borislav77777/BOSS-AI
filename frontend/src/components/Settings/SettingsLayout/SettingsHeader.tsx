/**
 * Компонент заголовка настроек
 */

import { cn } from '@/utils';
import { Download, RotateCcw, Search, Upload } from 'lucide-react';
import React from 'react';
import { SettingsHeaderProps } from '../types';

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
    searchQuery,
    onSearchChange,
    onExport,
    onImport,
    onReset
}) => {
    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
        }
    };

    return (
        <div className="flex items-center justify-between p-6 border-b border-border">
            {/* Заголовок */}
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="w-4 h-4 text-primary dark:text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-text">Настройки</h1>
                    <p className="text-sm text-text-secondary">Управление параметрами платформы</p>
                </div>
            </div>

            {/* Поиск */}
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Поиск настроек..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={cn(
                            "pl-10 pr-4 py-2 w-64 rounded-lg border border-border",
                            "bg-surface text-text placeholder-text-secondary",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                            "transition-all duration-200"
                        )}
                    />
                </div>

                {/* Действия */}
                <div className="flex items-center space-x-2">
                    {/* Экспорт */}
                    <button
                        onClick={onExport}
                        className={cn(
                            "flex items-center space-x-2 px-3 py-2 rounded-lg",
                            "bg-surface border border-border text-text",
                            "hover:bg-surface-hover hover:border-primary/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50",
                            "transition-all duration-200"
                        )}
                        title="Экспортировать настройки"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Экспорт</span>
                    </button>

                    {/* Импорт */}
                    <label className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer",
                        "bg-surface border border-border text-text",
                        "hover:bg-surface-hover hover:border-primary/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        "transition-all duration-200"
                    )}>
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Импорт</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileImport}
                            className="hidden"
                        />
                    </label>

                    {/* Сброс */}
                    <button
                        onClick={onReset}
                        className={cn(
                            "flex items-center space-x-2 px-3 py-2 rounded-lg",
                            "bg-red-500/10 border border-red-500/20 text-red-500",
                            "hover:bg-red-500/20 hover:border-red-500/40",
                            "focus:outline-none focus:ring-2 focus:ring-red-500/50",
                            "transition-all duration-200"
                        )}
                        title="Сбросить все настройки"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-sm">Сброс</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
