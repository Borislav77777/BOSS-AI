/**
 * Компонент для группировки связанных настроек
 */

import { cn } from '@/utils';
import React from 'react';
import { CompactSettingsGroupProps } from '../types';

export const CompactSettingsGroup: React.FC<CompactSettingsGroupProps> = ({
    title,
    description,
    children,
    className
}) => (
    <div className={cn("p-4 settings-card", className)}>
        <div className="mb-4">
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            {description && (
                <p className="text-xs text-text-secondary mt-1">{description}</p>
            )}
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);
