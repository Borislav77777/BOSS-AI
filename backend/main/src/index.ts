import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import morgan from "morgan";
import { Server as SocketIOServer } from "socket.io";

// Загружаем переменные окружения
dotenv.config();

// Валидация переменных окружения
import { validateEnvironment, validateSecrets } from "./config/env-validator";

// Unified Logger
import { apiGatewayLogger } from "@boss-ai/shared";

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
  validateSecrets();
  apiGatewayLogger.info("Environment variables validated successfully");
} catch (error) {
  apiGatewayLogger.error("Environment validation failed", error as Error);
  process.exit(1);
}

// Импорты сервисов
import { aiServicesService } from "./services/ai-services.service";
import { authService } from "./services/auth.service";
import { healthService } from "./services/health.service";
import { ozonManagerService } from "./services/ozon-manager.service";

// Импорты middleware
import { analyticsTrackingMiddleware } from "./middleware/analytics-tracking.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { rateLimiterMiddleware } from "./middleware/rate-limit.middleware";

// Импорты роутов
import agentsRoutes from "./routes/agents.routes";
import aiRoutes from "./routes/ai.routes";
import analyticsRoutes from "./routes/analytics.routes";
import authRoutes from "./routes/auth.routes";
import billingRoutes from "./routes/billing.routes";
import healthRoutes from "./routes/health.routes";
import katyaChatsRoutes from "./routes/katya-chats.routes";
import ozonRoutes from "./routes/ozon.routes";

class BossAIServer {
  private app: express.Application;
  private server: any;
  private io!: SocketIOServer;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || "3000", 10);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    // Sentry middleware (должен быть первым)
    this.app.use(sentryRequestHandler());
    this.app.use(sentryTracingHandler());

    // Безопасность
    this.app.use(helmet());
    this.app.use(
      helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: [
            "'self'",
            "http://127.0.0.1:7860", // Stable Diffusion API
            "http://localhost:7860", // Stable Diffusion API (альтернатива)
            process.env.CORS_ORIGIN || "https://boss-ai.online",
            (process.env.CORS_ORIGIN || "https://boss-ai.online").replace(
              /^http/,
              "ws"
            ),
          ],
          frameAncestors: [process.env.CORS_ORIGIN || "https://boss-ai.online"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
        },
      })
    );

    // CORS
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "https://boss-ai.online",
        credentials: true,
      })
    );

    // Логирование
    this.app.use(morgan("combined"));

    // Rate limiting
    this.app.use(rateLimiterMiddleware);

    // Парсинг JSON
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // API роуты
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/billing", billingRoutes);
    this.app.use("/api/agents", agentsRoutes);
    // Telegram webhook
    try {
      // Lazy import to avoid circular deps
      const telegramRoutes = require("./routes/telegram.routes").default;
      this.app.use("/api/telegram", telegramRoutes);
    } catch (e) {
      console.warn("⚠️ Telegram routes not loaded:", (e as Error).message);
    }
    this.app.use("/api/ozon", ozonRoutes);
    this.app.use("/api/ai", aiRoutes);
    this.app.use("/api/katya-chats", katyaChatsRoutes);
    this.app.use("/api/analytics", analyticsRoutes);
    this.app.use("/api/health", healthRoutes);

    // Применить analytics tracking middleware ко всем API запросам (после всех роутов)
    this.app.use("/api/*", analyticsTrackingMiddleware);

    // Главная страница
    this.app.get("/", (req, res) => {
      res.json({
        message: "Boss AI Platform API",
        version: "1.0.0",
        status: "running",
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
      });
    });
  }

  private setupErrorHandling(): void {
    // Sentry error handler (должен быть перед другими error handlers)
    this.app.use(sentryErrorHandler());

    // Custom error handler
    this.app.use(errorHandler);
  }

  private setupWebSocket(): void {
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    // WebSocket события
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });

      // Подписка на события Ozon Manager
      socket.on("subscribe-ozon", (data) => {
        socket.join("ozon-manager");
        console.log("Client subscribed to Ozon Manager:", socket.id);
      });

      // Подписка на AI события
      socket.on("subscribe-ai", (data) => {
        socket.join("ai-services");
        console.log("Client subscribed to AI Services:", socket.id);
      });

      // Подписка на Analytics события
      socket.on("subscribe-analytics", (data) => {
        if (data.userId) {
          socket.join(`analytics-${data.userId}`);
          console.log(`Client subscribed to Analytics for user ${data.userId}:`, socket.id);
        }
      });

      // Отписка от Analytics
      socket.on("unsubscribe-analytics", (data) => {
        if (data.userId) {
          socket.leave(`analytics-${data.userId}`);
          console.log(`Client unsubscribed from Analytics for user ${data.userId}:`, socket.id);
        }
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Инициализация сервисов
      await this.initializeServices();

      // Запуск сервера
      this.server.listen(this.port, () => {
        console.log(`🚀 Boss AI Platform API запущен на порту ${this.port}`);
        console.log(
          `📊 Health check: http://localhost:${this.port}/api/health`
        );
        console.log(`🔗 WebSocket: ws://localhost:${this.port}`);
      });
    } catch (error) {
      console.error("❌ Ошибка запуска сервера:", error);
      process.exit(1);
    }
  }

  private async initializeServices(): Promise<void> {
    console.log("🔧 Инициализация сервисов...");

    // Инициализация Ozon Manager
    try {
      await ozonManagerService.initialize();
      console.log("✅ Ozon Manager сервис инициализирован");
    } catch (error) {
      console.warn("⚠️ Ozon Manager недоступен, но сервис продолжит работу");
    }

    // Инициализация AI Services
    try {
      await aiServicesService.initialize();
      console.log("✅ AI Services инициализированы");
    } catch (error) {
      console.warn("⚠️ AI Services недоступны, но сервис продолжит работу");
    }

    // Инициализация Auth Service
    try {
      await authService.initialize();
      console.log("✅ Auth Service инициализирован");
    } catch (error) {
      console.error("❌ Ошибка инициализации Auth Service:", error);
    }

    // Инициализация Health Service
    try {
      await healthService.initialize();
      console.log("✅ Health Service инициализирован");
    } catch (error) {
      console.error("❌ Ошибка инициализации Health Service:", error);
    }

    console.log("🎉 Все сервисы инициализированы успешно!");
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Запуск сервера
const server = new BossAIServer();
server.start();

export default server;
