import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { BillingService } from "../services/billing.service";
import { logger } from "../utils/logger";

const router = Router();
const billingService = new BillingService(
  process.env.DB_PATH || "./backend/data/boss_ai.db"
);

/**
 * GET /api/billing/balance
 * Получение текущего баланса пользователя
 */
router.get("/balance", authenticateToken, (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const balance = billingService.getBalance(userId);

    logger.info(`Запрос баланса: user=${userId}, balance=${balance.balance}`);
    res.json({
      success: true,
      data: balance,
    });
  } catch (error: any) {
    logger.error("Ошибка получения баланса", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Ошибка получения баланса",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * POST /api/billing/deposit
 * Пополнение баланса (admin only)
 */
router.post("/deposit", authenticateToken, (req: any, res: Response) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Неверные параметры запроса",
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // TODO: добавить проверку роли admin
    const success = billingService.deposit(
      userId,
      amount,
      req.user.id,
      description || "Пополнение через админку"
    );

    if (success) {
      logger.info(
        `Пополнение выполнено: user=${userId}, amount=${amount}, admin=${req.user.id}`
      );
      res.json({
        success: true,
        message: "Пополнение зафиксировано",
        data: { userId, amount, description },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: "Ошибка пополнения баланса",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    logger.error("Ошибка пополнения баланса", error);
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
 * POST /api/billing/charge
 * Списание с баланса (internal use)
 */
router.post("/charge", authenticateToken, (req: any, res: Response) => {
  try {
    const { amount, serviceName, description } = req.body;

    if (!amount || amount <= 0 || !serviceName) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Неверные параметры запроса",
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const success = billingService.charge(
      req.user.id,
      amount,
      serviceName,
      description || "Списание за сервис"
    );

    if (success) {
      logger.info(
        `Списание выполнено: user=${req.user.id}, amount=${amount}, service=${serviceName}`
      );
      res.json({
        success: true,
        message: "Списание выполнено",
        data: { amount, serviceName, description },
      });
    } else {
      res.status(402).json({
        success: false,
        error: {
          message: "Недостаточно средств",
          statusCode: 402,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    logger.error("Ошибка списания с баланса", error);
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
 * GET /api/billing/transactions
 * История транзакций пользователя
 */
router.get("/transactions", authenticateToken, (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const transactions = billingService.getTransactions(userId, limit);

    logger.info(`Запрос транзакций: user=${userId}, limit=${limit}`);
    res.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    logger.error("Ошибка получения транзакций", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Ошибка получения транзакций",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/billing/services
 * Получение тарифов сервисов
 */
router.get("/services", (req: Request, res: Response) => {
  try {
    const services = billingService.getServicePricing();

    res.json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    logger.error("Ошибка получения тарифов", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Ошибка получения тарифов",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/billing/admin/users
 * Получение всех пользователей с балансами (admin)
 */
router.get("/admin/users", authenticateToken, (req: any, res: Response) => {
  try {
    // TODO: добавить проверку роли admin
    const users = billingService.getAllUsersWithBalance();

    logger.info(`Запрос пользователей с балансами: admin=${req.user.id}`);
    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    logger.error("Ошибка получения пользователей", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Ошибка получения пользователей",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
