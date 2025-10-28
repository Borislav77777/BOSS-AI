import { NextFunction, Response } from "express";
import { BillingService } from "../services/billing.service";
import { logger } from "../utils/logger";

const billingService = new BillingService(
  process.env.DB_PATH || "./backend/data/boss_ai.db"
);

/**
 * Middleware для проверки достаточности баланса перед использованием сервиса
 */
export const requireBalance = (serviceName: string, amount: number) => {
  return (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: "Не авторизован",
            statusCode: 401,
            timestamp: new Date().toISOString(),
          },
        });
      }

      const balance = billingService.getBalance(userId);

      if (balance.balance < amount) {
        logger.warn(
          `Недостаточно средств: user=${userId}, balance=${balance.balance}, required=${amount}`
        );

        return res.status(402).json({
          success: false,
          error: {
            message: "Недостаточно средств на балансе",
            statusCode: 402,
            timestamp: new Date().toISOString(),
          },
          data: {
            balance: balance.balance,
            required: amount,
            service: serviceName,
            topup_url: "/billing/topup",
          },
        });
      }

      // Добавляем информацию о сервисе в request для последующего списания
      req.billingInfo = {
        serviceName,
        amount,
        userId,
      };

      next();
    } catch (error: any) {
      logger.error("Ошибка проверки баланса", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Ошибка проверки баланса",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};

/**
 * Middleware для автоматического списания после успешного выполнения сервиса
 */
export const chargeAfterSuccess = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;

  res.send = function (data: any) {
    // Проверяем успешность ответа и наличие информации о биллинге
    if (res.statusCode >= 200 && res.statusCode < 300 && req.billingInfo) {
      try {
        const { serviceName, amount, userId } = req.billingInfo;
        const success = billingService.charge(
          userId,
          amount,
          serviceName,
          `Автоматическое списание за ${serviceName}`
        );

        if (success) {
          logger.info(
            `Автоматическое списание выполнено: user=${userId}, amount=${amount}, service=${serviceName}`
          );
        } else {
          logger.error(
            `Ошибка автоматического списания: user=${userId}, amount=${amount}, service=${serviceName}`
          );
        }
      } catch (error: any) {
        logger.error("Ошибка автоматического списания", error);
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware для проверки баланса без блокировки (опциональная проверка)
 */
export const checkBalance = (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      const balance = billingService.getBalance(userId);
      req.userBalance = balance;
    }

    next();
  } catch (error: any) {
    logger.error("Ошибка проверки баланса", error);
    next(); // Продолжаем выполнение даже при ошибке
  }
};
