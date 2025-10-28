import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
// Устанавливаем тему по умолчанию только если она не установлена
if (!document.documentElement.getAttribute('data-theme')) {
    document.documentElement.setAttribute('data-theme', 'dark');
}
// Создание корневого элемента
const root = ReactDOM.createRoot(document.getElementById('root'));
// Рендеринг приложения
root.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
//# sourceMappingURL=index.js.map