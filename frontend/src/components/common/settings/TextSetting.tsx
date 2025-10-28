import React, { memo } from 'react';

interface TextSettingProps {
    name: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

/**
 * Компонент для текстовых настроек (input)
 * Выделен из SettingItem для лучшей модульности
 */
export const TextSetting: React.FC<TextSettingProps> = memo(({
    name,
    value,
    placeholder,
    onChange
}) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-setting-label">
                {name}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-setting-input"
                aria-label={name}
                placeholder={placeholder || `Введите ${name.toLowerCase()}`}
            />
        </div>
    );
});
