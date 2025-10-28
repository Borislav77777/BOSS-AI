import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ProfilePanel - Панель профиля пользователя
 *
 * Открывается при клике на кнопку профиля в sidebar.
 * Показывает информацию о пользователе и кнопку выхода.
 *
 * @module components/Auth/ProfilePanel
 */
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, User as UserIcon, Calendar, LogOut } from 'lucide-react';
import { useState } from 'react';
/**
 * Панель профиля пользователя
 */
export function ProfilePanel({ user, onClose, onLogout }) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    /**
     * Обработка выхода из системы
     */
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await onLogout();
        }
        catch (error) {
            console.error('[ProfilePanel] Ошибка при выходе:', error);
            setIsLoggingOut(false);
        }
    };
    /**
     * Форматирование даты
     */
    const formatDate = (timestamp) => {
        if (!timestamp)
            return 'Неизвестно';
        const date = new Date(timestamp * 1000); // Конвертируем Unix timestamp
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };
    /**
     * Получение инициалов для аватара по умолчанию
     */
    const getInitials = () => {
        const firstName = user.first_name?.charAt(0) || '';
        const lastName = user.last_name?.charAt(0) || '';
        return (firstName + lastName).toUpperCase() || '?';
    };
    // Рендерим панель через Portal напрямую в document.body
    // Это гарантирует что панель будет поверх всех элементов страницы
    return createPortal(_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "profile-backdrop", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, onClick: onClose }), _jsxs(motion.div, { className: "profile-panel", initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border pb-4", children: [_jsx("h2", { className: "text-xl font-semibold text-text", children: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-surface-hover rounded-lg transition-colors", "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", children: _jsx(X, { className: "w-5 h-5 text-text-secondary" }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto", children: [_jsxs("div", { className: "flex flex-col items-center mb-8", children: [user.photo_url ? (_jsx("img", { src: user.photo_url, alt: user.first_name, className: "profile-avatar mb-4" })) : (_jsx("div", { className: "profile-avatar mb-4 flex items-center justify-center bg-button-primary text-white text-2xl font-bold", children: getInitials() })), _jsxs("h3", { className: "profile-name mb-1", children: [user.first_name, " ", user.last_name || ''] }), user.username && (_jsxs("p", { className: "profile-username", children: ["@", user.username] }))] }), _jsxs("div", { className: "space-y-4 mb-8", children: [_jsxs("div", { className: "p-4 bg-surface rounded-lg border border-border", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(UserIcon, { className: "w-4 h-4 text-text-secondary" }), _jsx("span", { className: "text-sm text-text-secondary", children: "Telegram ID" })] }), _jsx("p", { className: "text-text font-mono text-sm", children: user.telegram_id })] }), user.created_at && (_jsxs("div", { className: "p-4 bg-surface rounded-lg border border-border", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Calendar, { className: "w-4 h-4 text-text-secondary" }), _jsx("span", { className: "text-sm text-text-secondary", children: "\u0414\u0430\u0442\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438" })] }), _jsx("p", { className: "text-text text-sm", children: formatDate(user.created_at) })] })), user.last_login && (_jsxs("div", { className: "p-4 bg-surface rounded-lg border border-border", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Calendar, { className: "w-4 h-4 text-text-secondary" }), _jsx("span", { className: "text-sm text-text-secondary", children: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0432\u0445\u043E\u0434" })] }), _jsx("p", { className: "text-text text-sm", children: formatDate(user.last_login) })] })), _jsxs("div", { className: "p-4 bg-surface rounded-lg border border-border", children: [_jsx("div", { className: "flex items-center gap-2 mb-1", children: _jsx("span", { className: "text-sm text-text-secondary", children: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0435 \u0441\u043E\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435" }) }), _jsx("p", { className: "text-text text-sm", children: user.agreed_to_terms ? (_jsx("span", { className: "text-success", children: "\u2705 \u041F\u0440\u0438\u043D\u044F\u0442\u043E" })) : (_jsx("span", { className: "text-warning", children: "\u26A0\uFE0F \u041D\u0435 \u043F\u0440\u0438\u043D\u044F\u0442\u043E" })) })] })] })] }), _jsx("div", { className: "border-t border-border pt-4", children: _jsx("button", { onClick: handleLogout, disabled: isLoggingOut, className: "profile-logout-button w-full", children: isLoggingOut ? (_jsxs("div", { className: "flex items-center justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" }), "\u0412\u044B\u0445\u043E\u0434..."] })) : (_jsxs("div", { className: "flex items-center justify-center", children: [_jsx(LogOut, { className: "w-5 h-5 mr-2" }), "\u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"] })) }) })] })] }), document.body // Рендерим в body, минуя все контейнеры
    );
}
//# sourceMappingURL=ProfilePanel.js.map