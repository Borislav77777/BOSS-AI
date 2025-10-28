import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
/**
 * Контейнер для диаграммы с поддержкой зума и состояний
 */
export const DiagramContainer = forwardRef(({ zoom, isLoading, isRendered }, ref) => {
    return (_jsxs("div", { className: "diagram-container", children: [isLoading && (_jsxs("div", { className: "diagram-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("div", { className: "loading-text", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u044B..." })] })), _jsx("div", { ref: ref, className: "mermaid-container", "data-zoom": zoom }), !isLoading && !isRendered && (_jsxs("div", { className: "diagram-placeholder", children: [_jsx("div", { className: "placeholder-icon", children: "\uD83D\uDCCA" }), _jsx("div", { className: "placeholder-text", children: "\u0414\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u0430 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u0430" })] }))] }));
});
DiagramContainer.displayName = 'DiagramContainer';
//# sourceMappingURL=DiagramContainer.js.map