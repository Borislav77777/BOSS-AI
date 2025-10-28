import Database from 'better-sqlite3';
import { DeviceType, UserSession } from '../../types/analytics.types';
import { logger } from '../../utils/logger';

/**
 * Репозиторий для работы с сессиями пользователей
 */
export class SessionsRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Создание новой сессии
   */
  create(session: Omit<UserSession, 'pageViews' | 'eventsCount' | 'servicesUsed'>): void {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO user_sessions (
          id, user_id, started_at, ended_at, duration_seconds,
          page_views, events_count, services_used, ip_address,
          user_agent, device_type, browser, os
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        session.id,
        session.userId,
        session.startedAt,
        session.endedAt || null,
        session.durationSeconds || null,
        0, // pageViews
        0, // eventsCount
        JSON.stringify([]), // servicesUsed
        session.ipAddress || null,
        session.userAgent || null,
        session.deviceType || null,
        session.browser || null,
        session.os || null
      );

      logger.info('Session created', {
        sessionId: session.id,
        userId: session.userId
      });
    } catch (error) {
      logger.trackError(error as Error, { session });
      throw error;
    }
  }

  /**
   * Обновление сессии
   */
  update(sessionId: string, updates: Partial<UserSession>): void {
    try {
      const fields = [];
      const values = [];

      if (updates.endedAt !== undefined) {
        fields.push('ended_at = ?');
        values.push(updates.endedAt);
      }

      if (updates.durationSeconds !== undefined) {
        fields.push('duration_seconds = ?');
        values.push(updates.durationSeconds);
      }

      if (updates.pageViews !== undefined) {
        fields.push('page_views = ?');
        values.push(updates.pageViews);
      }

      if (updates.eventsCount !== undefined) {
        fields.push('events_count = ?');
        values.push(updates.eventsCount);
      }

      if (updates.servicesUsed !== undefined) {
        fields.push('services_used = ?');
        values.push(JSON.stringify(updates.servicesUsed));
      }

      if (fields.length === 0) {
        return;
      }

      values.push(sessionId);

      const stmt = this.db.prepare(`
        UPDATE user_sessions
        SET ${fields.join(', ')}
        WHERE id = ?
      `);

      stmt.run(...values);

      logger.debug('Session updated', {
        sessionId,
        updates
      });
    } catch (error) {
      logger.trackError(error as Error, { sessionId, updates });
      throw error;
    }
  }

  /**
   * Получение сессии по ID
   */
  getById(sessionId: string): UserSession | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM user_sessions WHERE id = ?
      `);

      const row = stmt.get(sessionId) as any;

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        userId: row.user_id,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        durationSeconds: row.duration_seconds,
        pageViews: row.page_views,
        eventsCount: row.events_count,
        servicesUsed: row.services_used ? JSON.parse(row.services_used) : [],
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        deviceType: row.device_type as DeviceType,
        browser: row.browser,
        os: row.os
      };
    } catch (error) {
      logger.trackError(error as Error, { sessionId });
      throw error;
    }
  }

  /**
   * Получение активных сессий пользователя
   */
  getActiveByUserId(userId: string): UserSession[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM user_sessions
        WHERE user_id = ? AND ended_at IS NULL
        ORDER BY started_at DESC
      `);

      const rows = stmt.all(userId) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        durationSeconds: row.duration_seconds,
        pageViews: row.page_views,
        eventsCount: row.events_count,
        servicesUsed: row.services_used ? JSON.parse(row.services_used) : [],
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        deviceType: row.device_type as DeviceType,
        browser: row.browser,
        os: row.os
      }));
    } catch (error) {
      logger.trackError(error as Error, { userId });
      throw error;
    }
  }

  /**
   * Получение всех сессий пользователя
   */
  getByUserId(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): UserSession[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM user_sessions
        WHERE user_id = ?
        ORDER BY started_at DESC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(userId, limit, offset) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        durationSeconds: row.duration_seconds,
        pageViews: row.page_views,
        eventsCount: row.events_count,
        servicesUsed: row.services_used ? JSON.parse(row.services_used) : [],
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        deviceType: row.device_type as DeviceType,
        browser: row.browser,
        os: row.os
      }));
    } catch (error) {
      logger.trackError(error as Error, { userId, limit, offset });
      throw error;
    }
  }

  /**
   * Получение сессий за период
   */
  getByDateRange(
    startDate: number,
    endDate: number,
    limit: number = 1000,
    offset: number = 0
  ): UserSession[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM user_sessions
        WHERE started_at >= ? AND started_at <= ?
        ORDER BY started_at DESC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(startDate, endDate, limit, offset) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        durationSeconds: row.duration_seconds,
        pageViews: row.page_views,
        eventsCount: row.events_count,
        servicesUsed: row.services_used ? JSON.parse(row.services_used) : [],
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        deviceType: row.device_type as DeviceType,
        browser: row.browser,
        os: row.os
      }));
    } catch (error) {
      logger.trackError(error as Error, { startDate, endDate, limit, offset });
      throw error;
    }
  }

  /**
   * Подсчет сессий пользователя
   */
  countByUserId(userId: string): number {
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM user_sessions WHERE user_id = ?
      `);

      const result = stmt.get(userId) as { count: number };
      return result.count;
    } catch (error) {
      logger.trackError(error as Error, { userId });
      throw error;
    }
  }

  /**
   * Получение статистики сессий
   */
  getSessionStats(startDate?: number, endDate?: number): {
    totalSessions: number;
    activeSessions: number;
    avgDuration: number;
    uniqueUsers: number;
  } {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (startDate && endDate) {
        whereClause = ' WHERE started_at >= ? AND started_at <= ?';
        params.push(startDate, endDate);
      }

      const stmt = this.db.prepare(`
        SELECT
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN ended_at IS NULL THEN 1 END) as active_sessions,
          AVG(CASE WHEN ended_at IS NOT NULL THEN duration_seconds END) as avg_duration,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_sessions
        ${whereClause}
      `);

      const result = stmt.get(...params) as {
        total_sessions: number;
        active_sessions: number;
        avg_duration: number;
        unique_users: number;
      };

      return {
        totalSessions: result.total_sessions,
        activeSessions: result.active_sessions,
        avgDuration: result.avg_duration || 0,
        uniqueUsers: result.unique_users
      };
    } catch (error) {
      logger.trackError(error as Error, { startDate, endDate });
      throw error;
    }
  }

  /**
   * Завершение всех активных сессий пользователя
   */
  endAllActiveSessions(userId: string): number {
    try {
      const endTime = Math.floor(Date.now() / 1000);

      const stmt = this.db.prepare(`
        UPDATE user_sessions
        SET ended_at = ?, duration_seconds = (ended_at - started_at)
        WHERE user_id = ? AND ended_at IS NULL
      `);

      const result = stmt.run(endTime, userId);

      logger.info(`Ended ${result.changes} active sessions for user`, {
        userId,
        endedSessions: result.changes
      });

      return result.changes;
    } catch (error) {
      logger.trackError(error as Error, { userId });
      throw error;
    }
  }

  /**
   * Удаление старых сессий (для очистки)
   */
  deleteOldSessions(olderThanDays: number): number {
    try {
      const cutoffTime = Math.floor(Date.now() / 1000) - (olderThanDays * 24 * 60 * 60);

      const stmt = this.db.prepare(`
        DELETE FROM user_sessions WHERE started_at < ?
      `);

      const result = stmt.run(cutoffTime);

      logger.info(`Deleted ${result.changes} old sessions`, {
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
