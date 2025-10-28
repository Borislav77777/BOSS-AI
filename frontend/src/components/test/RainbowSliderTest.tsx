import React, { useEffect, useRef, useState } from 'react';

/**
 * Тестовый компонент радужного ползунка
 * Черный цвет на левом краю, белый на правом, радужный градиент между ними
 */
export const RainbowSliderTest: React.FC = () => {
    const [value, setValue] = useState(50);
    const sliderRef = useRef<HTMLInputElement>(null);

    // Обновляем градиент при изменении значения
    useEffect(() => {
        if (sliderRef.current) {
            const percent = (value / 100) * 100;
            sliderRef.current.style.setProperty('--percent', `${percent}%`);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(Number(e.target.value));
    };

    return (
        <div className="p-6 bg-surface rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text mb-4">
                🌈 Радужный ползунок (Черный → Белый)
            </h3>

            <div className="space-y-6">
                {/* Основной радужный ползунок */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">
                        Радужный градиент: {value}%
                    </label>
                    <div className="relative">
                        <input
                            ref={sliderRef}
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={handleChange}
                            className="rainbow-slider w-full h-3 appearance-none rounded-lg outline-none cursor-pointer"
                            aria-label="Радужный ползунок"
                        />
                    </div>
                </div>

                {/* Дополнительные варианты радужных ползунков */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-text">Другие варианты:</h4>

                    {/* Вертикальный радужный ползунок */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">
                            Вертикальный радужный
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={value}
                                onChange={handleChange}
                                className="rainbow-slider-vertical w-3 h-32 appearance-none rounded-lg outline-none cursor-pointer"
                                aria-label="Вертикальный радужный ползунок"
                            />
                            <div className="text-sm text-text-secondary">
                                {value}%
                            </div>
                        </div>
                    </div>

                    {/* Радужный ползунок с индикатором */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">
                            С индикатором цвета
                        </label>
                        <div className="relative">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={value}
                                onChange={handleChange}
                                className="rainbow-slider w-full h-3 appearance-none rounded-lg outline-none cursor-pointer"
                                aria-label="Радужный ползунок с индикатором"
                            />
                            <div
                                className="absolute top-0 w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none rainbow-slider-indicator"
                            />
                        </div>
                    </div>

                    {/* Радужный ползунок с текстовым индикатором */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">
                            С текстовым индикатором
                        </label>
                        <div className="relative">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={value}
                                onChange={handleChange}
                                className="rainbow-slider w-full h-3 appearance-none rounded-lg outline-none cursor-pointer"
                                aria-label="Радужный ползунок с текстовым индикатором"
                            />
                            <div
                                className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-surface border border-border rounded text-xs font-medium text-text rainbow-slider-text-indicator"
                            >
                                {value}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Информация о текущем значении */}
                <div className="mt-6 p-4 bg-surface-hover rounded-lg">
                    <h4 className="text-sm font-medium text-text mb-2">Информация:</h4>
                    <div className="space-y-1 text-sm text-text-secondary">
                        <div>Значение: {value}%</div>
                        <div>Цвет: hsl({Math.round((value / 100) * 360)}, 100%, 50%)</div>
                        <div>HEX: #{Math.round((value / 100) * 255).toString(16).padStart(2, '0')}{Math.round((value / 100) * 255).toString(16).padStart(2, '0')}{Math.round((value / 100) * 255).toString(16).padStart(2, '0')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RainbowSliderTest;
