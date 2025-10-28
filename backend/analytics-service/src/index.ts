import Database from 'better-sqlite3';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';

// Загружаем переменные окружения
dotenv.config();

// Импорты
import { checkAnalyticsTables, runAnalyticsMigrations } from './database/migrations';
import { EventsRepository } from './database/repositories/events.repo';
import { MetricsRepository } from './database/repositories/metrics.repo';
import { SessionsRepository } from './database/repositories/sessions.repo';
import {
    authenticateToken,
    errorHandler,
    requestLogger,
    requireAdmin
} from './middleware/auth.middleware';
import analyticsRoutes, { initializeAnalyticsRoutes } from './routes/analytics.routes';
import healthRoutes from './routes/health.routes';
import { CollectorService } from './services/collector.service';
import { logger } from './utils/logger';

class AnalyticsServer {
  private app: express.Application;
  private server: any;
  private io!: SocketIOServer;
  private port: number;
  private db: Database.Database;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '4400', 10);

    // Инициализация базы данных
    this.db = this.initializeDatabase();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  private initializeDatabase(): Database.Database {
    try {
      const dbPath = process.env.DB_PATH || './data/boss_ai.db';
      const db = new Database(dbPath);

      // Проверяем существование таблиц аналитики
      if (!checkAnalyticsTables(dbPath)) {
        logger.info('Running analytics migrations...');
        runAnalyticsMigrations(dbPath);
      } else {
        logger.info('Analytics tables already exist');
      }

      logger.info('Database initialized successfully', { dbPath });
      return db;
    } catch (error) {
      logger.trackError(error as Error, { operation: 'database_initialization' });
      throw error;
    }
  }

  private setupMiddleware(): void {
    // Безопасность
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }));

    // Логирование
    this.app.use(morgan('combined'));
    this.app.use(requestLogger);

    // Парсинг JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Статические файлы (если нужны)
    this.app.use(express.static('public'));
  }

  private setupRoutes(): void {
    // Инициализация репозиториев и сервисов
    const eventsRepo = new EventsRepository(this.db);
    const sessionsRepo = new SessionsRepository(this.db);
    const metricsRepo = new MetricsRepository(this.db);
    const collectorService = new CollectorService(eventsRepo, sessionsRepo, metricsRepo);

    // Инициализация роутов
    initializeAnalyticsRoutes(collectorService, eventsRepo, sessionsRepo, metricsRepo);

    // Health check (без аутентификации)
    this.app.use('/api/analytics/health', healthRoutes);

    // Основные роуты аналитики (требуют аутентификации)
    this.app.use('/api/analytics',
      authenticateToken,
      analyticsRoutes
    );

    // Админ роуты (требуют админ права)
    this.app.use('/api/analytics/admin',
      authenticateToken,
      requireAdmin,
      analyticsRoutes
    );

    // Корневой роут
    this.app.get('/', (req, res) => {
      res.json({
        service: 'Boss AI Analytics Service',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/api/analytics/health',
          track: '/api/analytics/track',
          dashboard: '/api/analytics/dashboard',
          users: '/api/analytics/users/:userId',
          services: '/api/analytics/services/:serviceName',
          metrics: '/api/analytics/metrics',
          export: '/api/analytics/export'
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
      });
    });
  }

  private setupWebSocket(): void {
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    // WebSocket соединения
    this.io.on('connection', (socket) => {
      logger.info('WebSocket client connected', {
        socketId: socket.id,
        ip: socket.handshake.address
      });

      // Подписка на аналитику
      socket.on('subscribe-analytics', (data) => {
        logger.info('Client subscribed to analytics', {
          socketId: socket.id,
          userId: data.userId
        });

        socket.join(`analytics-${data.userId}`);
      });

      // Отписка от аналитики
      socket.on('unsubscribe-analytics', (data) => {
        logger.info('Client unsubscribed from analytics', {
          socketId: socket.id,
          userId: data.userId
        });

        socket.leave(`analytics-${data.userId}`);
      });

      socket.on('disconnect', () => {
        logger.info('WebSocket client disconnected', { socketId: socket.id });
      });
    });
  }

  private setupErrorHandling(): void {
    // Обработчик ошибок
    this.app.use(errorHandler);

    // Обработчик необработанных исключений
    process.on('uncaughtException', (error) => {
      logger.trackError(error, { type: 'uncaughtException' });
      process.exit(1);
    });

    // Обработчик необработанных промисов
    process.on('unhandledRejection', (reason, promise) => {
      logger.trackError(new Error(`Unhandled Rejection: ${reason}`), {
        type: 'unhandledRejection',
        promise: promise.toString()
      });
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  private shutdown(): void {
    logger.info('Shutting down Analytics Service...');

    if (this.io) {
      this.io.close();
    }

    if (this.server) {
      this.server.close(() => {
        logger.info('Server closed');
        this.db.close();
        process.exit(0);
      });
    } else {
      this.db.close();
      process.exit(0);
    }
  }

  public start(): void {
    this.server.listen(this.port, () => {
      logger.info('Analytics Service started', {
        port: this.port,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    });
  }

  // Метод для отправки real-time обновлений
  public broadcastAnalyticsUpdate(userId: string, data: any): void {
    if (this.io) {
      this.io.to(`analytics-${userId}`).emit('analytics-update', {
        type: 'metric',
        data,
        timestamp: Date.now()
      });
    }
  }
}

// Запуск сервера
const server = new AnalyticsServer();
server.start();

export default server;
