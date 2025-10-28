/**
 * Компонент системных настроек
 */

// import { useSettings } from '@/hooks/useSettings';
import { Database, Info, Settings as SettingsIcon, Shield } from 'lucide-react';
import React from 'react';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
import { SettingsCategoryProps } from '../types';

export const SystemSettings: React.FC<SettingsCategoryProps> = ({
    showAdvanced,
    searchQuery: _searchQuery
}) => {
    // const { settings: _settings, updateSetting: _updateSetting } = useSettings();

    // const handleSettingChange = (_key: string, _value: any) => {
    //     // updateSetting(key, value);
    // };

    return (
        <div className="space-y-6">
            {/* Заголовок категории */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SettingsIcon className="w-4 h-4 text-primary dark:text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text">Система</h2>
                    <p className="text-sm text-text-secondary">Системные настройки и информация</p>
                </div>
            </div>

            {/* Информация о системе */}
            <CompactSettingsGroup
                title="Информация о системе"
                description="Информация о платформе и версии"
                className="mb-6"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 settings-card">
                        <div className="flex items-center space-x-3">
                            <Info className="w-4 h-4 text-text-secondary" />
                            <div>
                                <div className="text-sm font-medium text-text">Версия платформы</div>
                                <div className="text-xs text-text-secondary">1.0.0</div>
                            </div>
                        </div>
                        <div className="text-sm text-text-secondary">v1.0.0</div>
                    </div>

                    <div className="flex items-center justify-between p-3 settings-card">
                        <div className="flex items-center space-x-3">
                            <Database className="w-4 h-4 text-text-secondary" />
                            <div>
                                <div className="text-sm font-medium text-text">Размер данных</div>
                                <div className="text-xs text-text-secondary">Настройки и кэш</div>
                            </div>
                        </div>
                        <div className="text-sm text-text-secondary">~2.5 MB</div>
                    </div>
                </div>
            </CompactSettingsGroup>

            {/* Безопасность */}
            <CompactSettingsGroup
                title="Безопасность"
                description="Настройки безопасности и приватности"
                className="mb-6"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 settings-card">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-4 h-4 text-text-secondary" />
                            <div>
                                <div className="text-sm font-medium text-text">Шифрование данных</div>
                                <div className="text-xs text-text-secondary">Все данные зашифрованы</div>
                            </div>
                        </div>
                        <div className="text-sm text-green-500">Активно</div>
                    </div>
                </div>
            </CompactSettingsGroup>

            {/* Настройки производительности */}
            <CompactSettingsGroup
                title="Производительность"
                description="Настройки производительности системы"
                className="mb-6"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 settings-card">
                        <div className="flex items-center space-x-3">
                            <SettingsIcon className="w-4 h-4 text-text-secondary" />
                            <div>
                                <div className="text-sm font-medium text-text">Кэширование</div>
                                <div className="text-xs text-text-secondary">Включено для ускорения работы</div>
                            </div>
                        </div>
                        <div className="text-sm text-green-500">Включено</div>
                    </div>
                </div>
            </CompactSettingsGroup>

            {/* Дополнительные настройки */}
            {showAdvanced && (
                <CompactSettingsGroup
                    title="Дополнительные настройки"
                    description="Расширенные системные параметры"
                    className="mb-6"
                >
                    <div className="text-sm text-text-secondary">
                        Дополнительные системные настройки будут добавлены в будущих версиях.
                    </div>
                </CompactSettingsGroup>
            )}
        </div>
    );
};
