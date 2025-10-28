import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Компонент настроек сервиса
 */
import { SettingItem } from '@/components/common/SettingItem';
import { cn } from '@/utils';
import React from 'react';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';
export const ServiceSettingsComponent = ({ service, onSettingChange, className }) => {
    const settings = service.config.settings || {};
    const renderSetting = (key, value) => {
        const settingKey = `${service.config.id}.${key}`;
        if (typeof value === 'boolean') {
            return (_jsx(SettingItem, { item: {
                    id: settingKey,
                    name: key,
                    description: `Настройка для ${service.config.name}`,
                    type: 'boolean',
                    value: value,
                    onChange: (newValue) => onSettingChange(settingKey, newValue)
                }, onChange: onSettingChange }, settingKey));
        }
        if (typeof value === 'string') {
            return (_jsx(SettingItem, { item: {
                    id: settingKey,
                    name: key,
                    description: `Настройка для ${service.config.name}`,
                    type: 'string',
                    value: value,
                    onChange: (newValue) => onSettingChange(settingKey, newValue)
                }, onChange: onSettingChange }, settingKey));
        }
        if (typeof value === 'number') {
            return (_jsx(SettingItem, { item: {
                    id: settingKey,
                    name: key,
                    description: `Настройка для ${service.config.name}`,
                    type: 'number',
                    value: value,
                    min: 0,
                    max: 100,
                    step: 1,
                    onChange: (newValue) => onSettingChange(settingKey, newValue)
                }, onChange: onSettingChange }, settingKey));
        }
        if (Array.isArray(value)) {
            return (_jsx(SettingItem, { item: {
                    id: settingKey,
                    name: key,
                    description: `Настройка для ${service.config.name}`,
                    type: 'select',
                    value: value[0] || '',
                    options: value.map((item, index) => ({
                        value: item,
                        label: typeof item === 'string' ? item : `Опция ${index + 1}`
                    })),
                    onChange: (newValue) => onSettingChange(settingKey, newValue)
                }, onChange: onSettingChange }, settingKey));
        }
        return null;
    };
    if (Object.keys(settings).length === 0) {
        return null;
    }
    return (_jsx("div", { className: cn("service-settings", className), children: _jsx(CompactSettingsGroup, { title: service.config.name, description: `Настройки сервиса`, className: "mb-6", children: _jsx("div", { className: "space-y-4", children: Object.entries(settings).map(([key, value]) => (_jsx("div", { children: renderSetting(key, value) }, key))) }) }) }));
};
//# sourceMappingURL=ServiceSettingsComponent.js.map