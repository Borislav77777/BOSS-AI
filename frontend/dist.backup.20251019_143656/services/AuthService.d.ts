/**
 * AuthService - сервис для работы с Telegram авторизацией
 *
 * Обеспечивает:
 * - Авторизацию через Telegram Login Widget
 * - Управление JWT токенами
 * - Получение данных текущего пользователя
 * - Выход из системы
 *
 * @module services/AuthService
 */
import { AuthUser, TelegramAuthData, AuthResponse, AuthServiceConfig } from '@/types/auth';
/**
 * Сервис авторизации через Telegram
 */
declare class AuthService {
    private config;
    constructor();
    /**
     * Авторизация через Telegram Login Widget
     *
     * @param telegramData - Данные от Telegram Widget
     * @returns Promise с данными пользователя, токеном и флагом needsAgreement
     * @throws Error если авторизация не удалась
     */
    loginWithTelegram(telegramData: TelegramAuthData): Promise<AuthResponse['data']>;
    /**
     * Получение данных текущего пользователя
     *
     * @param token - JWT токен (опционально, берется из localStorage если не указан)
     * @returns Promise с данными пользователя
     * @throws Error если пользователь не авторизован или токен недействителен
     */
    getCurrentUser(token?: string): Promise<AuthUser>;
    /**
     * Выход из системы
     *
     * @returns Promise<void>
     */
    logout(): Promise<void>;
    /**
     * Подтверждение пользовательского соглашения
     *
     * @param telegramId - Telegram ID пользователя
     * @param agreed - Согласие с условиями
     * @returns Promise<void>
     * @throws Error если обновление не удалось
     */
    confirmAgreement(telegramId: number, agreed: boolean): Promise<void>;
    /**
     * Получение сохраненного токена из localStorage
     *
     * @returns JWT токен или null
     */
    getStoredToken(): string | null;
    /**
     * Сохранение токена в localStorage
     *
     * @param token - JWT токен
     */
    setStoredToken(token: string): void;
    /**
     * Получение сохраненных данных пользователя из localStorage
     *
     * @returns Данные пользователя или null
     */
    getStoredUser(): AuthUser | null;
    /**
     * Сохранение данных пользователя в localStorage
     *
     * @param user - Данные пользователя
     */
    setStoredUser(user: AuthUser): void;
    /**
     * Проверка авторизации
     *
     * @returns true если пользователь авторизован (есть токен)
     */
    isAuthenticated(): boolean;
    /**
     * Очистка всех данных авторизации из localStorage
     */
    clearStorage(): void;
    /**
     * Получение конфигурации сервиса
     *
     * @returns Конфигурация AuthService
     */
    getConfig(): Readonly<AuthServiceConfig>;
    /**
     * Обновление конфигурации сервиса
     *
     * @param config - Частичная конфигурация для обновления
     */
    updateConfig(config: Partial<AuthServiceConfig>): void;
}
export declare const authService: AuthService;
export { AuthService };
//# sourceMappingURL=AuthService.d.ts.map