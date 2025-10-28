import React, { useEffect, useRef, useState } from 'react';
import './AnimatedStripesGenerator.css';

/**
 * ГЕНЕРАТОР АНИМИРОВАННЫХ ПОЛОСОК
 *
 * Революционная система генерации анимированных полосок с:
 * - Отклонениями от прямой траектории
 * - Синхронным движением параллельных полосок
 * - Задержками запуска для каждой полоски
 * - Коннекторами (кружочками) на концах
 * - Динамической генерацией паттернов
 */

interface StripeConfig {
    id: string;
    delay: number;
    duration: number;
    amplitude: number; // Амплитуда отклонения
    frequency: number; // Частота волны
    color: string;
    width: number;
    height: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

interface AnimatedStripesGeneratorProps {
    count?: number;
    containerWidth?: number;
    containerHeight?: number;
    autoGenerate?: boolean;
    generationInterval?: number;
    onStripeGenerated?: (stripe: StripeConfig) => void;
}

const AnimatedStripesGenerator: React.FC<AnimatedStripesGeneratorProps> = ({
    count = 5,
    containerWidth = 800,
    containerHeight = 400,
    autoGenerate = true,
    generationInterval = 3000,
    onStripeGenerated
}) => {
    const [stripes, setStripes] = useState<StripeConfig[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const generationTimeoutRef = useRef<NodeJS.Timeout>();

    // Цветовая палитра для полосок
    const colorPalette = [
        '#ff0000', '#ff8000', '#ffff00', '#00ff00',
        '#000000', '#8000ff', '#ff00ff', '#00ffff',
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
        '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
    ];

    /**
     * Генерация случайной конфигурации полоски
     */
    const generateStripeConfig = (index: number): StripeConfig => {
        const id = `stripe-${Date.now()}-${index}`;
        const delay = Math.random() * 2000; // Задержка 0-2 секунды
        const duration = 3000 + Math.random() * 4000; // Длительность 3-7 секунд
        const amplitude = 20 + Math.random() * 60; // Амплитуда 20-80px
        const frequency = 0.5 + Math.random() * 1.5; // Частота 0.5-2
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const width = 200 + Math.random() * 300; // Ширина 200-500px
        const height = 3 + Math.random() * 7; // Высота 3-10px

        // Случайные начальная и конечная позиции
        const startX = Math.random() * (containerWidth - 100);
        const startY = 50 + Math.random() * (containerHeight - 100);
        const endX = Math.random() * (containerWidth - 100);
        const endY = 50 + Math.random() * (containerHeight - 100);

        return {
            id,
            delay,
            duration,
            amplitude,
            frequency,
            color,
            width,
            height,
            startX,
            startY,
            endX,
            endY
        };
    };

    /**
     * Генерация одной полоски
     */
    const generateStripe = () => {
        if (stripes.length >= count) return;

        const newStripe = generateStripeConfig(stripes.length);
        setStripes(prev => [...prev, newStripe]);

        if (onStripeGenerated) {
            onStripeGenerated(newStripe);
        }
    };

    /**
     * Очистка всех полосок
     */
    const clearStripes = () => {
        setStripes([]);
    };

    /**
     * Автоматическая генерация полосок
     */
    useEffect(() => {
        if (!autoGenerate) return;

        const generateNext = () => {
            if (stripes.length < count) {
                generateStripe();
                generationTimeoutRef.current = setTimeout(generateNext, generationInterval);
            }
        };

        generationTimeoutRef.current = setTimeout(generateNext, generationInterval);

        return () => {
            if (generationTimeoutRef.current) {
                clearTimeout(generationTimeoutRef.current);
            }
        };
    }, [stripes.length, count, autoGenerate, generationInterval]);

    /**
     * Очистка при размонтировании
     */
    useEffect(() => {
        return () => {
            if (generationTimeoutRef.current) {
                clearTimeout(generationTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="animated-stripes-generator">
            <div className="generator-controls">
                <button
                    onClick={generateStripe}
                    disabled={stripes.length >= count}
                    className="generate-btn"
                >
                    Сгенерировать полоску ({stripes.length}/{count})
                </button>
                <button
                    onClick={clearStripes}
                    className="clear-btn"
                >
                    Очистить все
                </button>
                <div className="generator-status">
                    Статус: {isGenerating ? 'Генерация...' : 'Готов'}
                </div>
            </div>

            <div
                ref={containerRef}
                className="stripes-container"
                style={{
                    width: containerWidth,
                    height: containerHeight
                }}
            >
                {stripes.map((stripe) => (
                    <AnimatedStripe
                        key={stripe.id}
                        config={stripe}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Компонент отдельной анимированной полоски
 */
interface AnimatedStripeProps {
    config: StripeConfig;
}

const AnimatedStripe: React.FC<AnimatedStripeProps> = ({ config }) => {
    const stripeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (stripeRef.current) {
            // Устанавливаем CSS переменные для анимации
            stripeRef.current.style.setProperty('--stripe-delay', `${config.delay}ms`);
            stripeRef.current.style.setProperty('--stripe-duration', `${config.duration}ms`);
            stripeRef.current.style.setProperty('--stripe-amplitude', `${config.amplitude}px`);
            stripeRef.current.style.setProperty('--stripe-frequency', config.frequency.toString());
            stripeRef.current.style.setProperty('--stripe-color', config.color);
            stripeRef.current.style.setProperty('--stripe-width', `${config.width}px`);
            stripeRef.current.style.setProperty('--stripe-height', `${config.height}px`);
            stripeRef.current.style.setProperty('--stripe-start-x', `${config.startX}px`);
            stripeRef.current.style.setProperty('--stripe-start-y', `${config.startY}px`);
            stripeRef.current.style.setProperty('--stripe-end-x', `${config.endX}px`);
            stripeRef.current.style.setProperty('--stripe-end-y', `${config.endY}px`);
        }
    }, [config]);

    return (
        <div
            ref={stripeRef}
            className="animated-stripe"
            style={{
                left: config.startX,
                top: config.startY,
                width: config.width,
                height: config.height,
                backgroundColor: config.color
            }}
        >
            {/* Коннекторы (кружочки) на концах */}
            <div className="stripe-connector start-connector"></div>
            <div className="stripe-connector end-connector"></div>
        </div>
    );
};

export default AnimatedStripesGenerator;
