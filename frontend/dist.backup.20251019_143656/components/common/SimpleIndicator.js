import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
/**
 * Простой индикатор БЕЗ сложной логики CSS переменных
 * Просто позиционируется по left в процентах
 */
export const SimpleIndicator = ({ position, className = '', style = {} }) => {
    return (_jsx("div", { className: `simple-indicator ${className}`, style: {
            ...style,
            left: `${position * 100}%`,
        } }));
};
SimpleIndicator.displayName = 'SimpleIndicator';
//# sourceMappingURL=SimpleIndicator.js.map