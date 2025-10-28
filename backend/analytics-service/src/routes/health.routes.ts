import { Request, Response, Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/analytics/health
 * Health check endpoint для Analytics Service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthData = {
      status: 'healthy',
      service: 'analytics-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    logger.info('Health check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: healthData
    });
  } catch (error) {
    logger.trackError(error as Error, { endpoint: '/health' });
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      data: {
        status: 'unhealthy',
        service: 'analytics-service',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/analytics/status
 * Подробный статус сервиса с проверкой зависимостей
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = {
      service: 'analytics-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      dependencies: {
        database: 'connected', // TODO: Add actual DB health check
        logger: 'active'
      },
      metrics: {
        totalRequests: 0, // TODO: Add request counter
        errorRate: 0, // TODO: Add error rate calculation
        avgResponseTime: 0 // TODO: Add response time tracking
      }
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.trackError(error as Error, { endpoint: '/status' });
    res.status(500).json({
      success: false,
      error: 'Status check failed'
    });
  }
});

export default router;
