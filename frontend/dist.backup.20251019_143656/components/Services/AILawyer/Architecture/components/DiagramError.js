import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
/**
 * Компонент для отображения ошибок диаграммы
 */
export const DiagramError = ({ error, onRetry }) => {
    const getErrorIcon = (type) => {
        switch (type) {
            case 'render': return '🎨';
            case 'load': return '📥';
            case 'validation': return '✅';
            case 'network': return '🌐';
            default: return '⚠️';
        }
    };
    const getErrorTitle = (type) => {
        switch (type) {
            case 'render': return 'Ошибка рендеринга';
            case 'load': return 'Ошибка загрузки';
            case 'validation': return 'Ошибка валидации';
            case 'network': return 'Сетевая ошибка';
            default: return 'Неизвестная ошибка';
        }
    };
    return (_jsxs("div", { className: "diagram-error", children: [_jsxs("div", { className: "error-content", children: [_jsx("div", { className: "error-icon", children: getErrorIcon(error.type) }), _jsxs("div", { className: "error-details", children: [_jsx("h3", { className: "error-title", children: getErrorTitle(error.type) }), _jsx("p", { className: "error-message", children: error.message }), error.details && (_jsxs("details", { className: "error-details-expanded", children: [_jsx("summary", { children: "\u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0434\u0435\u0442\u0430\u043B\u0438" }), _jsx("pre", { className: "error-stack", children: error.details })] })), _jsxs("div", { className: "error-timestamp", children: ["\u0412\u0440\u0435\u043C\u044F: ", new Date(error.timestamp).toLocaleString()] })] })] }), _jsxs("div", { className: "error-actions", children: [_jsx("button", { onClick: onRetry, className: "retry-button", children: "\uD83D\uDD04 \u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430" }), _jsx("button", { onClick: () => window.location.reload(), className: "reload-button", children: "\uD83D\uDD04 \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443" }), _jsx("button", { onClick: () => {
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(`
Ошибка: ${error.message}
Тип: ${error.type}
Время: ${new Date(error.timestamp).toLocaleString()}
Детали: ${error.details || 'Нет'}
              `);
                            }
                        }, className: "copy-button", children: "\uD83D\uDCCB \u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043E\u0442\u0447\u0435\u0442" })] })] }));
};
//# sourceMappingURL=DiagramError.js.map