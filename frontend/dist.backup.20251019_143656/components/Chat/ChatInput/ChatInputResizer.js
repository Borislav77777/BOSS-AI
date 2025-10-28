import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Компонент регулировщика высоты поля ввода чата
 */
import React from 'react';
export const ChatInputResizer = ({ onResize }) => {
    return (_jsx("div", { className: "select-none cursor-row-resize h-1 w-full relative z-50 pointer-events-auto m-0 p-0 chat-resize-handle", onMouseDown: onResize, title: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0432\u044B\u0441\u043E\u0442\u0443 \u043F\u043E\u043B\u044F \u0432\u0432\u043E\u0434\u0430" }));
};
//# sourceMappingURL=ChatInputResizer.js.map