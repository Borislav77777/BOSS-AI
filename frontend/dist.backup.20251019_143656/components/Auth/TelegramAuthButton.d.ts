/**
 * TelegramAuthButton - Кнопка авторизации через Telegram Login Widget
 *
 * Интегрирует официальный Telegram Login Widget в React компонент.
 * Обрабатывает callback от Telegram и передает данные родительскому компоненту.
 *
 * @module components/Auth/TelegramAuthButton
 */
import type { TelegramAuthData } from '@/types/auth';
interface TelegramAuthButtonProps {
    /** Username бота (без @) */
    botUsername: string;
    /** Размер кнопки */
    size?: 'large' | 'medium' | 'small';
    /** Радиус углов кнопки */
    radius?: number;
    /** Запрашивать ли доступ к отправке сообщений */
    requestAccess?: boolean;
    /** Callback при успешной авторизации */
    onAuth: (user: TelegramAuthData) => void;
    /** Callback при ошибке */
    onError?: (error: string) => void;
}
/**
 * Глобальный callback для Telegram Widget
 * Необходим для работы официального скрипта Telegram
 */
declare global {
    interface Window {
        onTelegramAuth?: (user: TelegramAuthData) => void;
    }
}
/**
 * Кнопка авторизации через Telegram
 */
export declare function TelegramAuthButton({ botUsername, size, radius, requestAccess, onAuth, onError, }: TelegramAuthButtonProps): any;
export {};
//# sourceMappingURL=TelegramAuthButton.d.ts.map