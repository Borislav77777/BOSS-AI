import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Устанавливаем тему по умолчанию только если она не установлена
if (!document.documentElement.getAttribute('data-theme')) {
    document.documentElement.setAttribute('data-theme', 'dark');
}

// Создание корневого элемента
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

// Рендеринг приложения
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
