import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ApiResponse, JwtToken, TelegramAuthData, User } from "../types";
import { logger } from "../utils/logger";

/**
 * Сервис авторизации через Telegram
 */
export class AuthService {
  private logger = logger;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "default-secret-key";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "30d";
  }

  /**
   * Инициализация сервиса
   */
  async initialize(): Promise<void> {
    this.logger.info("Инициализация AuthService...");

    if (!process.env.JWT_SECRET) {
      this.logger.warn(
        "JWT_SECRET не настроен, используется значение по умолчанию"
      );
    }

    this.logger.info("AuthService инициализирован");
  }

  /**
   * Валидация Telegram авторизации
   */
  validateTelegramAuth(authData: TelegramAuthData): boolean {
    try {
      // Проверяем обязательные поля
      if (
        !authData.id ||
        !authData.first_name ||
        !authData.auth_date ||
        !authData.hash
      ) {
        this.logger.warn("Неполные данные Telegram авторизации");
        return false;
      }

      // Проверяем время авторизации (не старше 24 часов)
      const authTime = authData.auth_date * 1000;
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 часа

      if (now - authTime > maxAge) {
        this.logger.warn("Время авторизации Telegram истекло");
        return false;
      }


      // Проверка хеша Telegram Login
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        this.logger.warn("TELEGRAM_BOT_TOKEN не настроен");
        return false;
      }

      // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ДЛЯ ОТЛАДКИ
      this.logger.info("🔍 ОТЛАДКА HMAC ВАЛИДАЦИИ", {
        receivedData: authData,
        botTokenLength: botToken.length,
        botTokenStart: botToken.substring(0, 10) + "...",
      });

      const data = { ...authData } as any;
      const checkHash = data.hash;
      delete data.hash;
      const pairs = Object.keys(data)
        .sort()
        .map((k) => `${k}=${data[k]}`)
        .join("\n");

      this.logger.info("🔍 HMAC ВЫЧИСЛЕНИЕ", {
        dataPairs: pairs,
        receivedHash: checkHash,
      });

      const secret = crypto.createHash("sha256").update(botToken).digest();
      const hmacHex = crypto
        .createHmac("sha256", secret)
        .update(pairs)
        .digest("hex");

      this.logger.info("🔍 HMAC РЕЗУЛЬТАТ", {
        computedHash: hmacHex,
        receivedHash: checkHash,
        hashesMatch: hmacHex === checkHash,
      });

      if (hmacHex !== checkHash) {
        this.logger.warn("❌ Неверный HMAC Telegram Login", {
          computed: hmacHex,
          received: checkHash,
          difference: hmacHex !== checkHash ? "HASHES DO NOT MATCH" : "UNKNOWN",
        });
        return false;
      }

      this.logger.debug("Telegram авторизация валидна", {
        userId: authData.id,
        username: authData.username,
      });

      return true;
    } catch (error) {
      this.logger.error("Ошибка валидации Telegram авторизации", error);
      return false;
    }
  }

  /**
   * Создание пользователя из данных Telegram
   */
  createUserFromTelegram(authData: TelegramAuthData): User {
    const userId = `telegram_${authData.id}`;

    return {
      id: userId,
      telegramId: authData.id,
      username: authData.username,
      firstName: authData.first_name,
      lastName: authData.last_name,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }

  /**
   * Генерация JWT токена
   */
  generateToken(user: User): JwtToken {
    try {
      const payload = {
        userId: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const accessToken = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
      } as jwt.SignOptions);

      // Вычисляем время истечения токена
      const decoded = jwt.decode(accessToken) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      this.logger.debug("JWT токен сгенерирован", {
        userId: user.id,
        expiresIn: expiresIn,
      });

      return {
        accessToken,
        expiresIn,
        tokenType: "Bearer",
      };
    } catch (error) {
      this.logger.error("Ошибка генерации JWT токена", error);
      throw new Error("Ошибка генерации токена");
    }
  }

  /**
   * Верификация JWT токена
   */
  verifyToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      this.logger.debug("JWT токен верифицирован", {
        userId: (decoded as any).userId,
      });
      return decoded;
    } catch (error) {
      this.logger.warn("Ошибка верификации JWT токена", error);
      throw error;
    }
  }

  /**
   * Telegram авторизация
   */
  async telegramLogin(authData: TelegramAuthData): Promise<ApiResponse> {
    try {
      // Валидируем данные авторизации
      if (!this.validateTelegramAuth(authData)) {
        return {
          success: false,
          error: {
            message: "Неверные данные авторизации Telegram",
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Создаем пользователя
      const user = this.createUserFromTelegram(authData);

      // Генерируем токен
      const tokenData = this.generateToken(user);

      this.logger.info("Успешная авторизация через Telegram", {
        userId: user.id,
        username: user.username,
      });

      this.logger.debug("Возвращаем данные авторизации", {
        user,
        tokenLength: tokenData.accessToken.length,
      });

      return {
        success: true,
        data: {
          user,
          token: tokenData.accessToken,
        },
      };
    } catch (error: any) {
      this.logger.error("Ошибка Telegram авторизации", error);
      return {
        success: false,
        error: {
          message: error.message || "Ошибка авторизации",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Получение информации о пользователе по токену
   */
  async getCurrentUser(token: string): Promise<ApiResponse> {
    try {
      const decoded = this.verifyToken(token);

      const user: User = {
        id: decoded.userId,
        telegramId: decoded.telegramId,
        username: decoded.username,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: { user },
      };
    } catch (error: any) {
      this.logger.error("Ошибка получения информации о пользователе", error);
      return {
        success: false,
        error: {
          message: "Недействительный токен",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Обновление токена (refresh)
   */
  async refreshToken(token: string): Promise<ApiResponse> {
    try {
      const decoded = this.verifyToken(token);

      const user: User = {
        id: decoded.userId,
        telegramId: decoded.telegramId,
        username: decoded.username,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const newTokenData = this.generateToken(user);

      return {
        success: true,
        data: { token: newTokenData.accessToken },
      };
    } catch (error: any) {
      this.logger.error("Ошибка обновления токена", error);
      return {
        success: false,
        error: {
          message: "Недействительный токен",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Выход из системы (логирование)
   */
  async logout(userId: string): Promise<ApiResponse> {
    try {
      this.logger.info("Пользователь вышел из системы", { userId });

      return {
        success: true,
        data: { message: "Успешный выход из системы" },
      };
    } catch (error: any) {
      this.logger.error("Ошибка выхода из системы", error);
      return {
        success: false,
        error: {
          message: "Ошибка выхода из системы",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const authService = new AuthService();
