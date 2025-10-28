/**
 * Компонент настроек внешнего вида
 */

import { SettingItem } from '@/components/common/SettingItem';
import { useSettings } from '@/hooks/useSettings';
import { SettingValue } from '@/types';
import { Palette } from 'lucide-react';
import React from 'react';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
import { SettingsCategoryProps } from '../types';

export const AppearanceSettings: React.FC<SettingsCategoryProps> = ({
    showAdvanced,
    searchQuery: _searchQuery
}) => {
    const { settings, updateSetting } = useSettings();

    const appearanceItems = [
        {
            id: 'animations',
            name: 'Анимации',
            description: 'Плавно',
            type: 'boolean' as const,
            value: settings.animations,
            onChange: (value: SettingValue) => handleSettingChange('animations', value)
        }
    ];

    const handleSettingChange = (key: string, value: SettingValue) => {
        updateSetting(key, value);
    };

    return (
        <div className="space-y-6">
            {/* Заголовок категории */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-primary dark:text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text">Внешний вид</h2>
                </div>
            </div>

            {/* Тема */}
            <CompactSettingsGroup
                title="Тема"
                className="mb-6"
            >
                <SettingItem
                    item={{
                        id: 'theme',
                        name: 'Цветовая тема',
                        description: 'Схема',
                        type: 'select',
                        value: settings.theme || 'dark',
                        options: [
                            { value: 'light', label: 'Светлая' },
                            { value: 'dark', label: 'Темная' }
                        ],
                        onChange: (value) => handleSettingChange('theme', value)
                    }}
                    onChange={handleSettingChange}
                />
            </CompactSettingsGroup>



            {/* Анимации */}
            <CompactSettingsGroup
                title="Анимации"
                className="mb-6"
            >
                <SettingItem
                    item={appearanceItems[0]}
                    onChange={handleSettingChange}
                />
            </CompactSettingsGroup>

            {/* Дополнительные настройки */}
            {showAdvanced && (
                <CompactSettingsGroup
                    title="Дополнительные настройки"
                    description="Дополнительно"
                    className="mb-6"
                >
                    <div className="text-sm text-text-secondary">
                        Дополнительные настройки внешнего вида будут добавлены в будущих версиях.
                    </div>
                </CompactSettingsGroup>
            )}
        </div>
    );
};
