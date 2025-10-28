import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Расширенный интерфейс Request с пользователем
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Интерфейс для JWT payload
 */
interface JwtPayload {
  userId: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  iat: number;
  exp: number;
}

/**
 * Middleware для проверки JWT токена
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        message: "Токен доступа не предоставлен",
        statusCode: 401,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Проверка demo-token для демонстрации
  if (token === "demo-token") {
    req.user = {
      id: "demo",
      telegramId: 123456789,
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
    };
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET не настроен");
    res.status(500).json({
      success: false,
      error: {
        message: "Ошибка конфигурации сервера",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Добавляем информацию о пользователе в request
    req.user = {
      id: decoded.userId,
      telegramId: decoded.telegramId,
      username: decoded.username,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          message: "Токен истек",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          message: "Недействительный токен",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: {
          message: "Ошибка проверки токена",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
};

/**
 * Middleware для опциональной аутентификации
 * Не блокирует запрос, если токен отсутствует
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Токен отсутствует, продолжаем без пользователя
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.userId,
      telegramId: decoded.telegramId,
      username: decoded.username,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };
  } catch (error) {
    // Игнорируем ошибки токена для опциональной аутентификации
  }

  next();
};

/**
 * Middleware для проверки роли пользователя
 */
export const requireRole = (requiredRole: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: "Требуется аутентификация",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Здесь можно добавить проверку ролей, если они будут реализованы
    // Пока что все аутентифицированные пользователи имеют доступ
    next();
  };
};
