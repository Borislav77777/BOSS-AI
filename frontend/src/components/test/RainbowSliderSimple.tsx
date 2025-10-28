import React, { useState } from 'react';

/**
 * Простой тестовый компонент радужного ползунка
 * Минимальная реализация для быстрого тестирования
 */
export const RainbowSliderSimple: React.FC = () => {
    const [value, setValue] = useState(50);

    return (
        <div className="p-4 bg-card rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold text-text mb-4 text-center">
                🌈 Радужный ползунок
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text mb-2">
                        Значение: {value}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="rainbow-slider w-full h-3 appearance-none rounded-lg outline-none cursor-pointer"
                        aria-label="Радужный ползунок"
                    />
                </div>

                <div className="text-center text-sm text-text">
                    Переместите ползунок для изменения значения
                </div>
            </div>
        </div>
    );
};

export default RainbowSliderSimple;
