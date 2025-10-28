import { accentColorService, AccentColorSet } from '@/services/AccentColorService';
import { cn } from '@/utils';
import React, { useEffect, useState } from 'react';

interface AccentColorDemoProps {
    className?: string;
}

/**
 * Демонстрационный компонент акцентных цветов
 * Показывает как акцентные цвета из полоски применяются к интерфейсу
 */
export const AccentColorDemo: React.FC<AccentColorDemoProps> = ({ className }) => {
    const [currentAccentSet, setCurrentAccentSet] = useState<AccentColorSet>(
        accentColorService.getCurrentAccentSet()
    );

    useEffect(() => {
        // Обновляем состояние при изменении акцентных цветов
        const interval = setInterval(() => {
            setCurrentAccentSet(accentColorService.getCurrentAccentSet());
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleSetAccentSet = (setName: string) => {
        accentColorService.setAccentSet(setName);
        setCurrentAccentSet(accentColorService.getCurrentAccentSet());
    };

    const handleCycleAccents = () => {
        accentColorService.cycleAccentSets();
        setCurrentAccentSet(accentColorService.getCurrentAccentSet());
    };

    const handleRandomAccents = () => {
        accentColorService.setRandomAccentSet();
        setCurrentAccentSet(accentColorService.getCurrentAccentSet());
    };

    const allAccentSets = accentColorService.getAllAccentSets();

    return (
        <div className={cn("p-6 space-y-6", className)}>
            {/* Заголовок */}
            <div className="text-center">
                <h2 className="accent-text text-2xl font-bold mb-2">
                    🌈 Акцентные цвета из полоски
                </h2>
                <p className="text-text-secondary">
                    Динамические цвета интерфейса, синхронизированные с радужной полоской
                </p>
            </div>

            {/* Текущий набор цветов */}
            <div className="accent-card">
                <h3 className="text-lg font-semibold mb-4">Текущие акцентные цвета:</h3>
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg accent-color-primary"
                        />
                        <span className="text-sm font-medium">Основной</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg accent-color-secondary"
                        />
                        <span className="text-sm font-medium">Вторичный</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg accent-color-tertiary"
                        />
                        <span className="text-sm font-medium">Третичный</span>
                    </div>
                </div>
                <p className="text-sm text-text-secondary">
                    Набор: <span className="font-mono">{currentAccentSet.name}</span>
                </p>
            </div>

            {/* Управление */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={handleCycleAccents}
                    className="accent-button accent-glow"
                >
                    🔄 Следующий набор
                </button>

                <button
                    onClick={handleRandomAccents}
                    className="accent-button accent-glow"
                >
                    🎲 Случайный набор
                </button>

                <button
                    onClick={() => accentColorService.startAutoCycle(3000)}
                    className="accent-button accent-glow"
                >
                    ⚡ Быстрая смена
                </button>
            </div>

            {/* Все доступные наборы */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Доступные наборы цветов:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allAccentSets.map((set) => (
                        <button
                            key={set.name}
                            onClick={() => handleSetAccentSet(set.name)}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105",
                                currentAccentSet.name === set.name
                                    ? "accent-border"
                                    : "border-border hover:border-primary"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-6 h-6 rounded-full border border-white"
                                    data-color={set.primary}
                                />
                                <div
                                    className="w-6 h-6 rounded-full border border-white"
                                    data-color={set.secondary}
                                />
                                <div
                                    className="w-6 h-6 rounded-full border border-white"
                                    data-color={set.tertiary}
                                />
                            </div>
                            <p className="text-sm font-medium text-left">
                                {set.name.replace('rainbow-', '').replace(/-/g, ' → ')}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Демонстрация компонентов */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Демонстрация компонентов:</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Кнопки */}
                    <div className="space-y-3">
                        <h4 className="font-medium">Кнопки с акцентными цветами:</h4>
                        <div className="space-y-2">
                            <button className="accent-button w-full">
                                Акцентная кнопка
                            </button>
                            <button className="accent-button accent-glow w-full">
                                Кнопка с эффектом
                            </button>
                        </div>
                    </div>

                    {/* Индикаторы статуса */}
                    <div className="space-y-3">
                        <h4 className="font-medium">Индикаторы статуса:</h4>
                        <div className="space-y-2">
                            <div className="status-indicator status-active">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                Активен
                            </div>
                            <div className="status-indicator status-warning">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                Предупреждение
                            </div>
                            <div className="status-indicator status-error">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                Ошибка
                            </div>
                        </div>
                    </div>
                </div>

                {/* Текст с акцентными цветами */}
                <div className="accent-card">
                    <h4 className="accent-text text-lg font-bold mb-2">
                        Текст с акцентными цветами
                    </h4>
                    <p className="text-text-secondary">
                        Этот текст использует градиент из текущих акцентных цветов полоски.
                        Цвета автоматически меняются синхронно с анимацией полоски сверху экрана.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccentColorDemo;
