/**
 * Компонент расширенных настроек
 */

import { useSettings } from '@/hooks/useSettings';
import { AlertTriangle, Eye } from 'lucide-react';
import React from 'react';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
import { SettingsCategoryProps } from '../types';

export const AdvancedSettings: React.FC<SettingsCategoryProps> = ({
    showAdvanced,
    searchQuery
}) => {
    const { settings, updateSetting } = useSettings();

    const handleSettingChange = (key: string, value: any) => {
        updateSetting(key, value);
    };

    return (
        <div className="space-y-6">
            {/* Заголовок категории */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-primary dark:text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text">Расширенные настройки</h2>
                    <p className="text-sm text-text-secondary">Продвинутые параметры для опытных пользователей</p>
                </div>
            </div>

            {/* Предупреждение */}
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-sm font-medium text-yellow-500 mb-1">
                            Внимание
                        </div>
                        <div className="text-sm text-text-secondary">
                            Изменение этих настроек может повлиять на работу платформы.
                            Будьте осторожны при изменении значений.
                        </div>
                    </div>
                </div>
            </div>

            {/* Отладка */}
            <CompactSettingsGroup
                title="Отладка"
                description="Настройки для разработчиков и отладки"
                className="mb-6"
            >
                <div className="space-y-4">
                    <div className="text-sm text-text-secondary">
                        Настройки отладки будут добавлены в будущих версиях.
                    </div>
                </div>
            </CompactSettingsGroup>

            {/* API */}
            <CompactSettingsGroup
                title="API"
                description="Настройки API и интеграций"
                className="mb-6"
            >
                <div className="space-y-4">
                    <div className="text-sm text-text-secondary">
                        Настройки API будут добавлены в будущих версиях.
                    </div>
                </div>
            </CompactSettingsGroup>

            {/* Экспериментальные функции */}
            <CompactSettingsGroup
                title="Экспериментальные функции"
                description="Функции в разработке (могут быть нестабильными)"
                className="mb-6"
            >
                <div className="space-y-4">
                    <div className="text-sm text-text-secondary">
                        Экспериментальные функции будут добавлены в будущих версиях.
                    </div>
                </div>
            </CompactSettingsGroup>
        </div>
    );
};
