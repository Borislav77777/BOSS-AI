import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { Logger } from "../utils/logger";

const logger = new Logger();

/**
 * Обновленная авторизация с поддержкой JWT
 * Сохраняет обратную совместимость с demo-token
 */
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    telegramId: number;
    isAuthenticated: boolean;
  };
}

/**
 * Middleware для проверки авторизации
 * Поддерживает JWT токены и demo-token для разработки
 */
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Требуется авторизация",
    });
  }

  const token = authHeader.substring(7);

  // Проверка demo-token (разрешаем для демонстрации)
  if (token === process.env.API_TOKEN || token === "demo-token") {
    req.user = {
      userId: 1,
      telegramId: 123456789, // Demo Telegram ID
      isAuthenticated: true,
    };
    logger.debug("Авторизация через demo-token (development only)");
    next();
    return;
  }

  // Проверка JWT токена
  const decoded = verifyToken(token);
  if (decoded) {
    req.user = {
      userId: decoded.userId,
      telegramId: decoded.telegramId,
      isAuthenticated: true,
    };
    logger.debug(`JWT авторизация для пользователя ${decoded.userId}`);
    next();
  } else {
    logger.warn("Невалидный токен авторизации");
    return res.status(401).json({
      success: false,
      error: "Неверный токен авторизации",
    });
  }
};

/**
 * Middleware для опциональной авторизации
 * Обновлен для поддержки JWT
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    // Проверка demo-token (разрешаем для демонстрации)
    if (token === process.env.API_TOKEN || token === "demo-token") {
      req.user = {
        userId: 1,
        telegramId: 123456789,
        isAuthenticated: true,
      };
    } else {
      // Проверка JWT токена
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          telegramId: decoded.telegramId,
          isAuthenticated: true,
        };
      }
    }
  }

  next();
};

/**
 * Генерация простого токена для демо
 */
export const generateDemoToken = (): string => {
  return "demo-token-" + Date.now();
};
