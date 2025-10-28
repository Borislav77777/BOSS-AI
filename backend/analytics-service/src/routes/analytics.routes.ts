import { Request, Response, Router } from 'express';
import { EventsRepository } from '../database/repositories/events.repo';
import { MetricsRepository } from '../database/repositories/metrics.repo';
import { SessionsRepository } from '../database/repositories/sessions.repo';
import { CollectorService } from '../services/collector.service';
import {
    DashboardData,
    ExportOptions,
    ServiceAnalytics,
    StartSessionRequest,
    TrackEventRequest,
    TrackPerformanceRequest,
    TrackServiceUsageRequest,
    UserAnalytics
} from '../types/analytics.types';
import { logger } from '../utils/logger';

const router = Router();

// Инициализация репозиториев и сервисов
let collectorService: CollectorService;
let eventsRepo: EventsRepository;
let sessionsRepo: SessionsRepository;
let metricsRepo: MetricsRepository;

// Инициализация (будет вызвана при старте сервера)
export function initializeAnalyticsRoutes(
  collector: CollectorService,
  events: EventsRepository,
  sessions: SessionsRepository,
  metrics: MetricsRepository
) {
  collectorService = collector;
  eventsRepo = events;
  sessionsRepo = sessions;
  metricsRepo = metrics;
}

// ========== Трекинг API ==========

/**
 * POST /api/analytics/track
 * Трекинг события пользователя
 */
router.post('/track', async (req: Request, res: Response) => {
  try {
    const data: TrackEventRequest = req.body;

    // Валидация обязательных полей
    if (!data.userId || !data.eventType || !data.eventCategory || !data.eventAction) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, eventType, eventCategory, eventAction'
      });
    }

    const eventId = await collectorService.trackEvent(data);

    res.json({
      success: true,
      data: { eventId }
    });
  } catch (error) {
    logger.trackError(error as Error, { body: req.body });
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

/**
 * POST /api/analytics/performance
 * Трекинг метрики производительности
 */
router.post('/performance', async (req: Request, res: Response) => {
  try {
    const data: TrackPerformanceRequest = req.body;

    // Валидация обязательных полей
    if (!data.metricType || !data.metricName || data.value === undefined || !data.unit) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: metricType, metricName, value, unit'
      });
    }

    const metricId = await collectorService.trackPerformance(data);

    res.json({
      success: true,
      data: { metricId }
    });
  } catch (error) {
    logger.trackError(error as Error, { body: req.body });
    res.status(500).json({
      success: false,
      error: 'Failed to track performance metric'
    });
  }
});

/**
 * POST /api/analytics/service-usage
 * Трекинг использования сервиса
 */
router.post('/service-usage', async (req: Request, res: Response) => {
  try {
    const data: TrackServiceUsageRequest = req.body;

    // Валидация обязательных полей
    if (!data.userId || !data.serviceName || !data.action || data.success === undefined || data.durationMs === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, serviceName, action, success, durationMs'
      });
    }

    const usageId = await collectorService.trackServiceUsage(data);

    res.json({
      success: true,
      data: { usageId }
    });
  } catch (error) {
    logger.trackError(error as Error, { body: req.body });
    res.status(500).json({
      success: false,
      error: 'Failed to track service usage'
    });
  }
});

/**
 * POST /api/analytics/session/start
 * Начало новой сессии
 */
router.post('/session/start', async (req: Request, res: Response) => {
  try {
    const data: StartSessionRequest = req.body;

    // Валидация обязательных полей
    if (!data.sessionId || !data.userId || !data.ipAddress || !data.userAgent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, userId, ipAddress, userAgent'
      });
    }

    await collectorService.startSession(data);

    res.json({
      success: true,
      message: 'Session started successfully'
    });
  } catch (error) {
    logger.trackError(error as Error, { body: req.body });
    res.status(500).json({
      success: false,
      error: 'Failed to start session'
    });
  }
});

/**
 * POST /api/analytics/session/end
 * Завершение сессии
 */
router.post('/session/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sessionId'
      });
    }

    await collectorService.endSession(sessionId);

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    logger.trackError(error as Error, { body: req.body });
    res.status(500).json({
      success: false,
      error: 'Failed to end session'
    });
  }
});

// ========== Данные для дашборда ==========

/**
 * GET /api/analytics/dashboard
 * Получение данных для дашборда
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? parseInt(startDate as string) : Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60); // 7 дней назад
    const end = endDate ? parseInt(endDate as string) : Math.floor(Date.now() / 1000);

    // Получаем статистику сессий
    const sessionStats = sessionsRepo.getSessionStats(start, end);

    // Получаем статистику событий
    const eventStats = eventsRepo.getEventStats(start, end);

    // Получаем статистику использования сервисов
    const serviceStats = metricsRepo.getServiceUsageStats(start, end);

    // Получаем последние события
    const recentEvents = eventsRepo.getByDateRange(start, end, 50, 0);

    // Получаем метрики производительности
    const performanceMetrics = metricsRepo.getPerformanceMetrics(undefined, undefined, undefined, 50, 0);

    const dashboardData: DashboardData = {
      totalUsers: sessionStats.uniqueUsers,
      activeUsers: sessionStats.activeSessions,
      totalSessions: sessionStats.totalSessions,
      totalEvents: eventStats.reduce((sum, stat) => sum + stat.count, 0),
      totalRevenue: serviceStats.reduce((sum, stat) => sum + stat.totalRevenue, 0),
      avgSessionDuration: sessionStats.avgDuration,
      topServices: serviceStats.slice(0, 10).map(stat => ({
        serviceName: stat.serviceName,
        usageCount: stat.totalUsage,
        revenue: stat.totalRevenue
      })),
      recentEvents: recentEvents.slice(0, 20),
      performanceMetrics: performanceMetrics.slice(0, 20)
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.trackError(error as Error, { query: req.query });
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

/**
 * GET /api/analytics/users/:userId
 * Получение аналитики конкретного пользователя
 */
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? parseInt(startDate as string) : Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60); // 30 дней назад
    const end = endDate ? parseInt(endDate as string) : Math.floor(Date.now() / 1000);

    // Получаем статистику пользователя
    const userStats = await collectorService.getUserStats(userId);

    // Получаем сессии пользователя
    const userSessions = sessionsRepo.getByUserId(userId, 100, 0);

    // Получаем события пользователя
    const userEvents = eventsRepo.getByUserId(userId, 100, 0);

    // Получаем использование сервисов
    const serviceUsage = metricsRepo.getServiceUsage(userId, undefined, undefined, 100, 0);

    // Получаем уникальные сервисы
    const servicesUsed = [...new Set(serviceUsage.map(usage => usage.serviceName))];

    const userAnalytics: UserAnalytics = {
      userId,
      totalSessions: userStats.totalSessions,
      totalEvents: userStats.totalEvents,
      totalSpent: serviceUsage.reduce((sum, usage) => sum + usage.costRub, 0),
      avgSessionDuration: userSessions.length > 0
        ? userSessions.reduce((sum, session) => sum + (session.durationSeconds || 0), 0) / userSessions.length
        : 0,
      lastActivity: userStats.lastActivity,
      servicesUsed,
      recentEvents: userEvents.slice(0, 20)
    };

    res.json({
      success: true,
      data: userAnalytics
    });
  } catch (error) {
    logger.trackError(error as Error, { params: req.params, query: req.query });
    res.status(500).json({
      success: false,
      error: 'Failed to get user analytics'
    });
  }
});

/**
 * GET /api/analytics/services/:serviceName
 * Получение аналитики конкретного сервиса
 */
router.get('/services/:serviceName', async (req: Request, res: Response) => {
  try {
    const { serviceName } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? parseInt(startDate as string) : Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const end = endDate ? parseInt(endDate as string) : Math.floor(Date.now() / 1000);

    // Получаем статистику использования сервиса
    const serviceStats = metricsRepo.getServiceUsageStats(start, end);
    const serviceStat = serviceStats.find(stat => stat.serviceName === serviceName);

    if (!serviceStat) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Получаем использование сервиса
    const serviceUsage = metricsRepo.getServiceUsage(undefined, serviceName, undefined, 100, 0);

    // Получаем события сервиса
    const serviceEvents = eventsRepo.getByServiceName(serviceName, 100, 0);

    const serviceAnalytics: ServiceAnalytics = {
      serviceName,
      totalUsers: serviceStat.uniqueUsers,
      totalUsage: serviceStat.totalUsage,
      totalRevenue: serviceStat.totalRevenue,
      avgResponseTime: serviceStat.avgDuration,
      errorRate: 1 - serviceStat.successRate,
      recentUsage: serviceUsage.slice(0, 20)
    };

    res.json({
      success: true,
      data: serviceAnalytics
    });
  } catch (error) {
    logger.trackError(error as Error, { params: req.params, query: req.query });
    res.status(500).json({
      success: false,
      error: 'Failed to get service analytics'
    });
  }
});

/**
 * GET /api/analytics/metrics
 * Получение агрегированных метрик
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, userId, serviceName } = req.query;

    const start = startDate ? parseInt(startDate as string) : Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    const end = endDate ? parseInt(endDate as string) : Math.floor(Date.now() / 1000);

    // Получаем статистику сессий
    const sessionStats = sessionsRepo.getSessionStats(start, end);

    // Получаем статистику событий
    const eventStats = eventsRepo.getEventStats(start, end);

    // Получаем статистику использования сервисов
    const serviceStats = metricsRepo.getServiceUsageStats(start, end);

    // Получаем средние метрики производительности
    const performanceStats = metricsRepo.getAverageMetrics('api_response', start, end);

    res.json({
      success: true,
      data: {
        sessions: sessionStats,
        events: eventStats,
        services: serviceStats,
        performance: performanceStats,
        period: {
          start,
          end,
          duration: end - start
        }
      }
    });
  } catch (error) {
    logger.trackError(error as Error, { query: req.query });
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics'
    });
  }
});

/**
 * GET /api/analytics/export
 * Экспорт данных в CSV или JSON
 */
router.get('/export', async (req: Request, res: Response) => {
  try {
    const { format = 'json', startDate, endDate, userId, serviceName, eventType } = req.query as ExportOptions;

    const start = startDate ? parseInt(startDate) : Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const end = endDate ? parseInt(endDate) : Math.floor(Date.now() / 1000);

    // Получаем данные для экспорта
    const events = eventsRepo.getByDateRange(start, end, 10000, 0);
    const sessions = sessionsRepo.getByDateRange(start, end, 1000, 0);
    const serviceUsage = metricsRepo.getServiceUsage(
      userId,
      serviceName,
      undefined,
      10000,
      0
    );

    const exportData = {
      events,
      sessions,
      serviceUsage,
      metadata: {
        exportedAt: new Date().toISOString(),
        period: { start, end },
        filters: { userId, serviceName, eventType }
      }
    };

    if (format === 'csv') {
      // TODO: Implement CSV export
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
      res.send('CSV export not implemented yet');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.json"');
      res.json(exportData);
    }
  } catch (error) {
    logger.trackError(error as Error, { query: req.query });
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
});

export default router;
