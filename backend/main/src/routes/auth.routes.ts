import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { authRateLimiterMiddleware } from "../middleware/rate-limit.middleware";
import { authService } from "../services/auth.service";
import { logger } from "../utils/logger";

const router = Router();

/**
 * POST /api/auth/telegram/login
 * Авторизация через Telegram (локальная валидация + JWT)
 */
router.post(
  "/telegram/login",
  authRateLimiterMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authData = req.body;

      logger.info("Попытка Telegram авторизации (локальная)", {
        userId: authData.id,
        username: authData.username,
      });

      const result = await authService.telegramLogin(authData);
      res
        .status(result.success ? 200 : result.error?.statusCode || 400)
        .json(result);
    } catch (error: any) {
      logger.error("Ошибка проксирования Telegram авторизации", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Внутренняя ошибка сервера",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Получение информации о текущем пользователе (локально по JWT)
 */
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Токен не предоставлен",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const token = authHeader.split(" ")[1];
    const result = await authService.getCurrentUser(token);
    res
      .status(result.success ? 200 : result.error?.statusCode || 401)
      .json(result);
  } catch (error: any) {
    logger.error("Ошибка проксирования /api/auth/me", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Внутренняя ошибка сервера",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * POST /api/auth/refresh
 * Обновление токена
 */
router.post(
  "/refresh",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: {
            message: "Токен не предоставлен",
            statusCode: 401,
            timestamp: new Date().toISOString(),
          },
        });
      }

      const result = await authService.refreshToken(token);
      res.status(result.success ? 200 : 401).json(result);
    } catch (error: any) {
      logger.error("Ошибка обновления токена", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Внутренняя ошибка сервера",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Выход из системы (проксирует в Ozon Manager)
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Токен не предоставлен",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Локальный logout (не проксируем в Ozon Manager)
    const token = authHeader.split(" ")[1];
    const result = await authService.logout(token);

    logger.info("Logout выполнен", { success: result.success });

    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    logger.error("Ошибка проксирования logout", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Внутренняя ошибка сервера",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/auth/validate
 * Валидация токена
 */
router.get(
  "/validate",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      res.status(200).json({
        success: true,
        data: {
          valid: true,
          user: {
            id: user.id,
            telegramId: user.telegramId,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      });
    } catch (error: any) {
      logger.error("Ошибка валидации токена", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Внутренняя ошибка сервера",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
);

/**
 * POST /api/auth/telegram/agree
 * Подтверждение пользовательского соглашения (проксирует в Ozon Manager)
 */
router.post("/telegram/agree", async (req: Request, res: Response) => {
  try {
    // Проксируем запрос в Ozon Manager
    const ozonManagerUrl =
      process.env.OZON_MANAGER_URL || "http://localhost:4200";
    const response = await fetch(`${ozonManagerUrl}/api/auth/telegram/agree`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const result = (await response.json()) as any;

    logger.info("User agreement через Ozon Manager", {
      status: response.status,
      telegram_id: req.body.telegram_id,
    });

    res.status(response.status).json(result);
  } catch (error: any) {
    logger.error("Ошибка проксирования telegram/agree", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Внутренняя ошибка сервера",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
