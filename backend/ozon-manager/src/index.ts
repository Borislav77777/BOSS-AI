import cors from "cors";
import express from "express";
import morgan from "morgan";
import {
    getCurrentUser,
    logout,
    telegramAgree,
    telegramLogin,
} from "./controllers/auth-controller";
import {
    generateDemoToken,
    optionalAuth,
    requireAuth,
} from "./middleware/auth";
import { ArchiveManager } from "./services/archive-manager";
import { ConfigService } from "./services/config-service";
import { OzonAPIClient } from "./services/ozon-api-client";
import { PromotionsManager } from "./services/promotions-manager";
import { TaskScheduler } from "./services/task-scheduler";
import { TelegramBotService } from "./services/telegram-bot-service";
import { StoreConfig } from "./types";
import { runMigrations } from "./utils/database-migrations";
import { Logger } from "./utils/logger";
const helmet = require("helmet");
require("dotenv").config();

// Валидация переменных окружения
import {
    validateEnvironment,
    validateOzonSecrets,
} from "./config/env-validator";

// Unified Logger
import { ozonManagerLogger } from "@boss-ai/shared";

// Sentry для error tracking
import {
    initializeSentry,
    sentryErrorHandler,
    sentryRequestHandler,
    sentryTracingHandler,
} from "./config/sentry";

// Инициализируем Sentry
initializeSentry();

// Валидируем переменные окружения при старте
try {
  const config = validateEnvironment();
  validateOzonSecrets();
  ozonManagerLogger.info(
    "Ozon Manager environment variables validated successfully"
  );
} catch (error) {
  ozonManagerLogger.error(
    "Ozon Manager environment validation failed",
    error as Error
  );
  process.exit(1);
}

const app = express();
const logger = new Logger();
const configService = new ConfigService();
const scheduler = new TaskScheduler(logger);

// Запуск миграций БД при старте
let dbPath: string;
try {
  dbPath = process.env.DB_PATH || "./data/ozon_manager.db";
  runMigrations(dbPath);
  logger.logInfo("✅ Миграции базы данных выполнены");
} catch (error: any) {
  logger.logError("❌ Ошибка выполнения миграций:", error);
  process.exit(1);
}

// Инициализация Telegram Bot (если токен указан)
let botService: TelegramBotService | null = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  try {
    botService = new TelegramBotService(process.env.TELEGRAM_BOT_TOKEN, dbPath);
    logger.logInfo("✅ Telegram Bot инициализирован");
  } catch (error: any) {
    logger.logError("❌ Ошибка инициализации Telegram Bot:", error);
    // Не останавливаем сервер, если бот не настроен
  }
} else {
  logger.logInfo("⚠️ TELEGRAM_BOT_TOKEN не указан, бот отключен");
}

// Middleware
// Sentry middleware (должен быть первым)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Запускаем планировщик
scheduler.start();

// API Routes

/**
 * GET /api/auth/token - Получить токен авторизации
 */
app.get("/api/auth/token", (req, res) => {
  try {
    const token = generateDemoToken();
    res.json({
      success: true,
      data: {
        token,
        expires_in: 3600, // 1 час
        user: {
          id: "user-1",
          name: "Demo User",
        },
      },
    });
  } catch (error: any) {
    logger.logError("Ошибка генерации токена", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/stores - Получить все магазины
 */
app.get("/api/stores", requireAuth, (req, res) => {
  try {
    const stores = configService.getAllStores();
    res.json({
      success: true,
      data: stores,
    });
  } catch (error: any) {
    logger.logError("Ошибка получения магазинов", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/stores - Добавить новый магазин
 */
app.post("/api/stores", requireAuth, (req, res) => {
  try {
    const store: StoreConfig = req.body;

    // Валидация
    if (!store.name || !store.client_id || !store.api_key) {
      return res.status(400).json({
        success: false,
        error: "Обязательные поля: name, client_id, api_key",
      });
    }

    const success = configService.addStore(store);
    if (success) {
      // Перезагружаем расписание для нового магазина
      scheduler.reloadStoreSchedule(store);

      res.json({
        success: true,
        message: "Магазин добавлен успешно",
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Магазин с таким именем уже существует",
      });
    }
  } catch (error: any) {
    logger.logError("Ошибка добавления магазина", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/stores/:name - Обновить магазин
 */
app.put("/api/stores/:name", requireAuth, (req, res) => {
  try {
    const storeName = req.params.name;
    const store: StoreConfig = req.body;

    const success = configService.updateStore(storeName, store);
    if (success) {
      // Перезагружаем расписание
      scheduler.reloadStoreSchedule(store);

      res.json({
        success: true,
        message: "Магазин обновлен успешно",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Магазин не найден",
      });
    }
  } catch (error: any) {
    logger.logError("Ошибка обновления магазина", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/stores/:name - Удалить магазин
 */
app.delete("/api/stores/:name", requireAuth, (req, res) => {
  try {
    const storeName = req.params.name;

    const success = configService.removeStore(storeName);
    if (success) {
      res.json({
        success: true,
        message: "Магазин удален успешно",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Магазин не найден",
      });
    }
  } catch (error: any) {
    logger.logError("Ошибка удаления магазина", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/stores/:name/test-connection - Тест подключения к API
 */
app.post("/api/stores/:name/test-connection", requireAuth, async (req, res) => {
  try {
    const storeName = req.params.name;
    const store = configService.getStore(storeName);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Магазин не найден",
      });
    }

    const apiClient = new OzonAPIClient(
      {
        client_id: store.client_id,
        api_key: store.api_key,
        base_url: process.env.OZON_API_BASE_URL || "https://api-seller.ozon.ru",
        timeout: parseInt(process.env.OZON_API_TIMEOUT || "30000"),
        rate_limit: parseInt(process.env.OZON_API_RATE_LIMIT || "50"),
      },
      logger
    );

    const isConnected = await apiClient.testConnection();

    res.json({
      success: isConnected,
      message: isConnected ? "Подключение успешно" : "Ошибка подключения к API",
    });
  } catch (error: any) {
    logger.logError("Ошибка тестирования подключения", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/promotions/remove - Удаление из акций
 */
app.post("/api/promotions/remove", requireAuth, async (req, res) => {
  try {
    const { storeNames } = req.body;

    if (!storeNames || !Array.isArray(storeNames) || storeNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Необходимо указать массив имен магазинов",
      });
    }

    const results = [];

    for (const storeName of storeNames) {
      const store = configService.getStore(storeName);
      if (!store) {
        results.push({
          store: storeName,
          success: false,
          error: "Магазин не найден",
        });
        continue;
      }

      if (!store.remove_from_promotions) {
        results.push({
          store: storeName,
          success: false,
          error: "Удаление из акций отключено для этого магазина",
        });
        continue;
      }

      try {
        const promotionsManager = new PromotionsManager(store, logger);
        const result = await promotionsManager.runPromotionCleanup();

        results.push({
          store: storeName,
          success: result.success,
          products_removed: result.products_removed,
          actions_processed: result.actions_processed,
          errors: result.errors,
        });
      } catch (error: any) {
        results.push({
          store: storeName,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    logger.logError("Ошибка удаления из акций", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/archive/unarchive - Разархивация товаров
 */
app.post("/api/archive/unarchive", requireAuth, async (req, res) => {
  try {
    const { storeNames } = req.body;

    if (!storeNames || !Array.isArray(storeNames) || storeNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Необходимо указать массив имен магазинов",
      });
    }

    const results = [];

    for (const storeName of storeNames) {
      const store = configService.getStore(storeName);
      if (!store) {
        results.push({
          store: storeName,
          success: false,
          error: "Магазин не найден",
        });
        continue;
      }

      if (!store.unarchive_enabled) {
        results.push({
          store: storeName,
          success: false,
          error: "Разархивация отключена для этого магазина",
        });
        continue;
      }

      try {
        const archiveManager = new ArchiveManager(store, logger);
        const result = await archiveManager.runSimpleUnarchiveProcess();

        results.push({
          store: storeName,
          success: result.success,
          total_unarchived: result.total_unarchived,
          cycles_completed: result.cycles_completed,
          stopped_reason: result.stopped_reason,
          message: result.message,
        });
      } catch (error: any) {
        results.push({
          store: storeName,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    logger.logError("Ошибка разархивации", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/schedule/status - Статус планировщика
 */
app.get("/api/schedule/status", optionalAuth, (req, res) => {
  try {
    const status = scheduler.getStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    logger.logError("Ошибка получения статуса планировщика", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/schedule/reload - Перезагрузить расписание
 */
app.post("/api/schedule/reload", requireAuth, (req, res) => {
  try {
    const stores = configService.getAllStores();

    for (const store of stores) {
      scheduler.reloadStoreSchedule(store);
    }

    res.json({
      success: true,
      message: `Расписание перезагружено для ${stores.length} магазинов`,
    });
  } catch (error: any) {
    logger.logError("Ошибка перезагрузки расписания", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/logs - Получить логи
 */
app.get("/api/logs", optionalAuth, (req, res) => {
  try {
    // Простая реализация - возвращаем последние 100 строк лога
    const fs = require("fs");
    const logFile = process.env.LOG_FILE || "./logs/ozon_manager.log";

    if (fs.existsSync(logFile)) {
      const logContent = fs.readFileSync(logFile, "utf8");
      const lines = logContent.split("\n").slice(-100);

      res.json({
        success: true,
        data: lines.filter((line: string) => line.trim()),
      });
    } else {
      res.json({
        success: true,
        data: [],
      });
    }
  } catch (error: any) {
    logger.logError("Ошибка получения логов", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/health - Проверка здоровья сервиса
 */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Ozon Manager API работает",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// === TELEGRAM AUTH ROUTES ===

/**
 * POST /api/auth/telegram/login - Telegram авторизация
 */
app.post("/api/auth/telegram/login", telegramLogin);

/**
 * GET /api/auth/me - Получение текущего пользователя
 */
app.get("/api/auth/me", requireAuth, getCurrentUser);

/**
 * POST /api/auth/logout - Выход из системы
 */
app.post("/api/auth/logout", requireAuth, logout);

/**
 * POST /api/auth/telegram/agree - Подтверждение соглашения
 */
app.post("/api/auth/telegram/agree", telegramAgree);

// === TELEGRAM BOT WEBHOOK ===

/**
 * POST /api/telegram/webhook - Webhook для Telegram Bot
 */
app.post("/api/telegram/webhook", express.json(), async (req, res) => {
  try {
    if (!botService) {
      logger.logError("Telegram Bot не инициализирован");
      return res
        .status(500)
        .json({ success: false, error: "Bot not initialized" });
    }

    await botService.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error: any) {
    logger.logError("Telegram webhook error:", error);
    res
      .status(500)
      .json({ success: false, error: "Webhook processing failed" });
  }
});

// Обработка ошибок
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.logError("Необработанная ошибка", error);
    res.status(500).json({
      success: false,
      error: "Внутренняя ошибка сервера",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint не найден",
  });
});

// Запуск сервера
const PORT = process.env.PORT || 4200;

app.listen(PORT, () => {
  logger.logInfo(`🚀 Ozon Manager API запущен на порту ${PORT}`);
  logger.logInfo(`📊 Режим: ${process.env.NODE_ENV || "development"}`);
  logger.logInfo(
    `🌐 CORS: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`
  );
});

// Error handling
// Sentry error handler (должен быть последним)
app.use(sentryErrorHandler());

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.logInfo("Получен SIGTERM, останавливаем сервер...");
  scheduler.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.logInfo("Получен SIGINT, останавливаем сервер...");
  scheduler.stop();
  process.exit(0);
});
