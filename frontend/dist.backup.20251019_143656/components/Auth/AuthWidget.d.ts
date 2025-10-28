/**
 * AuthWidget - Виджет авторизации через Telegram
 *
 * Показывается при старте приложения если пользователь не авторизован.
 * Блокирует доступ к интерфейсу до завершения авторизации.
 *
 * @module components/Auth/AuthWidget
 */
import type { AuthUser } from '@/types/auth';
interface AuthWidgetProps {
    /** Callback при успешной авторизации */
    onAuthSuccess: (user: AuthUser, token: string) => void;
    /** Callback при ошибке */
    onAuthError?: (error: string) => void;
}
/**
 * Виджет авторизации
 */
export declare function AuthWidget({ onAuthSuccess, onAuthError }: AuthWidgetProps): any;
export {};
//# sourceMappingURL=AuthWidget.d.ts.map