import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * AuthWidget - Виджет авторизации через Telegram
 *
 * Показывается при старте приложения если пользователь не авторизован.
 * Блокирует доступ к интерфейсу до завершения авторизации.
 *
 * @module components/Auth/AuthWidget
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { TelegramAuthButton } from './TelegramAuthButton';
import { AgreementDialog } from './AgreementDialog';
import { authService } from '@/services/AuthService';
/**
 * Виджет авторизации
 */
export function AuthWidget({ onAuthSuccess, onAuthError }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAgreement, setShowAgreement] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const [pendingToken, setPendingToken] = useState(null);
    /**
     * Обработка авторизации через Telegram
     */
    const handleTelegramAuth = async (telegramData) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('[AuthWidget] Получены данные от Telegram:', telegramData);
            // Отправляем данные на backend
            const result = await authService.loginWithTelegram(telegramData);
            console.log('[AuthWidget] Результат авторизации:', {
                userId: result.user.id,
                needsAgreement: result.needsAgreement,
            });
            // Если нужно принять соглашение
            if (result.needsAgreement) {
                setPendingUser(result.user);
                setPendingToken(result.token);
                setShowAgreement(true);
            }
            else {
                // Авторизация завершена
                onAuthSuccess(result.user, result.token);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка авторизации';
            console.error('[AuthWidget] Ошибка авторизации:', err);
            setError(errorMessage);
            if (onAuthError) {
                onAuthError(errorMessage);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    /**
     * Обработка входа в демо-режим
     */
    const handleDemoLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('[AuthWidget] Вход в демо-режим');
            // Создаем демо-пользователя
            const demoUser = {
                id: 'demo',
                telegram_id: 0,
                username: 'demo_user',
                first_name: 'Demo',
                last_name: 'User',
                photo_url: undefined,
                auth_date: Date.now(),
            };
            const demoToken = 'demo-token';
            // Сохраняем в localStorage
            authService.setStoredToken(demoToken);
            authService.setStoredUser(demoUser);
            console.log('[AuthWidget] Демо-авторизация успешна');
            // Авторизация завершена
            onAuthSuccess(demoUser, demoToken);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка входа в демо-режим';
            console.error('[AuthWidget] Ошибка демо-входа:', err);
            setError(errorMessage);
            if (onAuthError) {
                onAuthError(errorMessage);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    /**
     * Обработка принятия соглашения
     */
    const handleAgreementAccept = async () => {
        if (!pendingUser || !pendingToken)
            return;
        setIsLoading(true);
        try {
            await authService.confirmAgreement(pendingUser.telegram_id, true);
            console.log('[AuthWidget] Соглашение принято');
            // Авторизация завершена
            onAuthSuccess(pendingUser, pendingToken);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка подтверждения соглашения';
            console.error('[AuthWidget] Ошибка подтверждения:', err);
            setError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    /**
     * Обработка отклонения соглашения
     */
    const handleAgreementDecline = () => {
        console.log('[AuthWidget] Соглашение отклонено');
        // Очищаем данные и возвращаемся к экрану авторизации
        setPendingUser(null);
        setPendingToken(null);
        setShowAgreement(false);
        authService.clearStorage();
    };
    return (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "auth-widget-backdrop", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 }, children: _jsxs(motion.div, { className: "auth-widget-card", initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                    }, children: [_jsxs("div", { className: "auth-logo", children: [_jsx("span", { children: "B" }), _jsx("span", { children: "o" }), _jsx("span", { children: "s" }), _jsx("span", { children: "s" }), _jsx("span", { children: " " }), _jsx("span", { children: "A" }), _jsx("span", { children: "I" })] }), _jsx("h1", { className: "auth-title", children: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 Boss AI" }), _jsxs("p", { className: "auth-description", children: [_jsx("span", { children: "\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0443\u0439\u0442\u0435\u0441\u044C" }), ' ', _jsx("span", { children: "\u0447\u0435\u0440\u0435\u0437" }), ' ', _jsx("span", { children: "Telegram" }), ' ', _jsx("span", { children: "\u0434\u043B\u044F" }), ' ', _jsx("span", { children: "\u0434\u043E\u0441\u0442\u0443\u043F\u0430" }), ' ', _jsx("span", { children: "\u043A" }), ' ', _jsx("span", { children: "\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435" })] }), !isLoading && (_jsx("div", { className: "auth-telegram-wrapper", children: _jsx(TelegramAuthButton, { botUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'test_bot', onAuth: handleTelegramAuth, onError: (err) => setError(err) }) })), isLoading && (_jsxs(motion.div, { className: "flex items-center justify-center py-4", initial: { opacity: 0 }, animate: { opacity: 1 }, children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-telegram-blue" }), _jsx("span", { className: "ml-3 text-text-secondary", children: "\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F..." })] })), error && (_jsx(motion.div, { className: "mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm", initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, children: error })), _jsxs("div", { className: "demo-section", children: [_jsx("p", { className: "text-text-muted text-xs text-center", children: "\u0438\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 demo-\u0440\u0435\u0436\u0438\u043C \u0434\u043B\u044F \u043E\u0437\u043D\u0430\u043A\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx("button", { onClick: handleDemoLogin, className: "demo-button", disabled: isLoading, children: "\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0434\u0435\u043C\u043E" })] })] }) }), _jsx(AnimatePresence, { children: showAgreement && pendingUser && (_jsx(AgreementDialog, { user: pendingUser, onAccept: handleAgreementAccept, onDecline: handleAgreementDecline, isLoading: isLoading })) })] }));
}
//# sourceMappingURL=AuthWidget.js.map