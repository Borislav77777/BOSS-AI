import React from 'react';

interface SimpleIndicatorProps {
    position: number; // 0-1
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Простой индикатор БЕЗ сложной логики CSS переменных
 * Просто позиционируется по left в процентах
 */
export const SimpleIndicator: React.FC<SimpleIndicatorProps> = ({
    position,
    className = '',
    style = {}
}) => {
    return (
        <div
            className={`simple-indicator ${className}`}
            style={{
                ...style,
                left: `${position * 100}%`,
            }}
        />
    );
};

SimpleIndicator.displayName = 'SimpleIndicator';
