import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
/**
 * Двумерный индикатор для цветовых пикеров
 * Заменяет inline стили на CSS переменные для устранения линтер-ошибок
 */
export const ColorIndicator2D = ({ x, y, className = '', style = {} }) => {
    return (_jsx("div", { className: `color-indicator-2d ${className}`, style: {
            ...style,
            '--indicator-x': x,
            '--indicator-y': y,
        } }));
};
//# sourceMappingURL=ColorIndicator2D.js.map