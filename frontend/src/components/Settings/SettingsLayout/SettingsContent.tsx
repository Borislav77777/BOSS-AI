/**
 * Компонент основного контента настроек
 */

import React from 'react';
import { ServiceSettingsComponent, useServiceSettings } from '../ServiceSettings';
import { AdvancedSettings } from '../SettingsCategories/AdvancedSettings';
import { AppearanceSettings } from '../SettingsCategories/AppearanceSettings';
import { BehaviorSettings } from '../SettingsCategories/BehaviorSettings';
import { LayoutSettings } from '../SettingsCategories/LayoutSettings';
import { SystemSettings } from '../SettingsCategories/SystemSettings';
import { SettingsContentProps } from '../types';

export const SettingsContent: React.FC<SettingsContentProps> = ({
    selectedCategory,
    showAdvanced,
    searchQuery
}) => {
    const { serviceSettings } = useServiceSettings();

    const renderCategoryContent = () => {
        switch (selectedCategory) {
            case 'appearance':
                return (
                    <AppearanceSettings
                        category={{
                            id: 'appearance',
                            name: 'Внешний вид',
                            description: 'Настройки темы, шрифтов и отображения',
                            icon: 'Palette',
                            items: []
                        }}
                        showAdvanced={showAdvanced}
                        searchQuery={searchQuery}
                    />
                );
            case 'interface':
                return (
                    <LayoutSettings
                        category={{
                            id: 'interface',
                            name: 'Интерфейс',
                            description: 'Настройки панелей и макета',
                            icon: 'Layout',
                            items: []
                        }}
                        showAdvanced={showAdvanced}
                        searchQuery={searchQuery}
                    />
                );
            case 'chat':
                return (
                    <BehaviorSettings
                        category={{
                            id: 'chat',
                            name: 'Чат',
                            description: 'Настройки чата и сообщений',
                            icon: 'MessageSquare',
                            items: []
                        }}
                        showAdvanced={showAdvanced}
                        searchQuery={searchQuery}
                    />
                );
            case 'notifications':
                return (
                    <SystemSettings
                        category={{
                            id: 'notifications',
                            name: 'Уведомления',
                            description: 'Настройки уведомлений и звуков',
                            icon: 'Bell',
                            items: []
                        }}
                        showAdvanced={showAdvanced}
                        searchQuery={searchQuery}
                    />
                );

            case 'services':
                return (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-text">Настройки сервисов</h2>
                        {serviceSettings.map(service => (
                            <ServiceSettingsComponent
                                key={service.config.id}
                                service={service}
                                onSettingChange={(key, value) => {
                                    console.log(`Изменение настройки ${key}:`, value);
                                    // TODO: Реализовать сохранение настроек сервиса
                                }}
                            />
                        ))}
                        {serviceSettings.length === 0 && (
                            <div className="text-center py-8 text-text-secondary">
                                Нет доступных настроек сервисов
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="space-y-6">
                        <AppearanceSettings
                            category={{
                                id: 'appearance',
                                name: 'Внешний вид',
                                description: 'Настройки темы, шрифтов и отображения',
                                icon: 'Palette',
                                items: []
                            }}
                            showAdvanced={showAdvanced}
                            searchQuery={searchQuery}
                        />
                        <LayoutSettings
                            category={{
                                id: 'interface',
                                name: 'Интерфейс',
                                description: 'Настройки панелей и макета',
                                icon: 'Layout',
                                items: []
                            }}
                            showAdvanced={showAdvanced}
                            searchQuery={searchQuery}
                        />
                        <BehaviorSettings
                            category={{
                                id: 'chat',
                                name: 'Чат',
                                description: 'Настройки чата и сообщений',
                                icon: 'MessageSquare',
                                items: []
                            }}
                            showAdvanced={showAdvanced}
                            searchQuery={searchQuery}
                        />
                        <SystemSettings
                            category={{
                                id: 'notifications',
                                name: 'Уведомления',
                                description: 'Настройки уведомлений и звуков',
                                icon: 'Bell',
                                items: []
                            }}
                            showAdvanced={showAdvanced}
                            searchQuery={searchQuery}
                        />
                        {showAdvanced && (
                            <AdvancedSettings
                                category={{
                                    id: 'advanced',
                                    name: 'Расширенные',
                                    description: 'Продвинутые параметры для опытных пользователей',
                                    icon: 'Settings',
                                    items: []
                                }}
                                showAdvanced={showAdvanced}
                                searchQuery={searchQuery}
                            />
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="p-6">
            {renderCategoryContent()}
        </div>
    );
};
