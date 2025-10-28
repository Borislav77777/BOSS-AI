import { Request, Response, Router } from 'express';
import { healthService } from '../services/health.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/health
 * Базовая проверка здоровья API Gateway
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = await healthService.healthCheck();
    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error: any) {
    logger.error('Ошибка проверки здоровья', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка проверки здоровья',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/health/gateway
 * Детальная проверка здоровья API Gateway
 */
router.get('/gateway', async (req: Request, res: Response) => {
  try {
    const gatewayHealth = await healthService.getGatewayHealth();

    const statusCode = gatewayHealth.status === 'healthy' ? 200 :
                      gatewayHealth.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: gatewayHealth
    });
  } catch (error: any) {
    logger.error('Ошибка проверки здоровья Gateway', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка проверки здоровья Gateway',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/health/services
 * Проверка здоровья всех микросервисов
 */
router.get('/services', async (req: Request, res: Response) => {
  try {
    const servicesHealth = await healthService.checkServicesHealth();

    const healthyServices = servicesHealth.filter(s => s.status === 'healthy').length;
    const totalServices = servicesHealth.length;
    const overallStatus = healthyServices === totalServices ? 'healthy' :
                         healthyServices > 0 ? 'degraded' : 'unhealthy';

    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      success: true,
      data: {
        status: overallStatus,
        services: servicesHealth,
        healthy: healthyServices,
        total: totalServices,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Ошибка проверки здоровья сервисов', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка проверки здоровья сервисов',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/health/detailed
 * Детальная информация о здоровье системы
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const detailedHealth = await healthService.getDetailedHealth();

    const statusCode = detailedHealth.gateway.status === 'healthy' ? 200 :
                      detailedHealth.gateway.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: detailedHealth
    });
  } catch (error: any) {
    logger.error('Ошибка получения детальной информации о здоровье', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка получения детальной информации о здоровье',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/health/metrics
 * Получить метрики системы
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await healthService.getSystemMetrics();

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    logger.error('Ошибка получения метрик системы', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка получения метрик системы',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/health/ready
 * Проверка готовности к работе (для Kubernetes readiness probe)
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const gatewayHealth = await healthService.getGatewayHealth();

    if (gatewayHealth.status === 'healthy') {
      res.status(200).json({
        success: true,
        data: {
          status: 'ready',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(503).json({
        success: false,
        data: {
          status: 'not ready',
          reason: gatewayHealth.status,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error: any) {
    logger.error('Ошибка проверки готовности', error);
    res.status(503).json({
      success: false,
      error: {
        message: 'Сервис не готов',
        statusCode: 503,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/health/live
 * Проверка жизнеспособности (для Kubernetes liveness probe)
 */
router.get('/live', async (req: Request, res: Response) => {
  try {
    const health = await healthService.healthCheck();

    res.status(200).json({
      success: true,
      data: {
        status: 'alive',
        uptime: health.uptime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Ошибка проверки жизнеспособности', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Сервис не отвечает',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;
