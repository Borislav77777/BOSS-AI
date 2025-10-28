import React, { memo } from 'react';

interface BooleanSettingProps {
    name: string;
    description?: string;
    value: boolean;
    onChange: (value: boolean) => void;
}

/**
 * Компонент для булевых настроек (чекбоксы)
 * Выделен из SettingItem для лучшей модульности
 */
export const BooleanSetting: React.FC<BooleanSettingProps> = memo(({
    name,
    description,
    value,
    onChange
}) => {
    return (
        <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                    aria-label={name}
                />
                <div
                    className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${value ? 'boolean-checkbox-checked' : 'boolean-checkbox-unchecked'
                        }`}
                >
                    {value && (
                        <svg className="w-3 h-3 boolean-checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">{name}</div>
                {description && (
                    <div className="text-xs text-text-secondary mt-1">{description}</div>
                )}
            </div>
        </label>
    );
});
