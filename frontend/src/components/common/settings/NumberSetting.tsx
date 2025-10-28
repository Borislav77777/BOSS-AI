import React, { memo, useCallback, useEffect, useRef } from 'react';

interface NumberSettingProps {
    name: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}

/**
 * Компонент для числовых настроек (слайдеры)
 * Выделен из SettingItem для лучшей модульности
 */
export const NumberSetting: React.FC<NumberSettingProps> = memo(({
    name,
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange
}) => {
    const sliderRef = useRef<HTMLInputElement>(null);

    const updateSliderFill = useCallback((val: number) => {
        const percent = ((val - min) / (max - min)) * 100;
        if (sliderRef.current) {
            sliderRef.current.style.setProperty('--percent', `${percent}%`);
        }
    }, [min, max]);

    useEffect(() => {
        updateSliderFill(Number(value));
    }, [value, min, max, updateSliderFill]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium number-setting-label">
                    {name}
                </label>
                <span
                    className="px-2 py-0.5 rounded-md text-xs shadow-sm number-setting-value"
                    aria-live="polite"
                >
                    {String(value)}
                </span>
            </div>
            <input
                ref={sliderRef}
                type="range"
                value={Number(value)}
                min={min}
                max={max}
                step={step}
                onChange={(e) => {
                    const v = Number(e.target.value);
                    updateSliderFill(v);
                    onChange(v);
                }}
                className="slider-brand w-full h-2 appearance-none rounded-lg outline-none cursor-pointer border focus:ring-2 number-setting-slider"
                aria-label={name}
            />
            <div className="flex justify-between text-xs number-setting-range">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
});
