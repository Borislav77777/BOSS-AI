/**
 * Компонент настроек сервиса
 */

import { SettingItem } from '@/components/common/SettingItem';
import { ServiceRegistryEntry } from '@/services/ServiceRegistry/types';
import { cn } from '@/utils';
import React from 'react';
import { CompactSettingsGroup } from '../common/CompactSettingsGroup';

interface ServiceSettingsComponentProps {
    service: ServiceRegistryEntry;
    onSettingChange: (key: string, value: any) => void;
    className?: string;
}

export const ServiceSettingsComponent: React.FC<ServiceSettingsComponentProps> = ({
    service,
    onSettingChange,
    className
}) => {
    const settings = service.config.settings || {};

    const renderSetting = (key: string, value: any) => {
        const settingKey = `${service.config.id}.${key}`;

        if (typeof value === 'boolean') {
            return (
                <SettingItem
                    key={settingKey}
                    item={{
                        id: settingKey,
                        name: key,
                        description: `Настройка для ${service.config.name}`,
                        type: 'boolean',
                        value: value,
                        onChange: (newValue) => onSettingChange(settingKey, newValue)
                    }}
                    onChange={onSettingChange}
                />
            );
        }

        if (typeof value === 'string') {
            return (
                <SettingItem
                    key={settingKey}
                    item={{
                        id: settingKey,
                        name: key,
                        description: `Настройка для ${service.config.name}`,
                        type: 'string',
                        value: value,
                        onChange: (newValue) => onSettingChange(settingKey, newValue)
                    }}
                    onChange={onSettingChange}
                />
            );
        }

        if (typeof value === 'number') {
            return (
                <SettingItem
                    key={settingKey}
                    item={{
                        id: settingKey,
                        name: key,
                        description: `Настройка для ${service.config.name}`,
                        type: 'number',
                        value: value,
                        min: 0,
                        max: 100,
                        step: 1,
                        onChange: (newValue) => onSettingChange(settingKey, newValue)
                    }}
                    onChange={onSettingChange}
                />
            );
        }

        if (Array.isArray(value)) {
            return (
                <SettingItem
                    key={settingKey}
                    item={{
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
                    }}
                    onChange={onSettingChange}
                />
            );
        }

        return null;
    };

    if (Object.keys(settings).length === 0) {
        return null;
    }

    return (
        <div className={cn("service-settings", className)}>
            <CompactSettingsGroup
                title={service.config.name}
                description={`Настройки сервиса`}
                className="mb-6"
            >
                <div className="space-y-4">
                    {Object.entries(settings).map(([key, value]) => (
                        <div key={key}>
                            {renderSetting(key, value)}
                        </div>
                    ))}
                </div>
            </CompactSettingsGroup>
        </div>
    );
};
