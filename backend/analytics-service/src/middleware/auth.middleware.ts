import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

/**
 * Middleware для проверки JWT токена
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
      if (err) {
        logger.warn('Invalid JWT token', {
          error: err.message,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        return res.status(403).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Добавляем данные пользователя в request
      (req as any).user = decoded;
      next();
    });
  } catch (error) {
    logger.trackError(error as Error, {
      endpoint: req.path,
      method: req.method
    });
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Middleware для проверки админ прав
 * Пока что просто проверяем наличие пользователя
 * В будущем можно добавить проверку роли
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // TODO: Добавить проверку роли администратора
    // Пока что разрешаем всем авторизованным пользователям
    // В будущем: if (user.role !== 'admin') { return 403; }

    logger.info('Admin access granted', {
      userId: user.userId || user.id,
      endpoint: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    logger.trackError(error as Error, {
      endpoint: req.path,
      method: req.method
    });
    res.status(500).json({
      success: false,
      error: 'Authorization error'
    });
  }
};

/**
 * Middleware для логирования запросов
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Логируем входящий запрос
  logger.info('Analytics API request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.userId || (req as any).user?.id
  });

  // Перехватываем ответ для логирования
  const originalJson = res.json.bind(res);
  res.json = function(body: any) {
    const duration = Date.now() - startTime;

    logger.info('Analytics API response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: (req as any).user?.userId || (req as any).user?.id
    });

    return originalJson(body);
  };

  next();
};

/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.trackError(error, {
    endpoint: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};
