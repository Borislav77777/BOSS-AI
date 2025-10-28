import React from 'react';

interface ColorIndicator2DProps {
    x: number; // 0-1
    y: number; // 0-1
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Двумерный индикатор для цветовых пикеров
 * Заменяет inline стили на CSS переменные для устранения линтер-ошибок
 */
export const ColorIndicator2D: React.FC<ColorIndicator2DProps> = ({
    x,
    y,
    className = '',
    style = {}
}) => {
    return (
        <div
            className={`color-indicator-2d ${className}`}
            style={{
                ...style,
                '--indicator-x': x,
                '--indicator-y': y,
            } as React.CSSProperties}
        />
    );
};
