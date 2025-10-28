import { cn } from '@/utils/cn';
import React, { useState } from 'react';
import { RainbowSliderTest } from './RainbowSliderTest';

/**
 * Демо страница для тестирования радужного ползунка
 * Показывает различные варианты радужных ползунков
 */
export const RainbowSliderDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'horizontal' | 'vertical' | 'advanced'>('horizontal');

    return (
        <div className="min-h-screen bg-background text-text p-6">
            <div className="max-w-4xl mx-auto">
                {/* Заголовок */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text mb-2">
                        🌈 Радужный ползунок
                    </h1>
                    <p className="text-text-secondary">
                        Тестирование радужного ползунка с черным и белым цветами на краях
                    </p>
                </div>

                {/* Навигация по табам */}
                <div className="flex justify-center mb-8">
                    <div className="bg-surface rounded-lg p-1 border border-border">
                        <button
                            onClick={() => setActiveTab('horizontal')}
                            className={cn(
                                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                                activeTab === 'horizontal'
                                    ? 'bg-primary text-primary-text shadow-sm'
                                    : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                            )}
                        >
                            Горизонтальный
                        </button>
                        <button
                            onClick={() => setActiveTab('vertical')}
                            className={cn(
                                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                                activeTab === 'vertical'
                                    ? 'bg-primary text-primary-text shadow-sm'
                                    : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                            )}
                        >
                            Вертикальный
                        </button>
                        <button
                            onClick={() => setActiveTab('advanced')}
                            className={cn(
                                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                                activeTab === 'advanced'
                                    ? 'bg-primary text-primary-text shadow-sm'
                                    : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                            )}
                        >
                            Продвинутый
                        </button>
                    </div>
                </div>

                {/* Контент табов */}
                <div className="space-y-6">
                    {activeTab === 'horizontal' && (
                        <div className="space-y-6">
                            <RainbowSliderTest />

                            {/* Дополнительные примеры горизонтальных ползунков */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-surface rounded-lg border border-border">
                                    <h3 className="text-lg font-semibold text-text mb-4">
                                        Простой радужный ползунок
                                    </h3>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        defaultValue="50"
                                        className="rainbow-slider w-full h-3 appearance-none rounded-lg outline-none cursor-pointer"
                                        aria-label="Простой радужный ползунок"
                                    />
                                </div>

                                <div className="p-4 bg-surface rounded-lg border border-border">
                                    <h3 className="text-lg font-semibold text-text mb-4">
                                        Радужный ползунок с метками
                                    </h3>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            defaultValue="75"
                                            className="rainbow-slider w-full h-3 appearance-none rounded-lg outline-none cursor-pointer"
                                            aria-label="Радужный ползунок с метками"
                                        />
                                        <div className="flex justify-between text-xs text-text-secondary">
                                            <span>0%</span>
                                            <span>25%</span>
                                            <span>50%</span>
                                            <span>75%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vertical' && (
                        <div className="space-y-6">
                            <div className="p-6 bg-surface rounded-lg border border-border">
                                <h3 className="text-lg font-semibold text-text mb-4">
                                    Вертикальные радужные ползунки
                                </h3>

                                <div className="flex justify-center space-x-8">
                                    <div className="text-center">
                                        <h4 className="text-sm font-medium text-text-secondary mb-2">
                                            Простой вертикальный
                                        </h4>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            defaultValue="30"
                                            className="rainbow-slider-vertical w-3 h-32 appearance-none rounded-lg outline-none cursor-pointer"
                                            aria-label="Простой вертикальный радужный ползунок"
                                        />
                                    </div>

                                    <div className="text-center">
                                        <h4 className="text-sm font-medium text-text-secondary mb-2">
                                            С индикатором
                                        </h4>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                defaultValue="60"
                                                className="rainbow-slider-vertical w-3 h-32 appearance-none rounded-lg outline-none cursor-pointer"
                                                aria-label="Вертикальный радужный ползунок с индикатором"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="space-y-6">
                            <div className="p-6 bg-surface rounded-lg border border-border">
                                <h3 className="text-lg font-semibold text-text mb-4">
                                    Продвинутые варианты
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Радужный ползунок с цветовым индикатором */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-text">
                                            С динамическим цветовым индикатором
                                        </h4>
                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                defaultValue="40"
                                                className="rainbow-slider w-full h-3 appearance-none rounded-lg outline-none cursor-pointer"
                                                aria-label="Радужный ползунок с динамическим цветовым индикатором"
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    const color = `hsl(${(value / 100) * 360}, 100%, 50%)`;
                                                    e.target.style.setProperty('--thumb-color', color);
                                                }}
                                            />
                                            <div className="text-sm text-text-secondary">
                                                Переместите ползунок для изменения цвета индикатора
                                            </div>
                                        </div>
                                    </div>

                                    {/* Радужный ползунок с анимацией */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-text">
                                            С анимацией
                                        </h4>
                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                defaultValue="70"
                                                className="rainbow-slider rainbow-slider-animated w-full h-3 appearance-none rounded-lg outline-none cursor-pointer"
                                                aria-label="Радужный ползунок с анимацией"
                                            />
                                            <div className="text-sm text-text-secondary">
                                                Ползунок с плавной анимацией
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Информация о CSS классах */}
                            <div className="p-6 bg-surface rounded-lg border border-border">
                                <h3 className="text-lg font-semibold text-text mb-4">
                                    Используемые CSS классы
                                </h3>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <div><code className="bg-surface-hover px-2 py-1 rounded">.rainbow-slider</code> - основной горизонтальный радужный ползунок</div>
                                    <div><code className="bg-surface-hover px-2 py-1 rounded">.rainbow-slider-vertical</code> - вертикальный радужный ползунок</div>
                                    <div><code className="bg-surface-hover px-2 py-1 rounded">.rainbow-slider-animated</code> - с дополнительными анимациями</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Информация о реализации */}
                <div className="mt-8 p-6 bg-surface rounded-lg border border-border">
                    <h3 className="text-lg font-semibold text-text mb-4">
                        ℹ️ Информация о реализации
                    </h3>
                    <div className="space-y-2 text-sm text-text-secondary">
                        <div>• Градиент: Черный → Красный → Оранжевый → Желтый → Зеленый → Синий → Белый</div>
                        <div>• Поддержка WebKit (Chrome, Safari, Edge) и Firefox</div>
                        <div>• Адаптивный дизайн для мобильных устройств</div>
                        <div>• Поддержка темной темы</div>
                        <div>• Плавные анимации и hover эффекты</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RainbowSliderDemo;
