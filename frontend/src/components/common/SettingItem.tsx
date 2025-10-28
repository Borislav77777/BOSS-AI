import { cn } from '@/utils/cn';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { SelectOption, SettingValue } from '../../types';
import { ButtonSelect, FontSizeSlider, ThemeSelector } from './settings';
import { SettingsErrorBoundary } from './SettingsErrorBoundary';

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
export const SettingItem: React.FC<SettingItemProps> = memo(({
    item,
    onChange,
    className
}) => {
    // Типизированные значения для разных типов настроек
    const value = item?.value;
    const booleanValue = typeof value === 'boolean' ? value : false;
    const stringValue = typeof value === 'string' ? value : '';
    const numberValue = typeof value === 'number' ? value : 0;

    const renderBoolean = useCallback(() => (
        <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={booleanValue}
                    onChange={(e) => onChange(item.id, e.target.checked)}
                    className="sr-only"
                    aria-label={item.name}
                />
                <div
                    className={cn(
                        "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center setting-checkbox",
                        booleanValue && "checked"
                    )}
                >
                    {booleanValue && (
                        <svg className="w-3 h-3 setting-checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </div>
            <span className="text-sm transition-colors duration-200 setting-description">
                {item.name}
            </span>
        </label>
    ), [booleanValue, item.id, item.name, onChange]);

    const renderSelect = useCallback(() => (
        <div className="space-y-2">
            <label className="block text-sm font-medium setting-label">
                {item.name}
            </label>
            <ButtonSelect
                value={stringValue}
                options={item.options || []}
                onChange={(newValue) => onChange(item.id, newValue)}
                placeholder={item.placeholder}
            />
        </div>
    ), [stringValue, item.name, item.options, item.placeholder, item.id, onChange]);

    const sliderRef = useRef<HTMLInputElement>(null);
    const min = item.min ?? 0;
    const max = item.max ?? 100;
    const step = item.step ?? 1;

    const updateSliderFill = useCallback((val: number) => {
        const percent = ((val - min) / (max - min)) * 100;
        if (sliderRef.current) {
            sliderRef.current.style.setProperty('--percent', `${percent}%`);
        }
    }, [min, max]);

    useEffect(() => {
        updateSliderFill(numberValue);
    }, [numberValue, updateSliderFill]);

    const renderNumber = useCallback(() => {

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium setting-label">
                        {item.name}
                    </label>
                    <span
                        className="px-2 py-0.5 rounded-md text-xs shadow-sm setting-slider-value"
                        aria-live="polite"
                    >
                        {String(numberValue)}
                    </span>
                </div>
                <input
                    ref={sliderRef}
                    type="range"
                    value={numberValue}
                    min={min}
                    max={max}
                    step={step}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        updateSliderFill(v);
                        onChange(item.id, v);
                    }}
                    className="slider-brand w-full h-2 appearance-none rounded-lg outline-none cursor-pointer border focus:ring-2 setting-slider-base"
                    aria-label={item.name}
                />
                <div className="flex justify-between text-xs setting-muted">
                    <span>{min}</span>
                    <span>{max}</span>
                </div>
            </div>
        );
    }, [numberValue, item.name, min, max, step, item.id, onChange, updateSliderFill]);

    const renderColor = useCallback(() => (
        <div className="space-y-2">
            <label className="block text-sm font-medium setting-label">
                {item.name}
            </label>
            <input
                type="color"
                value={stringValue}
                onChange={(e) => onChange(item.id, e.target.value)}
                className="w-12 h-10 rounded border-2 border-border cursor-pointer"
                aria-label={item.name}
                title={`Выберите цвет для ${item.name}`}
            />
        </div>
    ), [stringValue, item.name, item.id, onChange]);

    const renderText = useCallback(() => (
        <div className="space-y-2">
            <label className="block text-sm font-medium setting-label">
                {item.name}
            </label>
            <input
                type="text"
                value={stringValue}
                onChange={(e) => onChange(item.id, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 setting-input-base"
                aria-label={item.name}
                placeholder={item.placeholder || `Введите ${item.name.toLowerCase()}`}
            />
        </div>
    ), [stringValue, item.name, item.placeholder, item.id, onChange]);

    const renderContent = useCallback(() => {
        switch (item.type) {
            case 'boolean':
                return renderBoolean();
            case 'select':
                return renderSelect();
            case 'number':
                return renderNumber();
            case 'color':
                return renderColor();
            case 'font-size-slider':
                return (
                    <FontSizeSlider
                        value={typeof item.value === 'string' ? item.value : 'medium'}
                        onChange={item.onChange}
                    />
                );
            case 'theme-selector':
                return (
                    <ThemeSelector
                        theme={typeof item.value === 'string' ? item.value as 'light' | 'dark' : 'light'}
                        onThemeChange={item.onChange}
                    />
                );
            case 'rainbow-theme-system':
                return (
                    <ThemeSelector
                        theme={typeof item.value === 'string' ? item.value as 'light' | 'dark' : 'dark'}
                        onThemeChange={item.onChange}
                    />
                );
            case 'unified-rainbow-theme':
                return (
                    <ThemeSelector
                        theme={typeof item.value === 'string' ? item.value as 'light' | 'dark' : 'dark'}
                        onThemeChange={item.onChange}
                    />
                );
            case 'theme-buttons':
                return (
                    <ThemeSelector
                        theme={typeof item.value === 'string' ? item.value as 'light' | 'dark' : 'dark'}
                        onThemeChange={item.onChange}
                    />
                );
            default:
                return renderText();
        }
    }, [item.type, item.value, item.onChange, renderBoolean, renderSelect, renderNumber, renderColor, renderText]);

    // Проверяем, что item существует
    if (!item) {
        console.error('SettingItem: item is undefined');
        return null;
    }

    return (
        <SettingsErrorBoundary settingName={item.name}>
            <div
                className={cn(
                    "setting-item-container",
                    className
                )}
            >
                <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1 setting-label">
                        {item.name}
                    </h4>
                    {item.description && (
                        <p className="text-xs leading-relaxed setting-description">
                            {item.description}
                        </p>
                    )}
                </div>
                <div className="mt-3">
                    {renderContent()}
                </div>
            </div>
        </SettingsErrorBoundary>
    );
});
