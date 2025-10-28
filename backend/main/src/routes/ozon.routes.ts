import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  chargeAfterSuccess,
  requireBalance,
} from "../middleware/billing.middleware";
import { ozonManagerService } from "../services/ozon-manager.service";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/ozon/stores
 * Получить все магазины
 */
router.get(
  "/stores",
  authenticateToken,
  requireBalance("ozon_daily", 50.0),
  chargeAfterSuccess,
  async (req: Request, res: Response) => {
    try {
      logger.debug("Запрос списка магазинов");
      const result = await ozonManagerService.getStores();
      res
        .status(result.success ? 200 : result.error?.statusCode || 500)
        .json(result);
    } catch (error: any) {
      logger.error("Ошибка получения магазинов", error);
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
 * POST /api/ozon/stores
 * Создать новый магазин
 */
router.post(
  "/stores",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const storeData = req.body;
      logger.debug("Создание нового магазина", { storeName: storeData.name });

      const result = await ozonManagerService.createStore(storeData);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      logger.error("Ошибка создания магазина", error);
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
 * PUT /api/ozon/stores/:name
 * Обновить магазин
 */
router.put(
  "/stores/:name",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const storeData = req.body;

      logger.debug("Обновление магазина", { storeName: name });

      const result = await ozonManagerService.updateStore(name, storeData);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      logger.error("Ошибка обновления магазина", error);
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
 * DELETE /api/ozon/stores/:name
 * Удалить магазин
 */
router.delete(
  "/stores/:name",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { name } = req.params;

      logger.debug("Удаление магазина", { storeName: name });

      const result = await ozonManagerService.deleteStore(name);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      logger.error("Ошибка удаления магазина", error);
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
 * POST /api/ozon/stores/:name/test-connection
 * Тест подключения к API магазина
 */
router.post(
  "/stores/:name/test-connection",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { name } = req.params;

      logger.debug("Тестирование подключения", { storeName: name });

      const result = await ozonManagerService.testConnection(name);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      logger.error("Ошибка тестирования подключения", error);
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
 * POST /api/ozon/promotions/remove
 * Удаление товаров из акций
 */
router.post(
  "/promotions/remove",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { storeNames } = req.body;

      if (
        !storeNames ||
        !Array.isArray(storeNames) ||
        storeNames.length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Необходимо указать массив имен магазинов",
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        });
      }

      logger.debug("Удаление товаров из акций", { storeNames });

      const result = await ozonManagerService.removeFromPromotions(storeNames);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      logger.error("Ошибка удаления из акций", error);
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
 * POST /api/ozon/archive/unarchive
 * Разархивация товаров
 */
router.post(
  "/archive/unarchive",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { storeNames } = req.body;

      if (
        !storeNames ||
        !Array.isArray(storeNames) ||
        storeNames.length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Необходимо указать массив имен магазинов",
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        });
      }

      logger.debug("Разархивация товаров", { storeNames });

      const result = await ozonManagerService.unarchiveProducts(storeNames);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      logger.error("Ошибка разархивации товаров", error);
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
 * GET /api/ozon/logs
 * Получить логи
 */
router.get("/logs", authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.debug("Получение логов");

    const result = await ozonManagerService.getLogs();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    logger.error("Ошибка получения логов", error);
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
 * GET /api/ozon/schedule/status
 * Получить статус планировщика
 */
router.get(
  "/schedule/status",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      logger.debug("Получение статуса планировщика");

      const result = await ozonManagerService.getSchedulerStatus();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      logger.error("Ошибка получения статуса планировщика", error);
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
