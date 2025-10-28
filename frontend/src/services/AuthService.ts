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

import {
  AuthErrorResponse,
  AuthResponse,
  AuthServiceConfig,
  AuthUser,
  CurrentUserResponse,
  TelegramAuthData,
} from "@/types/auth";

/**
 * Сервис авторизации через Telegram
 */
class AuthService {
  private config: AuthServiceConfig;

  constructor() {
    // Безопасное получение переменных окружения
    const apiUrl =
      typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
        ? import.meta.env.VITE_API_URL
        : "http://localhost:4200/api";

    this.config = {
      baseUrl: apiUrl,
      tokenKey: "barsukov-token",
      userKey: "barsukov-user",
    };
  }

  /**
   * Авторизация через Telegram Login Widget
   *
   * @param telegramData - Данные от Telegram Widget
   * @returns Promise с данными пользователя, токеном и флагом needsAgreement
   * @throws Error если авторизация не удалась
   */
  async loginWithTelegram(
    telegramData: TelegramAuthData
  ): Promise<AuthResponse["data"]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/auth/telegram/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(telegramData),
        }
      );

      if (!response.ok) {
        const errorData: AuthErrorResponse = await response.json();
        throw new Error(errorData.error || "Ошибка авторизации");
      }

      const data: AuthResponse = await response.json();

      if (!data.success) {
        throw new Error("Ошибка авторизации");
      }

      // Сохраняем токен и данные пользователя
      this.setStoredToken(data.data.token);
      this.setStoredUser(data.data.user);

      return data.data;
    } catch (error) {
      console.error("[AuthService] Ошибка авторизации:", error);
      throw error;
    }
  }

  /**
   * Получение данных текущего пользователя
   *
   * @param token - JWT токен (опционально, берется из localStorage если не указан)
   * @returns Promise с данными пользователя
   * @throws Error если пользователь не авторизован или токен недействителен
   */
  async getCurrentUser(token?: string): Promise<AuthUser> {
    const authToken = token || this.getStoredToken();

    if (!authToken) {
      throw new Error("Не авторизован");
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        // Токен недействителен - очищаем хранилище
        if (response.status === 401) {
          this.clearStorage();
        }
        const errorData: AuthErrorResponse = await response.json();
        throw new Error(
          errorData.error || "Ошибка получения данных пользователя"
        );
      }

      const data: CurrentUserResponse = await response.json();

      if (!data.success) {
        throw new Error("Ошибка получения данных пользователя");
      }

      // Backend возвращает {success: true, data: {user: {...}}}
      // Извлекаем user из data.data.user
      const user = data.data.user || data.data;

      // Обновляем данные пользователя в localStorage
      this.setStoredUser(user);

      return user;
    } catch (error) {
      console.error("[AuthService] Ошибка получения пользователя:", error);
      throw error;
    }
  }

  /**
   * Выход из системы
   *
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    const token = this.getStoredToken();

    if (token) {
      try {
        await fetch(`${this.config.baseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("[AuthService] Ошибка при выходе:", error);
        // Продолжаем выход даже если запрос не удался
      }
    }

    // Очищаем локальное хранилище
    this.clearStorage();
  }

  /**
   * Подтверждение пользовательского соглашения
   *
   * @param telegramId - Telegram ID пользователя
   * @param agreed - Согласие с условиями
   * @returns Promise<void>
   * @throws Error если обновление не удалось
   */
  async confirmAgreement(telegramId: number, agreed: boolean): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/auth/telegram/agree`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            telegram_id: telegramId,
            agreed,
          }),
        }
      );

      if (!response.ok) {
        const errorData: AuthErrorResponse = await response.json();
        throw new Error(errorData.error || "Ошибка обновления соглашения");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Ошибка обновления соглашения");
      }
    } catch (error) {
      console.error("[AuthService] Ошибка обновления соглашения:", error);
      throw error;
    }
  }

  /**
   * Получение сохраненного токена из localStorage
   *
   * @returns JWT токен или null
   */
  getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.config.tokenKey);
    } catch (error) {
      console.error("[AuthService] Ошибка чтения токена:", error);
      return null;
    }
  }

  /**
   * Сохранение токена в localStorage
   *
   * @param token - JWT токен
   */
  setStoredToken(token: string): void {
    try {
      localStorage.setItem(this.config.tokenKey, token);
    } catch (error) {
      console.error("[AuthService] Ошибка сохранения токена:", error);
    }
  }

  /**
   * Получение сохраненных данных пользователя из localStorage
   *
   * @returns Данные пользователя или null
   */
  getStoredUser(): AuthUser | null {
    try {
      const userJson = localStorage.getItem(this.config.userKey);
      if (!userJson) return null;
      return JSON.parse(userJson) as AuthUser;
    } catch (error) {
      console.error("[AuthService] Ошибка чтения данных пользователя:", error);
      return null;
    }
  }

  /**
   * Сохранение данных пользователя в localStorage
   *
   * @param user - Данные пользователя
   */
  setStoredUser(user: AuthUser): void {
    try {
      localStorage.setItem(this.config.userKey, JSON.stringify(user));
    } catch (error) {
      console.error(
        "[AuthService] Ошибка сохранения данных пользователя:",
        error
      );
    }
  }

  /**
   * Проверка авторизации
   *
   * @returns true если пользователь авторизован (есть токен)
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Очистка всех данных авторизации из localStorage
   */
  clearStorage(): void {
    try {
      localStorage.removeItem(this.config.tokenKey);
      localStorage.removeItem(this.config.userKey);
    } catch (error) {
      console.error("[AuthService] Ошибка очистки хранилища:", error);
    }
  }

  /**
   * Получение конфигурации сервиса
   *
   * @returns Конфигурация AuthService
   */
  getConfig(): Readonly<AuthServiceConfig> {
    return { ...this.config };
  }

  /**
   * Обновление конфигурации сервиса
   *
   * @param config - Частичная конфигурация для обновления
   */
  updateConfig(config: Partial<AuthServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Экспортируем singleton экземпляр
export const authService = new AuthService();

// Экспортируем класс для тестирования
export { AuthService };
