/**
 * Компонент настроек поведения
 */

import { SettingItem } from '@/components/common/SettingItem';
import { useSettings } from '@/hooks/useSettings';
import { Bell, Save, Type, Zap } from 'lucide-react';
import React from 'react';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
import { SettingsCategoryProps } from '../types';

export const BehaviorSettings: React.FC<SettingsCategoryProps> = ({
    showAdvanced,
    searchQuery: _searchQuery
}) => {
    const { settings, updateSetting } = useSettings();

    const handleSettingChange = (key: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        updateSetting(key, value);
    };

    const behaviorItems: Array<{ key: string; value: boolean; label: string; type: 'boolean'; icon: React.ComponentType<{ className?: string; }>; onChange: (value: any) => void; }> = [ // eslint-disable-line @typescript-eslint/no-explicit-any
        {
            key: 'animations',
            label: 'Анимации',
            type: 'boolean',
            value: settings.animations as boolean,
            icon: Zap,
            onChange: (value: any) => handleSettingChange('animations', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'autoSave',
            label: 'Автосохранение',
            type: 'boolean',
            value: settings.autoSave as boolean,
            icon: Save,
            onChange: (value: any) => handleSettingChange('autoSave', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        {
            key: 'useColoredText',
            label: 'Цветной текст',
            type: 'boolean',
            value: settings.useColoredText as boolean,
            icon: Type,
            onChange: (value: any) => handleSettingChange('useColoredText', value) // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    ];

    return (
        <div className="space-y-6">
            {/* Заголовок категории */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-primary dark:text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text">Поведение</h2>
                </div>
            </div>

            {/* Звуки и уведомления */}
            <CompactSettingsGroup
                title="Звуки и уведомления"
                className="mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {behaviorItems.filter(item => ['sounds', 'notifications'].includes(item.key)).map((item) => (
                        <div
                            key={item.key}
                            className="flex items-center space-x-3 p-3 settings-card hover:bg-surface-hover transition-colors"
                        >
                            <div className="flex-shrink-0">
                                <item.icon className="w-4 h-4 text-text-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-text">{item.label}</div>
                            </div>
                            <div className="flex-shrink-0">
                                <SettingItem
                                    item={{
                                        id: item.key,
                                        name: '',
                                        description: '',
                                        type: 'boolean',
                                        value: item.value || false,
                                        onChange: (value) => item.onChange(value)
                                    }}
                                    onChange={handleSettingChange}
                                    className="!p-0"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CompactSettingsGroup>

            {/* Автосохранение */}
            <CompactSettingsGroup
                title="Автосохранение"
                className="mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {behaviorItems.filter(item => item.key === 'autoSave').map((item) => (
                        <div
                            key={item.key}
                            className="flex items-center space-x-3 p-3 settings-card hover:bg-surface-hover transition-colors"
                        >
                            <div className="flex-shrink-0">
                                <item.icon className="w-4 h-4 text-text-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-text">{item.label}</div>
                            </div>
                            <div className="flex-shrink-0">
                                <SettingItem
                                    item={{
                                        id: item.key,
                                        name: '',
                                        description: '',
                                        type: 'boolean',
                                        value: item.value || false,
                                        onChange: (value) => item.onChange(value)
                                    }}
                                    onChange={handleSettingChange}
                                    className="!p-0"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <SettingItem
                        item={{
                            id: 'autoSaveInterval',
                            name: 'Интервал автосохранения',
                            type: 'select',
                            value: settings.autoSaveInterval || 5000,
                            options: [
                                { value: 1000, label: '1 секунда' },
                                { value: 5000, label: '5 секунд' },
                                { value: 10000, label: '10 секунд' },
                                { value: 30000, label: '30 секунд' },
                                { value: 60000, label: '1 минута' }
                            ],
                            onChange: (value) => handleSettingChange('autoSaveInterval', value)
                        }}
                        onChange={handleSettingChange}
                    />
                </div>
            </CompactSettingsGroup>

            {/* Дополнительные настройки */}
            {showAdvanced && (
                <CompactSettingsGroup
                    title="Дополнительные настройки"
                    className="mb-6"
                >
                    <div className="text-sm text-text-secondary">
                        Дополнительные настройки поведения будут добавлены в будущих версиях.
                    </div>
                </CompactSettingsGroup>
            )}
        </div>
    );
};
