/**
 * AgreementDialog - Диалог пользовательского соглашения
 *
 * Показывается после успешной авторизации в Telegram,
 * если пользователь еще не принял условия использования.
 *
 * @module components/Auth/AgreementDialog
 */
import type { AuthUser } from '@/types/auth';
interface AgreementDialogProps {
    /** Данные пользователя */
    user: AuthUser;
    /** Callback при принятии соглашения */
    onAccept: () => void;
    /** Callback при отклонении соглашения */
    onDecline: () => void;
    /** Индикатор загрузки */
    isLoading?: boolean;
}
/**
 * Диалог пользовательского соглашения
 */
export declare function AgreementDialog({ user, onAccept, onDecline, isLoading, }: AgreementDialogProps): any;
export {};
//# sourceMappingURL=AgreementDialog.d.ts.map