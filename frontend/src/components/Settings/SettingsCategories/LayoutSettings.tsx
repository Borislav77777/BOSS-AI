/**
 * Компонент настроек макета
 */

import { SettingItem } from '@/components/common/SettingItem';
import { useSettings } from '@/hooks/useSettings';
import { MessageSquare, Monitor, Sidebar } from 'lucide-react';
import React from 'react';
import { BooleanSettingsGrid } from '../common/BooleanSettingsGrid';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
import { SettingsCategoryProps } from '../types';

export const LayoutSettings: React.FC<SettingsCategoryProps> = ({
    showAdvanced,
    searchQuery: _searchQuery
}) => {
    const { settings, updateSetting } = useSettings();

    const layoutItems: any[] = [ // eslint-disable-line @typescript-eslint/no-explicit-any
        {
            key: 'sidebarCollapsed',
            title: 'Свернутый сайдбар',
            description: 'Свернуть боковую панель по умолчанию - скрывает левую панель навигации',
            type: 'boolean',
            value: settings.sidebarCollapsed,
            icon: Sidebar
        },
        {
            key: 'chatVisible',
            title: 'Видимость чата',
            description: 'Показывать панель чата по умолчанию - отображает правую панель чата',
            type: 'boolean',
            value: settings.chatVisible,
            icon: MessageSquare
        },
        {
            key: 'workspaceLayout',
            title: 'Макет рабочего пространства',
            description: 'Сетка или список для проектов',
            type: 'boolean',
            value: settings.workspaceLayout === 'grid',
            icon: Monitor
        }
    ];

    const handleSettingChange = (key: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        updateSetting(key, value);
    };

    return (
        <div className="space-y-4">
            {/* Заголовок категории */}
            <div className="flex items-center space-x-2 mb-4">
                <Monitor className="w-4 h-4 text-primary dark:text-white" />
                <h2 className="text-base font-medium text-text">Макет</h2>
            </div>

            {/* Размеры панелей */}
            <CompactSettingsGroup
                title="Размеры панелей"
                className="mb-4"
            >
                <SettingItem
                    item={{
                        id: 'chatWidth',
                        name: 'Ширина чата',
                        description: 'Ширина панели чата в пикселях',
                        type: 'number',
                        value: settings.chatWidth || 400,
                        min: 250,
                        max: 2000,
                        step: 10,
                        onChange: (value) => handleSettingChange('chatWidth', value)
                    }}
                    onChange={handleSettingChange}
                />

                <SettingItem
                    item={{
                        id: 'chatInputHeight',
                        name: 'Высота поля ввода',
                        description: 'Высота поля ввода чата в пикселях',
                        type: 'number',
                        value: settings.chatInputHeight || 300,
                        min: 256,
                        max: 800,
                        step: 10,
                        onChange: (value) => handleSettingChange('chatInputHeight', value)
                    }}
                    onChange={handleSettingChange}
                />

                <SettingItem
                    item={{
                        id: 'sidebarWidth',
                        name: 'Ширина сайдбара',
                        description: 'Ширина боковой панели в пикселях',
                        type: 'number',
                        value: settings.sidebarWidth || 300,
                        min: 256,
                        max: 600,
                        step: 10,
                        onChange: (value) => handleSettingChange('sidebarWidth', value)
                    }}
                    onChange={handleSettingChange}
                />
            </CompactSettingsGroup>

            {/* Видимость панелей */}
            <CompactSettingsGroup
                title="Видимость панелей"
                className="mb-4"
            >
                <BooleanSettingsGrid
                    items={layoutItems}
                    onSettingChange={handleSettingChange}
                />
            </CompactSettingsGroup>

            {/* Дополнительные настройки */}
            {showAdvanced && (
                <CompactSettingsGroup
                    title="Дополнительные настройки"
                    className="mb-6"
                >
                    <div className="text-sm text-text-secondary">
                        Дополнительные настройки макета будут добавлены в будущих версиях.
                    </div>
                </CompactSettingsGroup>
            )}
        </div>
    );
};
