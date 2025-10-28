import { jsx as _jsx } from "react/jsx-runtime";
/**
 * TelegramAuthButton - Кнопка авторизации через Telegram Login Widget
 *
 * Интегрирует официальный Telegram Login Widget в React компонент.
 * Обрабатывает callback от Telegram и передает данные родительскому компоненту.
 *
 * @module components/Auth/TelegramAuthButton
 */
import { useEffect, useRef } from 'react';
/**
 * Кнопка авторизации через Telegram
 */
export function TelegramAuthButton({ botUsername, size = 'large', radius, requestAccess = true, onAuth, onError, }) {
    const containerRef = useRef(null);
    const scriptLoadedRef = useRef(false);
    useEffect(() => {
        // Устанавливаем глобальный callback
        window.onTelegramAuth = (user) => {
            console.log('[TelegramAuthButton] Получены данные от Telegram:', user);
            onAuth(user);
        };
        // Загружаем скрипт Telegram Widget (если еще не загружен)
        if (!scriptLoadedRef.current && containerRef.current) {
            const existingScript = document.getElementById('telegram-widget-script');
            if (existingScript) {
                console.log('[TelegramAuthButton] Скрипт Telegram уже загружен');
                scriptLoadedRef.current = true;
                renderWidget();
                return;
            }
            console.log('[TelegramAuthButton] Загрузка скрипта Telegram Widget...');
            const script = document.createElement('script');
            script.id = 'telegram-widget-script';
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.async = true;
            script.setAttribute('data-telegram-login', botUsername);
            script.setAttribute('data-size', size);
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
            script.setAttribute('data-request-access', requestAccess ? 'write' : '');
            if (radius !== undefined) {
                script.setAttribute('data-radius', radius.toString());
            }
            script.onload = () => {
                console.log('[TelegramAuthButton] Скрипт Telegram Widget загружен');
                scriptLoadedRef.current = true;
            };
            script.onerror = () => {
                console.error('[TelegramAuthButton] Ошибка загрузки скрипта Telegram Widget');
                if (onError) {
                    onError('Не удалось загрузить Telegram Widget');
                }
            };
            containerRef.current.appendChild(script);
        }
        // Cleanup
        return () => {
            // Не удаляем глобальный callback, так как он может использоваться другими компонентами
            // window.onTelegramAuth = undefined;
        };
    }, [botUsername, size, radius, requestAccess, onAuth, onError]);
    /**
     * Рендер альтернативной кнопки (если скрипт не загружается)
     */
    const renderWidget = () => {
        // Telegram Widget сам создаст iframe внутри контейнера
    };
    return (_jsx("div", { ref: containerRef, className: "flex justify-center items-center min-h-[50px]", "data-testid": "telegram-auth-button" }));
}
//# sourceMappingURL=TelegramAuthButton.js.map