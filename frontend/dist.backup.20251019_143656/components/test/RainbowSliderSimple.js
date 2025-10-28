import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
/**
 * Простой тестовый компонент радужного ползунка
 * Минимальная реализация для быстрого тестирования
 */
export const RainbowSliderSimple = () => {
    const [value, setValue] = useState(50);
    return (_jsxs("div", { className: "p-4 bg-card rounded-lg shadow-lg max-w-md mx-auto", children: [_jsx("h2", { className: "text-xl font-bold text-text mb-4 text-center", children: "\uD83C\uDF08 \u0420\u0430\u0434\u0443\u0436\u043D\u044B\u0439 \u043F\u043E\u043B\u0437\u0443\u043D\u043E\u043A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-text mb-2", children: ["\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435: ", value, "%"] }), _jsx("input", { type: "range", min: "0", max: "100", value: value, onChange: (e) => setValue(Number(e.target.value)), className: "rainbow-slider w-full h-3 appearance-none rounded-lg outline-none cursor-pointer", "aria-label": "\u0420\u0430\u0434\u0443\u0436\u043D\u044B\u0439 \u043F\u043E\u043B\u0437\u0443\u043D\u043E\u043A" })] }), _jsx("div", { className: "text-center text-sm text-text", children: "\u041F\u0435\u0440\u0435\u043C\u0435\u0441\u0442\u0438\u0442\u0435 \u043F\u043E\u043B\u0437\u0443\u043D\u043E\u043A \u0434\u043B\u044F \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F" })] })] }));
};
export default RainbowSliderSimple;
//# sourceMappingURL=RainbowSliderSimple.js.map