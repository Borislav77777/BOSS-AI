/**
 * Компонент для отображения сетки булевых настроек
 */

import { SettingItem } from '@/components/common/SettingItem';
import React from 'react';
import { BooleanSettingsGridProps } from '../types';

export const BooleanSettingsGrid: React.FC<BooleanSettingsGridProps> = ({
    items,
    onSettingChange
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
                <div
                    key={item.key}
                    className="flex items-center space-x-3 p-3 settings-card hover:bg-surface-hover transition-colors"
                >
                    <div className="flex-shrink-0">
                        <item.icon className="w-4 h-4 text-text-secondary dark:text-white" />
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
                                onChange: (value) => onSettingChange(item.key, value)
                            }}
                            onChange={onSettingChange}
                            className="!p-0"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
