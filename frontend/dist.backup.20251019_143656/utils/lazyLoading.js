import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense } from 'react';
// Компонент загрузки
export const LoadingSpinner = () => (_jsxs("div", { className: "loading-spinner", children: [_jsxs("div", { className: "loading-spinner__container", children: [_jsx("div", { className: "loading-spinner__dot" }), _jsx("div", { className: "loading-spinner__dot" }), _jsx("div", { className: "loading-spinner__dot" })] }), _jsx("p", { className: "loading-spinner__text", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." })] }));
// HOC для lazy loading с fallback
export function withLazyLoading(Component, fallback) {
    const LazyComponent = (props) => (_jsx(Suspense, { fallback: fallback || _jsx(LoadingSpinner, {}), children: _jsx(Component, { ...props }) }));
    LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
    return LazyComponent;
}
// Компонент для условной загрузки
export function ConditionalLazyComponent({ condition, children, fallback }) {
    if (!condition) {
        return fallback || null;
    }
    return _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: children });
}
//# sourceMappingURL=lazyLoading.js.map