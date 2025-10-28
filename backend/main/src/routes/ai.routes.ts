import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  chargeAfterSuccess,
  requireBalance,
} from "../middleware/billing.middleware";
import { aiServicesService } from "../services/ai-services.service";
import { logger } from "../utils/logger";

const router = Router();

/**
 * POST /api/ai/chatgpt
 * Отправить запрос к ChatGPT
 */
router.post(
  "/chatgpt",
  authenticateToken,
  requireBalance("ai_request", 5.0),
  chargeAfterSuccess,
  async (req: Request, res: Response) => {
    try {
      const { prompt, options } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Поле prompt обязательно",
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        });
      }

      logger.debug("Запрос к ChatGPT", { promptLength: prompt.length });

      const result = await aiServicesService.sendChatGPTRequest(
        prompt,
        options
      );
      res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      logger.error("Ошибка запроса к ChatGPT", error);
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
 * POST /api/ai/claude
 * Отправить запрос к Claude
 */
router.post(
  "/claude",
  authenticateToken,
  requireBalance("ai_request", 5.0),
  chargeAfterSuccess,
  async (req: Request, res: Response) => {
    try {
      const { prompt, options } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Поле prompt обязательно",
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        });
      }

      logger.debug("Запрос к Claude", { promptLength: prompt.length });

      const result = await aiServicesService.sendClaudeRequest(prompt, options);
      res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      logger.error("Ошибка запроса к Claude", error);
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
 * POST /api/ai/gemini
 * Отправить запрос к Gemini
 */
router.post(
  "/gemini",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { prompt, options } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Поле prompt обязательно",
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        });
      }

      logger.debug("Запрос к Gemini", { promptLength: prompt.length });

      const result = await aiServicesService.sendGeminiRequest(prompt, options);
      res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      logger.error("Ошибка запроса к Gemini", error);
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
 * GET /api/ai/models
 * Получить список доступных AI моделей
 */
router.get(
  "/models",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      logger.debug("Получение списка AI моделей");

      const result = await aiServicesService.getAvailableModels();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      logger.error("Ошибка получения списка моделей", error);
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
 * GET /api/ai/history/:userId
 * Получить историю запросов пользователя
 */
router.get(
  "/history/:userId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      logger.debug("Получение истории запросов", { userId });

      const result = await aiServicesService.getRequestHistory(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      logger.error("Ошибка получения истории запросов", error);
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
 * GET /api/ai/status
 * Получить статус AI сервисов
 */
router.get(
  "/status",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const isEnabled = aiServicesService.isServiceEnabled();

      res.status(200).json({
        success: true,
        data: {
          enabled: isEnabled,
          services: ["chatgpt", "claude", "gemini"],
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error("Ошибка получения статуса AI сервисов", error);
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

export default router;
