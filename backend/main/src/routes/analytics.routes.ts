import { apiGatewayLogger } from '@boss-ai/shared';
import axios from 'axios';
import { Router } from 'express';

const router = Router();
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4400';

/**
 * Middleware для проверки админ прав
 * Только администраторы могут получать доступ к аналитике
 */
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.isAdmin) {
    apiGatewayLogger.warn('Analytics access denied: Admin rights required', {
      userId: req.user?.id || req.user?.userId,
      path: req.path
    });

    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

/**
 * Proxy функция для пересылки запросов к Analytics Service
 */
const proxyToAnalyticsService = async (req: any, res: any) => {
  try {
    const method = req.method.toLowerCase();
    const path = req.path.replace('/api/analytics', '');
    const url = `${ANALYTICS_SERVICE_URL}/api/analytics${path}`;

    apiGatewayLogger.debug('Proxying to Analytics Service', {
      method,
      path,
      url,
      userId: req.user?.id || req.user?.userId
    });

    const config: any = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.get('Authorization') || ''
      },
      timeout: 30000, // 30 секунд для аналитики
      params: req.query
    };

    if (['post', 'put', 'patch'].includes(method)) {
      config.data = req.body;
    }

    const response = await axios(config);

    res.status(response.status).json(response.data);
  } catch (error: any) {
    apiGatewayLogger.error('Analytics Service proxy error', {
      error: error.message,
      path: req.path,
      userId: req.user?.id || req.user?.userId,
      status: error.response?.status
    });

    if (error.response) {
      // Ошибка от Analytics Service
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      // Analytics Service недоступен
      res.status(503).json({
        success: false,
        error: 'Analytics Service unavailable',
        message: 'Analytics service is currently unavailable. Please try again later.'
      });
    } else {
      // Другие ошибки
      res.status(500).json({
        success: false,
        error: 'Analytics Service error',
        message: error.message
      });
    }
  }
};

// Публичные эндпоинты (только для трекинга - требуют аутентификации но не админ)
// POST /api/analytics/track - трекинг события
router.post('/track', proxyToAnalyticsService);

// POST /api/analytics/performance - метрика производительности
router.post('/performance', proxyToAnalyticsService);

// POST /api/analytics/service-usage - использование сервиса
router.post('/service-usage', proxyToAnalyticsService);

// POST /api/analytics/session/start - начало сессии
router.post('/session/start', proxyToAnalyticsService);

// POST /api/analytics/session/end - конец сессии
router.post('/session/end', proxyToAnalyticsService);

// Админские эндпоинты (требуют админ прав)
// GET /api/analytics/dashboard - данные для дашборда
router.get('/dashboard', requireAdmin, proxyToAnalyticsService);

// GET /api/analytics/users/:userId - аналитика пользователя
router.get('/users/:userId', requireAdmin, proxyToAnalyticsService);

// GET /api/analytics/services/:serviceName - аналитика сервиса
router.get('/services/:serviceName', requireAdmin, proxyToAnalyticsService);

// GET /api/analytics/metrics - агрегированные метрики
router.get('/metrics', requireAdmin, proxyToAnalyticsService);

// GET /api/analytics/export - экспорт данных
router.get('/export', requireAdmin, proxyToAnalyticsService);

// GET /api/analytics/health - health check (публичный)
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/api/analytics/health`, {
      timeout: 5000
    });

    res.json({
      ...response.data,
      gateway: 'healthy'
    });
  } catch (error: any) {
    res.status(503).json({
      service: 'analytics-service',
      status: 'unhealthy',
      gateway: 'healthy',
      error: error.message
    });
  }
});

export default router;
