import React, { memo, useCallback, useMemo, useState } from 'react';
import { cn } from '../../../utils/cn';

interface FontSizeSliderProps {
    value: string;
    onChange: (value: string) => void;
}

/**
 * Ползунок для выбора размера шрифта
 * Показывает предварительный просмотр размера шрифта
 */
export const FontSizeSlider: React.FC<FontSizeSliderProps> = memo(({
    value,
    onChange
}) => {
    const [isDragging, setIsDragging] = useState(false);

    // Маппинг значений размера шрифта - статический объект для оптимизации
    const fontSizeMap = useMemo(() => ({
        'small': { value: 1, label: 'Маленький', size: '0.875rem' },
        'medium': { value: 2, label: 'Средний', size: '1rem' },
        'large': { value: 3, label: 'Большой', size: '1.125rem' }
    }), []); // Пустой массив зависимостей для стабильности

    const currentSize = fontSizeMap[value as keyof typeof fontSizeMap] || fontSizeMap.medium;

    // Обработчик изменения ползунка
    const handleSliderChange = useCallback((newValue: number) => {
        const sizeKey = Object.keys(fontSizeMap).find(
            key => fontSizeMap[key as keyof typeof fontSizeMap].value === newValue
        ) as keyof typeof fontSizeMap;

        if (sizeKey) {
            onChange(sizeKey);
        }
    }, [onChange, fontSizeMap]);

    // Обработчик взаимодействия с ползунком
    const handleSliderInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const relativeX = x - rect.left;
        const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));

        // Преобразуем процент в значение (1, 2, или 3)
        let newValue: number;
        if (percentage < 33) {
            newValue = 1;
        } else if (percentage < 66) {
            newValue = 2;
        } else {
            newValue = 3;
        }

        handleSliderChange(newValue);
    }, [handleSliderChange]);

    return (
        <div className="space-y-4">
            {/* Предварительный просмотр размера шрифта */}
            <div className="p-4 rounded-lg border font-size-preview"
                style={{ '--font-size-preview': currentSize.size } as React.CSSProperties}>
                <div className="text-sm text-muted-foreground mb-2">
                    Предварительный просмотр:
                </div>
                <div className="font-medium">
                    Размер шрифта: {currentSize.label}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                    Заголовок H1, обычный текст и мелкий текст
                </div>
            </div>

            {/* Ползунок */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Маленький</span>
                    <span>Средний</span>
                    <span>Большой</span>
                </div>

                <div className="relative">
                    {/* Фон ползунка */}
                    <div className="w-full h-2 bg-black dark:bg-black rounded-full relative">
                        {/* Активная область */}
                        <div
                            className="absolute top-0 h-2 bg-primary rounded-full transition-all duration-200"
                            style={{
                                left: '0%',
                                width: `${((currentSize.value - 1) / 2) * 100}%`
                            }}
                        />

                        {/* Ползунок */}
                        <div
                            className={cn(
                                "font-size-slider-thumb",
                                isDragging ? "scale-110 shadow-xl" : "hover:scale-105"
                            )}
                            style={{
                                '--font-size-position': (currentSize.value - 1) / 2
                            } as React.CSSProperties}
                            onMouseDown={(e) => {
                                setIsDragging(true);
                                handleSliderInteraction(e);
                            }}
                            onTouchStart={(e) => {
                                setIsDragging(true);
                                handleSliderInteraction(e);
                            }}
                        />

                        {/* Область взаимодействия */}
                        <div
                            className="absolute inset-0 cursor-pointer"
                            onMouseDown={handleSliderInteraction}
                            onMouseMove={(e) => {
                                if (isDragging) {
                                    handleSliderInteraction(e);
                                }
                            }}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => setIsDragging(false)}
                            onTouchStart={handleSliderInteraction}
                            onTouchMove={handleSliderInteraction}
                            onTouchEnd={() => setIsDragging(false)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

FontSizeSlider.displayName = 'FontSizeSlider';
