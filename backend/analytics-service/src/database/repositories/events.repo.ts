import Database from 'better-sqlite3';
import { EventCategory, EventType, UserEvent } from '../../types/analytics.types';
import { logger } from '../../utils/logger';

/**
 * Репозиторий для работы с событиями пользователей
 */
export class EventsRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Создание нового события
   */
  create(event: Omit<UserEvent, 'id' | 'createdAt'>): number {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO user_events (
          user_id, event_type, event_category, event_action, event_label,
          event_value, service_name, metadata, session_id, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        event.userId,
        event.eventType,
        event.eventCategory,
        event.eventAction,
        event.eventLabel || null,
        event.eventValue || null,
        event.serviceName || null,
        event.metadata ? JSON.stringify(event.metadata) : null,
        event.sessionId || null,
        event.ipAddress || null,
        event.userAgent || null
      );

      logger.trackEvent(event.eventType, event.userId, {
        eventId: result.lastInsertRowid,
        serviceName: event.serviceName
      });

      return result.lastInsertRowid as number;
    } catch (error) {
      logger.trackError(error as Error, { event });
      throw error;
    }
  }

  /**
   * Получение событий пользователя
   */
  getByUserId(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): UserEvent[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM user_events
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(userId, limit, offset) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        eventType: row.event_type as EventType,
        eventCategory: row.event_category as EventCategory,
        eventAction: row.event_action,
        eventLabel: row.event_label,
        eventValue: row.event_value,
        serviceName: row.service_name,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        sessionId: row.session_id,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.trackError(error as Error, { userId, limit, offset });
      throw error;
    }
  }

  /**
   * Получение событий по типу
   */
  getByEventType(
    eventType: EventType,
    limit: number = 100,
    offset: number = 0
  ): UserEvent[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM user_events
        WHERE event_type = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(eventType, limit, offset) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        eventType: row.event_type as EventType,
        eventCategory: row.event_category as EventCategory,
        eventAction: row.event_action,
        eventLabel: row.event_label,
        eventValue: row.event_value,
        serviceName: row.service_name,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        sessionId: row.session_id,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.trackError(error as Error, { eventType, limit, offset });
      throw error;
    }
  }

  /**
   * Получение событий по сервису
   */
  getByServiceName(
    serviceName: string,
    limit: number = 100,
    offset: number = 0
  ): UserEvent[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM user_events
        WHERE service_name = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(serviceName, limit, offset) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        eventType: row.event_type as EventType,
        eventCategory: row.event_category as EventCategory,
        eventAction: row.event_action,
        eventLabel: row.event_label,
        eventValue: row.event_value,
        serviceName: row.service_name,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        sessionId: row.session_id,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.trackError(error as Error, { serviceName, limit, offset });
      throw error;
    }
  }

  /**
   * Получение событий за период
   */
  getByDateRange(
    startDate: number,
    endDate: number,
    limit: number = 1000,
    offset: number = 0
  ): UserEvent[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM user_events
        WHERE created_at >= ? AND created_at <= ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(startDate, endDate, limit, offset) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        eventType: row.event_type as EventType,
        eventCategory: row.event_category as EventCategory,
        eventAction: row.event_action,
        eventLabel: row.event_label,
        eventValue: row.event_value,
        serviceName: row.service_name,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        sessionId: row.session_id,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.trackError(error as Error, { startDate, endDate, limit, offset });
      throw error;
    }
  }

  /**
   * Подсчет событий пользователя
   */
  countByUserId(userId: string): number {
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM user_events WHERE user_id = ?
      `);

      const result = stmt.get(userId) as { count: number };
      return result.count;
    } catch (error) {
      logger.trackError(error as Error, { userId });
      throw error;
    }
  }

  /**
   * Подсчет событий по типу
   */
  countByEventType(eventType: EventType): number {
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM user_events WHERE event_type = ?
      `);

      const result = stmt.get(eventType) as { count: number };
      return result.count;
    } catch (error) {
      logger.trackError(error as Error, { eventType });
      throw error;
    }
  }

  /**
   * Получение статистики событий
   */
  getEventStats(startDate?: number, endDate?: number): Array<{
    eventType: string;
    count: number;
    uniqueUsers: number;
  }> {
    try {
      let query = `
        SELECT
          event_type,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_events
      `;

      const params: any[] = [];

      if (startDate && endDate) {
        query += ' WHERE created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate);
      }

      query += ' GROUP BY event_type ORDER BY count DESC';

      const stmt = this.db.prepare(query);
      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        eventType: row.event_type,
        count: row.count,
        uniqueUsers: row.unique_users
      }));
    } catch (error) {
      logger.trackError(error as Error, { startDate, endDate });
      throw error;
    }
  }

  /**
   * Удаление старых событий (для очистки)
   */
  deleteOldEvents(olderThanDays: number): number {
    try {
      const cutoffTime = Math.floor(Date.now() / 1000) - (olderThanDays * 24 * 60 * 60);

      const stmt = this.db.prepare(`
        DELETE FROM user_events WHERE created_at < ?
      `);

      const result = stmt.run(cutoffTime);

      logger.info(`Deleted ${result.changes} old events`, {
        olderThanDays,
        cutoffTime
      });

      return result.changes;
    } catch (error) {
      logger.trackError(error as Error, { olderThanDays });
      throw error;
    }
  }
}
