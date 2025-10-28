import React, { useState } from 'react';
import './AnimatedStripesDemo.css';
import AnimatedStripesGenerator from './AnimatedStripesGenerator';

/**
 * ДЕМО-СТРАНИЦА ГЕНЕРАТОРА АНИМИРОВАННЫХ ПОЛОСОК
 *
 * Демонстрация революционной системы генерации полосок с:
 * - Отклонениями от прямой траектории
 * - Синхронным движением параллельных полосок
 * - Задержками запуска для каждой полоски
 * - Коннекторами (кружочками) на концах
 * - Динамической генерацией паттернов
 */

const AnimatedStripesDemo: React.FC = () => {
    const [stripeCount, setStripeCount] = useState(8);
    const [containerWidth, setContainerWidth] = useState(1000);
    const [containerHeight, setContainerHeight] = useState(500);
    const [autoGenerate, setAutoGenerate] = useState(true);
    const [generationInterval, setGenerationInterval] = useState(2000);
    const [generatedStripes, setGeneratedStripes] = useState<any[]>([]);

    const handleStripeGenerated = (stripe: any) => {
        setGeneratedStripes(prev => [...prev, stripe]);
        console.log('Сгенерирована новая полоска:', stripe);
    };

    return (
        <div className="animated-stripes-demo">
            <div className="demo-header">
                <h1 className="demo-title">
                    🌈 ГЕНЕРАТОР АНИМИРОВАННЫХ ПОЛОСОК
                </h1>
                <p className="demo-subtitle">
                    Революционная система создания полосок с отклонениями, задержками и коннекторами
                </p>
            </div>

            <div className="demo-controls">
                <div className="control-group">
                    <label htmlFor="stripeCount">Количество полосок:</label>
                    <input
                        id="stripeCount"
                        type="range"
                        min="1"
                        max="20"
                        value={stripeCount}
                        onChange={(e) => setStripeCount(Number(e.target.value))}
                        className="control-slider"
                    />
                    <span className="control-value">{stripeCount}</span>
                </div>

                <div className="control-group">
                    <label htmlFor="containerWidth">Ширина контейнера:</label>
                    <input
                        id="containerWidth"
                        type="range"
                        min="400"
                        max="1200"
                        step="50"
                        value={containerWidth}
                        onChange={(e) => setContainerWidth(Number(e.target.value))}
                        className="control-slider"
                    />
                    <span className="control-value">{containerWidth}px</span>
                </div>

                <div className="control-group">
                    <label htmlFor="containerHeight">Высота контейнера:</label>
                    <input
                        id="containerHeight"
                        type="range"
                        min="200"
                        max="800"
                        step="50"
                        value={containerHeight}
                        onChange={(e) => setContainerHeight(Number(e.target.value))}
                        className="control-slider"
                    />
                    <span className="control-value">{containerHeight}px</span>
                </div>

                <div className="control-group">
                    <label htmlFor="generationInterval">Интервал генерации:</label>
                    <input
                        id="generationInterval"
                        type="range"
                        min="500"
                        max="5000"
                        step="250"
                        value={generationInterval}
                        onChange={(e) => setGenerationInterval(Number(e.target.value))}
                        className="control-slider"
                    />
                    <span className="control-value">{generationInterval}ms</span>
                </div>

                <div className="control-group checkbox-group">
                    <label htmlFor="autoGenerate">
                        <input
                            id="autoGenerate"
                            type="checkbox"
                            checked={autoGenerate}
                            onChange={(e) => setAutoGenerate(e.target.checked)}
                        />
                        Автоматическая генерация
                    </label>
                </div>
            </div>

            <div className="demo-stats">
                <div className="stat-item">
                    <span className="stat-label">Сгенерировано полосок:</span>
                    <span className="stat-value">{generatedStripes.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Активных полосок:</span>
                    <span className="stat-value">{stripeCount}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Режим:</span>
                    <span className="stat-value">
                        {autoGenerate ? 'Автоматический' : 'Ручной'}
                    </span>
                </div>
            </div>

            <div className="demo-generator">
                <AnimatedStripesGenerator
                    count={stripeCount}
                    containerWidth={containerWidth}
                    containerHeight={containerHeight}
                    autoGenerate={autoGenerate}
                    generationInterval={generationInterval}
                    onStripeGenerated={handleStripeGenerated}
                />
            </div>

            <div className="demo-features">
                <h2 className="features-title">✨ Особенности системы</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🌊</div>
                        <h3>Волнистые траектории</h3>
                        <p>Полоски движутся по синусоидальным траекториям с настраиваемой амплитудой и частотой</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">⏱️</div>
                        <h3>Задержки запуска</h3>
                        <p>Каждая полоска начинает движение с уникальной задержкой для создания волнового эффекта</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🔗</div>
                        <h3>Коннекторы</h3>
                        <p>Красивые кружочки на концах полосок с пульсирующим свечением</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎨</div>
                        <h3>Динамические цвета</h3>
                        <p>16-цветная палитра с автоматическим выбором для каждой полоски</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Производительность</h3>
                        <p>Оптимизированные CSS-анимации с использованием CSS-переменных</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎛️</div>
                        <h3>Настройка</h3>
                        <p>Полный контроль над параметрами: размеры, интервалы, режимы генерации</p>
                    </div>
                </div>
            </div>

            <div className="demo-code">
                <h2 className="code-title">💻 Пример использования</h2>
                <pre className="code-block">
                    {`import AnimatedStripesGenerator from './AnimatedStripesGenerator';

<AnimatedStripesGenerator
  count={8}                    // Количество полосок
  containerWidth={1000}        // Ширина контейнера
  containerHeight={500}        // Высота контейнера
  autoGenerate={true}          // Автоматическая генерация
  generationInterval={2000}    // Интервал генерации (мс)
  onStripeGenerated={(stripe) => {
    console.log('Новая полоска:', stripe);
  }}
/>`}
                </pre>
            </div>
        </div>
    );
};

export default AnimatedStripesDemo;
