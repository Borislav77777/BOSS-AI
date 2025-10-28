/**
 * Boss AI Platform - Sentry Configuration for Ozon Manager
 * Настройка Sentry для error tracking и performance monitoring
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Инициализация Sentry для Ozon Manager
 */
export function initializeSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || "development";

  if (!dsn) {
    console.warn("⚠️  SENTRY_DSN not configured, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      // Включаем profiling для performance monitoring
      nodeProfilingIntegration(),

      // HTTP integration для автоматического отслеживания HTTP запросов
      Sentry.httpIntegration(),

      // Express integration для отслеживания Express.js
      Sentry.expressIntegration(),

      // OnUncaughtException integration
      Sentry.onUncaughtExceptionIntegration({
        exitEvenIfOtherHandlersAreRegistered: false,
      }),

      // OnUnhandledRejection integration
      Sentry.onUnhandledRejectionIntegration({ mode: "warn" }),
    ],

    // Настройки sampling
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    profilesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Настройки release
    release: process.env.SENTRY_RELEASE || "boss-ai-ozon-manager@1.0.0",

    // Настройки beforeSend для фильтрации чувствительных данных
    beforeSend(event) {
      // Удаляем чувствительные данные из request
      if (event.request?.data) {
        delete event.request.data;
      }

      // Фильтруем пароли и токены из URL
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          url.searchParams.delete("password");
          url.searchParams.delete("token");
          url.searchParams.delete("api_key");
          event.request.url = url.toString();
        } catch (e) {
          // Игнорируем ошибки парсинга URL
        }
      }

      return event;
    },

    // Настройки beforeBreadcrumb для фильтрации чувствительных breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Фильтруем HTTP breadcrumbs с чувствительными данными
      if (breadcrumb.category === "http" && breadcrumb.data?.url) {
        try {
          const url = new URL(breadcrumb.data.url);
          if (
            url.searchParams.has("password") ||
            url.searchParams.has("token") ||
            url.searchParams.has("api_key")
          ) {
            return null;
          }
        } catch (e) {
          // Игнорируем ошибки парсинга URL
        }
      }

      return breadcrumb;
    },

    // Настройки для production
    ...(environment === "production" && {
      attachStacktrace: true,
      maxBreadcrumbs: 50,
      sendDefaultPii: false,
    }),

    // Настройки для development
    ...(environment === "development" && {
      debug: true,
      attachStacktrace: true,
      maxBreadcrumbs: 100,
      sendDefaultPii: false,
    }),
  });

  console.log("✅ Sentry initialized for Ozon Manager");
}

/**
 * Sentry request handler middleware
 * В Sentry v10+ используется автоматическая интеграция через expressIntegration
 * Middleware не нужны, но для обратной совместимости возвращаем пустые функции
 */
export function sentryRequestHandler() {
  return (req: any, res: any, next: any) => next();
}

/**
 * Sentry error handler middleware
 * В Sentry v10+ используется автоматическая интеграция через expressIntegration
 * Middleware не нужны, но для обратной совместимости возвращаем пустые функции
 */
export function sentryErrorHandler() {
  return (err: any, req: any, res: any, next: any) => next(err);
}

/**
 * Sentry tracing handler middleware
 * В Sentry v10+ используется автоматическая интеграция через expressIntegration
 * Middleware не нужны, но для обратной совместимости возвращаем пустые функции
 */
export function sentryTracingHandler() {
  return (req: any, res: any, next: any) => next();
}

export default Sentry;
