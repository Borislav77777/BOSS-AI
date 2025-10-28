import React, { memo, useCallback } from 'react';
import { SelectOption, SettingValue } from '../../../types';
import { cn } from '../../../utils/cn';

interface ButtonSelectProps {
    value: SettingValue;
    options: SelectOption[];
    onChange: (value: SettingValue) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Компонент выбора с кнопками вместо выпадающего списка
 * Решает проблему с z-index и позиционированием
 */
export const ButtonSelect: React.FC<ButtonSelectProps> = memo(({
    value,
    options,
    onChange,
    placeholder,
    className
}) => {
    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const handleSelect = useCallback((option: SelectOption) => {
        onChange(option.value);
    }, [onChange]);

    const ariaLabel = selectedOption?.label || placeholder || 'Выберите опцию';

    return (
        <div className={cn("space-y-2", className)}>
            <label className="block text-sm font-medium setting-label">
                {placeholder || 'Выберите опцию'}
            </label>
            <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label={ariaLabel}
            >
                {options.map((option) => {
                    const isSelected = String(option.value) === String(value);
                    return (
                        <button
                            key={String(option.value)}
                            type="button"
                            role="radio"
                            onClick={() => handleSelect(option)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                "border focus:outline-none focus:ring-2 focus:border-transparent",
                                "hover:scale-105 active:scale-95",
                                isSelected
                                    ? "bg-primary text-background border-primary shadow-lg"
                                    : "bg-input-bg text-input-text border-input-border hover:bg-surface-hover"
                            )}
                            aria-checked={isSelected}
                            aria-label={`${ariaLabel}: ${option.label}`}
                            tabIndex={isSelected ? 0 : -1}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

ButtonSelect.displayName = 'ButtonSelect';
