import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const SettingsContent = ({ selectedCategory, showAdvanced, searchQuery }) => {
    const { serviceSettings } = useServiceSettings();
    const renderCategoryContent = () => {
        switch (selectedCategory) {
            case 'appearance':
                return (_jsx(AppearanceSettings, { category: {
                        id: 'appearance',
                        name: 'Внешний вид',
                        description: 'Настройки темы, шрифтов и отображения',
                        icon: 'Palette',
                        items: []
                    }, showAdvanced: showAdvanced, searchQuery: searchQuery }));
            case 'interface':
                return (_jsx(LayoutSettings, { category: {
                        id: 'interface',
                        name: 'Интерфейс',
                        description: 'Настройки панелей и макета',
                        icon: 'Layout',
                        items: []
                    }, showAdvanced: showAdvanced, searchQuery: searchQuery }));
            case 'chat':
                return (_jsx(BehaviorSettings, { category: {
                        id: 'chat',
                        name: 'Чат',
                        description: 'Настройки чата и сообщений',
                        icon: 'MessageSquare',
                        items: []
                    }, showAdvanced: showAdvanced, searchQuery: searchQuery }));
            case 'notifications':
                return (_jsx(SystemSettings, { category: {
                        id: 'notifications',
                        name: 'Уведомления',
                        description: 'Настройки уведомлений и звуков',
                        icon: 'Bell',
                        items: []
                    }, showAdvanced: showAdvanced, searchQuery: searchQuery }));
            case 'services':
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-lg font-semibold text-text", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u043E\u0432" }), serviceSettings.map(service => (_jsx(ServiceSettingsComponent, { service: service, onSettingChange: (key, value) => {
                                console.log(`Изменение настройки ${key}:`, value);
                                // TODO: Реализовать сохранение настроек сервиса
                            } }, service.config.id))), serviceSettings.length === 0 && (_jsx("div", { className: "text-center py-8 text-text-secondary", children: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A \u0441\u0435\u0440\u0432\u0438\u0441\u043E\u0432" }))] }));
            default:
                return (_jsxs("div", { className: "space-y-6", children: [_jsx(AppearanceSettings, { category: {
                                id: 'appearance',
                                name: 'Внешний вид',
                                description: 'Настройки темы, шрифтов и отображения',
                                icon: 'Palette',
                                items: []
                            }, showAdvanced: showAdvanced, searchQuery: searchQuery }), _jsx(LayoutSettings, { category: {
                                id: 'interface',
                                name: 'Интерфейс',
                                description: 'Настройки панелей и макета',
                                icon: 'Layout',
                                items: []
                            }, showAdvanced: showAdvanced, searchQuery: searchQuery }), _jsx(BehaviorSettings, { category: {
                                id: 'chat',
                                name: 'Чат',
                                description: 'Настройки чата и сообщений',
                                icon: 'MessageSquare',
                                items: []
                            }, showAdvanced: showAdvanced, searchQuery: searchQuery }), _jsx(SystemSettings, { category: {
                                id: 'notifications',
                                name: 'Уведомления',
                                description: 'Настройки уведомлений и звуков',
                                icon: 'Bell',
                                items: []
                            }, showAdvanced: showAdvanced, searchQuery: searchQuery }), showAdvanced && (_jsx(AdvancedSettings, { category: {
                                id: 'advanced',
                                name: 'Расширенные',
                                description: 'Продвинутые параметры для опытных пользователей',
                                icon: 'Settings',
                                items: []
                            }, showAdvanced: showAdvanced, searchQuery: searchQuery }))] }));
        }
    };
    return (_jsx("div", { className: "p-6", children: renderCategoryContent() }));
};
//# sourceMappingURL=SettingsContent.js.map