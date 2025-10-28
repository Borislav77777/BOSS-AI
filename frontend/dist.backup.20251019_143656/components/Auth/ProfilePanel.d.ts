/**
 * ProfilePanel - Панель профиля пользователя
 *
 * Открывается при клике на кнопку профиля в sidebar.
 * Показывает информацию о пользователе и кнопку выхода.
 *
 * @module components/Auth/ProfilePanel
 */
import type { AuthUser } from '@/types/auth';
interface ProfilePanelProps {
    /** Данные пользователя */
    user: AuthUser;
    /** Callback при закрытии панели */
    onClose: () => void;
    /** Callback при выходе из системы */
    onLogout: () => void;
}
/**
 * Панель профиля пользователя
 */
export declare function ProfilePanel({ user, onClose, onLogout }: ProfilePanelProps): any;
export {};
//# sourceMappingURL=ProfilePanel.d.ts.map