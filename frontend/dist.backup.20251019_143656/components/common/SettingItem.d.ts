import React from 'react';
import { SelectOption, SettingValue } from '../../types';
interface SettingItemProps {
    item: {
        id: string;
        name: string;
        description?: string;
        type: 'boolean' | 'string' | 'number' | 'select' | 'color' | 'file' | 'custom' | 'theme-selector' | 'font-size-slider' | 'rainbow-theme-system' | 'unified-rainbow-theme' | 'theme-buttons';
        value: SettingValue;
        options?: SelectOption[];
        min?: number;
        max?: number;
        step?: number;
        placeholder?: string;
        customColor?: string;
        onCustomColorChange?: (value: string) => void;
        onChange: (value: SettingValue) => void;
    };
    onChange: (key: string, value: SettingValue) => void;
    className?: string;
}
/**
 * Универсальный компонент для рендеринга элементов настроек
 * Устраняет дублирование кода между Sidebar и Settings
 * Оптимизированная версия с модульной архитектурой
 */
export declare const SettingItem: React.FC<SettingItemProps>;
export {};
//# sourceMappingURL=SettingItem.d.ts.map