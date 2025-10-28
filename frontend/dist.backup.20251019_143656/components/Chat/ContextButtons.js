import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const ContextButtons = ({ contextButtons, onRemoveContext, className = '' }) => {
    if (contextButtons.length === 0) {
        return null;
    }
    const getTypeIcon = (type) => {
        switch (type) {
            case 'project':
                return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4", children: _jsx("path", { d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" }) }));
            case 'document':
                return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4", children: [_jsx("path", { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }), _jsx("polyline", { points: "14 2 14 8 20 8" }), _jsx("line", { x1: "16", x2: "8", y1: "13", y2: "13" }), _jsx("line", { x1: "16", x2: "8", y1: "17", y2: "17" }), _jsx("line", { x1: "10", x2: "8", y1: "9", y2: "9" })] }));
            case 'file':
                return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4", children: [_jsx("path", { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }), _jsx("polyline", { points: "14 2 14 8 20 8" })] }));
            case 'image':
                return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4", children: [_jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), _jsx("circle", { cx: "9", cy: "9", r: "2" }), _jsx("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })] }));
            case 'prompt':
                return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4", children: [_jsx("path", { d: "M12 20h9" }), _jsx("path", { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })] }));
            default:
                return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-4 h-4", children: _jsx("circle", { cx: "12", cy: "12", r: "10" }) }));
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'project':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'document':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'file':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'image':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'prompt':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };
    return (_jsx("div", { className: `flex flex-wrap gap-2 mb-3 ${className}`, children: contextButtons.map((button) => (_jsxs("div", { className: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${getTypeColor(button.type)}`, title: `${button.type}: ${button.title}`, children: [getTypeIcon(button.type), _jsx("span", { className: "truncate max-w-[120px]", children: button.title }), button.removable && (_jsx("button", { onClick: () => onRemoveContext(button.id), className: "ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0438\u0437 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "w-3 h-3", children: [_jsx("line", { x1: "18", x2: "6", y1: "6", y2: "18" }), _jsx("line", { x1: "6", x2: "18", y1: "6", y2: "18" })] }) }))] }, button.id))) }));
};
//# sourceMappingURL=ContextButtons.js.map