import { EventsRepository } from '../database/repositories/events.repo';
import { MetricsRepository } from '../database/repositories/metrics.repo';
import { SessionsRepository } from '../database/repositories/sessions.repo';
import {
    DeviceType,
    PerformanceMetric,
    ServiceUsage,
    StartSessionRequest,
    TrackEventRequest,
    TrackPerformanceRequest,
    TrackServiceUsageRequest,
    UserEvent,
    UserSession
} from '../types/analytics.types';
import { logger } from '../utils/logger';

/**
 * Сервис для сбора и обработки аналитических данных
 * Центральный компонент для трекинга всех действий пользователей
 */
export class CollectorService {
  private eventsRepo: EventsRepository;
  private sessionsRepo: SessionsRepository;
  private metricsRepo: MetricsRepository;

  constructor(
    eventsRepo: EventsRepository,
    sessionsRepo: SessionsRepository,
    metricsRepo: MetricsRepository
  ) {
    this.eventsRepo = eventsRepo;
    this.sessionsRepo = sessionsRepo;
    this.metricsRepo = metricsRepo;
  }

  /**
   * Трекинг события пользователя
   */
  async trackEvent(data: TrackEventRequest): Promise<number> {
    try {
      const event: Omit<UserEvent, 'id' | 'createdAt'> = {
        userId: data.userId,
        eventType: data.eventType,
        eventCategory: data.eventCategory,
        eventAction: data.eventAction,
        eventLabel: data.eventLabel,
        eventValue: data.eventValue,
        serviceName: data.serviceName,
        metadata: data.metadata,
        sessionId: data.sessionId
      };

      const eventId = this.eventsRepo.create(event);

      // Обновляем счетчик событий в сессии
      if (data.sessionId) {
        await this.updateSessionEventCount(data.sessionId);
      }

      logger.trackEvent(data.eventType, data.userId, {
        eventId,
        serviceName: data.serviceName,
        sessionId: data.sessionId
      });

      return eventId;
    } catch (error) {
      logger.trackError(error as Error, { data });
      throw error;
    }
  }

  /**
   * Трекинг метрики производительности
   */
  async trackPerformance(data: TrackPerformanceRequest): Promise<number> {
    try {
      const metric: Omit<PerformanceMetric, 'id' | 'createdAt'> = {
        userId: data.userId,
        metricType: data.metricType,
        metricName: data.metricName,
        value: data.value,
        unit: data.unit,
        pageUrl: data.pageUrl,
        serviceName: data.serviceName
      };

      const metricId = this.metricsRepo.createPerformanceMetric(metric);

      logger.trackPerformance(data.metricName, data.value, data.unit, {
        metricId,
        userId: data.userId,
        serviceName: data.serviceName
      });

      return metricId;
    } catch (error) {
      logger.trackError(error as Error, { data });
      throw error;
    }
  }

  /**
   * Трекинг использования сервиса
   */
  async trackServiceUsage(data: TrackServiceUsageRequest): Promise<number> {
    try {
      const usage: Omit<ServiceUsage, 'id' | 'createdAt'> = {
        userId: data.userId,
        serviceName: data.serviceName,
        action: data.action,
        success: data.success,
        durationMs: data.durationMs,
        costBt: data.costBt || 0,
        costRub: data.costRub || 0,
        requestData: data.requestData,
        responseData: data.responseData,
        errorMessage: data.errorMessage
      };

      const usageId = this.metricsRepo.createServiceUsage(usage);

      // Обновляем список использованных сервисов в сессии
      if (data.userId) {
        await this.updateSessionServicesUsed(data.userId, data.serviceName);
      }

      logger.info('Service usage tracked', {
        usageId,
        userId: data.userId,
        serviceName: data.serviceName,
        action: data.action,
        success: data.success,
        durationMs: data.durationMs
      });

      return usageId;
    } catch (error) {
      logger.trackError(error as Error, { data });
      throw error;
    }
  }

  /**
   * Начало новой сессии пользователя
   */
  async startSession(data: StartSessionRequest): Promise<void> {
    try {
      // Завершаем все активные сессии пользователя
      await this.sessionsRepo.endAllActiveSessions(data.userId);

      // Создаем новую сессию
      const session: Omit<UserSession, 'pageViews' | 'eventsCount' | 'servicesUsed'> = {
        id: data.sessionId,
        userId: data.userId,
        startedAt: Math.floor(Date.now() / 1000),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceType: this.detectDeviceType(data.userAgent),
        browser: this.detectBrowser(data.userAgent),
        os: this.detectOS(data.userAgent)
      };

      this.sessionsRepo.create(session);

      logger.info('Session started', {
        sessionId: data.sessionId,
        userId: data.userId,
        deviceType: session.deviceType,
        browser: session.browser,
        os: session.os
      });
    } catch (error) {
      logger.trackError(error as Error, { data });
      throw error;
    }
  }

  /**
   * Завершение сессии пользователя
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = this.sessionsRepo.getById(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const endTime = Math.floor(Date.now() / 1000);
      const duration = endTime - session.startedAt;

      this.sessionsRepo.update(sessionId, {
        endedAt: endTime,
        durationSeconds: duration
      });

      logger.info('Session ended', {
        sessionId,
        userId: session.userId,
        duration,
        pageViews: session.pageViews,
        eventsCount: session.eventsCount
      });
    } catch (error) {
      logger.trackError(error as Error, { sessionId });
      throw error;
    }
  }

  /**
   * Трекинг навигации (переход между страницами)
   */
  async trackNavigation(
    userId: string,
    fromPage: string,
    toPage: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): Promise<number> {
    return this.trackEvent({
      userId,
      eventType: 'navigation',
      eventCategory: 'ui',
      eventAction: 'page_change',
      eventLabel: `${fromPage} -> ${toPage}`,
      serviceName: 'frontend',
      sessionId,
      metadata: {
        fromPage,
        toPage,
        ...metadata
      }
    });
  }

  /**
   * Трекинг клика по элементу
   */
  async trackClick(
    userId: string,
    elementId: string,
    elementType: string,
    pageUrl: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): Promise<number> {
    return this.trackEvent({
      userId,
      eventType: 'click',
      eventCategory: 'ui',
      eventAction: 'element_click',
      eventLabel: `${elementType}:${elementId}`,
      serviceName: 'frontend',
      sessionId,
      metadata: {
        elementId,
        elementType,
        pageUrl,
        ...metadata
      }
    });
  }

  /**
   * Трекинг API вызова
   */
  async trackApiCall(
    userId: string,
    method: string,
    endpoint: string,
    statusCode: number,
    durationMs: number,
    serviceName: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): Promise<number> {
    return this.trackEvent({
      userId,
      eventType: 'api_call',
      eventCategory: 'api',
      eventAction: `${method} ${endpoint}`,
      eventValue: durationMs,
      serviceName,
      sessionId,
      metadata: {
        method,
        endpoint,
        statusCode,
        durationMs,
        ...metadata
      }
    });
  }

  /**
   * Трекинг ошибки
   */
  async trackError(
    userId: string,
    errorType: string,
    errorMessage: string,
    serviceName: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): Promise<number> {
    return this.trackEvent({
      userId,
      eventType: 'error',
      eventCategory: 'error',
      eventAction: errorType,
      eventLabel: errorMessage,
      serviceName,
      sessionId,
      metadata: {
        errorType,
        errorMessage,
        ...metadata
      }
    });
  }

  /**
   * Обновление счетчика событий в сессии
   */
  private async updateSessionEventCount(sessionId: string): Promise<void> {
    try {
      const session = this.sessionsRepo.getById(sessionId);
      if (session) {
        this.sessionsRepo.update(sessionId, {
          eventsCount: session.eventsCount + 1
        });
      }
    } catch (error) {
      logger.trackError(error as Error, { sessionId });
    }
  }

  /**
   * Обновление списка использованных сервисов в сессии
   */
  private async updateSessionServicesUsed(userId: string, serviceName: string): Promise<void> {
    try {
      const activeSessions = this.sessionsRepo.getActiveByUserId(userId);

      for (const session of activeSessions) {
        if (!session.servicesUsed.includes(serviceName)) {
          const updatedServices = [...session.servicesUsed, serviceName];
          this.sessionsRepo.update(session.id, {
            servicesUsed: updatedServices
          });
        }
      }
    } catch (error) {
      logger.trackError(error as Error, { userId, serviceName });
    }
  }

  /**
   * Определение типа устройства по User-Agent
   */
  private detectDeviceType(userAgent: string): DeviceType {
    const ua = userAgent.toLowerCase();

    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return 'mobile';
    } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Определение браузера по User-Agent
   */
  private detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('chrome') && !ua.includes('edg')) {
      return 'Chrome';
    } else if (ua.includes('firefox')) {
      return 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari';
    } else if (ua.includes('edg')) {
      return 'Edge';
    } else if (ua.includes('opera')) {
      return 'Opera';
    } else {
      return 'Unknown';
    }
  }

  /**
   * Определение операционной системы по User-Agent
   */
  private detectOS(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('windows')) {
      return 'Windows';
    } else if (ua.includes('mac')) {
      return 'macOS';
    } else if (ua.includes('linux')) {
      return 'Linux';
    } else if (ua.includes('android')) {
      return 'Android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      return 'iOS';
    } else {
      return 'Unknown';
    }
  }

  /**
   * Получение активных сессий пользователя
   */
  async getActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessionsRepo.getActiveByUserId(userId);
  }

  /**
   * Получение статистики пользователя
   */
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalEvents: number;
    activeSessions: number;
    lastActivity: number;
  }> {
    try {
      const totalSessions = this.sessionsRepo.countByUserId(userId);
      const totalEvents = this.eventsRepo.countByUserId(userId);
      const activeSessions = this.sessionsRepo.getActiveByUserId(userId).length;

      // Получаем последнее событие пользователя
      const recentEvents = this.eventsRepo.getByUserId(userId, 1, 0);
      const lastActivity = recentEvents.length > 0 ? recentEvents[0].createdAt! : 0;

      return {
        totalSessions,
        totalEvents,
        activeSessions,
        lastActivity
      };
    } catch (error) {
      logger.trackError(error as Error, { userId });
      throw error;
    }
  }
}
