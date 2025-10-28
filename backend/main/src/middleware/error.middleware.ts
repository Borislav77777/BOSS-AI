import {
  AppError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  apiGatewayLogger,
} from "@boss-ai/shared";
import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";

/**
 * Интерфейс для ошибок API
 */
export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (
  error: ApiError | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Логируем ошибку через Winston
  apiGatewayLogger.error("API Error", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  } as any);

  // Отправляем в Sentry (только для критических ошибок)
  if (
    error instanceof InternalServerError ||
    (!error.isOperational && (error as any).statusCode >= 500)
  ) {
    Sentry.captureException(error, {
      tags: {
        component: "api-gateway",
        endpoint: req.url,
        method: req.method,
      },
      user: {
        ip: req.ip,
      },
      extra: {
        userAgent: req.get("User-Agent"),
        body: req.body,
        query: req.query,
        params: req.params,
      },
    });
  }

  // Определяем статус код
  const statusCode = error.statusCode || 500;

  // Определяем сообщение об ошибке
  const message = error.isOperational
    ? error.message
    : "Внутренняя ошибка сервера";

  // Отправляем ответ
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
    },
  });
};

/**
 * Middleware для обработки 404 ошибок
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Маршрут не найден: ${req.originalUrl}`);
  next(error);
};

/**
 * Создание операционной ошибки
 */
export const createApiError = (
  message: string,
  statusCode: number = 500
): AppError => {
  switch (statusCode) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 500:
    default:
      return new InternalServerError(message);
  }
};
