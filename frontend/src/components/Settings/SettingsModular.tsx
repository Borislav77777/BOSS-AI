/**
 * Модульная версия Settings компонента
 */

import { cn } from '@/utils';
import React from 'react';
import { useSettingsState } from './hooks/useSettingsState';
import { ServiceSettingsProvider } from './ServiceSettings';
import { SettingsContent } from './SettingsLayout/SettingsContent';
import { SettingsProps } from './types';

export const SettingsModular: React.FC<SettingsProps> = ({ className }) => {
    const { settingsState } = useSettingsState();

    return (
        <ServiceSettingsProvider>
            <div className={cn("settings-container h-full flex flex-col", className)}>
                {/* Стандартный заголовок настроек */}
                <div className="platform-service-header-standard">
                    <div className="platform-service-header-content">
                        <div className="platform-service-icon">⚙️</div>
                        <div className="platform-service-content">
                            <h3 className="platform-service-title">Настройки</h3>
                        </div>
                    </div>
                    <div className="platform-service-status">
                        {/* Убрана галочка из заголовка настроек */}
                    </div>
                </div>

                {/* Основной контент с границами и скроллом */}
                <div className="settings-content-container flex-1 min-h-0 overflow-y-auto border border-border rounded-lg bg-card-bg">
                    <div className="p-4">
                        <SettingsContent
                            selectedCategory={settingsState.selectedCategory}
                            showAdvanced={settingsState.showAdvanced}
                            searchQuery=""
                        />
                    </div>
                </div>
            </div>
        </ServiceSettingsProvider>
    );
};
