import Database from 'better-sqlite3';
import { AggregatedMetric, MetricType, PerformanceMetric, ServiceUsage } from '../../types/analytics.types';
import { logger } from '../../utils/logger';

/**
 * Репозиторий для работы с метриками производительности и использования сервисов
 */
export class MetricsRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // ========== Performance Metrics ==========

  /**
   * Создание метрики производительности
   */
  createPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'createdAt'>): number {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO performance_metrics (
          user_id, metric_type, metric_name, value, unit, page_url, service_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        metric.userId || null,
        metric.metricType,
        metric.metricName,
        metric.value,
        metric.unit,
        metric.pageUrl || null,
        metric.serviceName || null
      );

      logger.trackPerformance(metric.metricName, metric.value, metric.unit, {
        metricId: result.lastInsertRowid,
        userId: metric.userId,
        serviceName: metric.serviceName
      });

      return result.lastInsertRowid as number;
    } catch (error) {
      logger.trackError(error as Error, { metric });
      throw error;
    }
  }

  /**
   * Получение метрик производительности
   */
  getPerformanceMetrics(
    userId?: string,
    metricType?: MetricType,
    serviceName?: string,
    limit: number = 100,
    offset: number = 0
  ): PerformanceMetric[] {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (userId) {
        whereClause += whereClause ? ' AND user_id = ?' : ' WHERE user_id = ?';
        params.push(userId);
      }

      if (metricType) {
        whereClause += whereClause ? ' AND metric_type = ?' : ' WHERE metric_type = ?';
        params.push(metricType);
      }

      if (serviceName) {
        whereClause += whereClause ? ' AND service_name = ?' : ' WHERE service_name = ?';
        params.push(serviceName);
      }

      params.push(limit, offset);

      const stmt = this.db.prepare(`
        SELECT * FROM performance_metrics
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        metricType: row.metric_type as MetricType,
        metricName: row.metric_name,
        value: row.value,
        unit: row.unit,
        pageUrl: row.page_url,
        serviceName: row.service_name,
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.trackError(error as Error, { userId, metricType, serviceName, limit, offset });
      throw error;
    }
  }

  /**
   * Получение средних значений метрик
   */
  getAverageMetrics(
    metricType: MetricType,
    startDate?: number,
    endDate?: number
  ): Array<{
    metricName: string;
    avgValue: number;
    minValue: number;
    maxValue: number;
    count: number;
  }> {
    try {
      let whereClause = ' WHERE metric_type = ?';
      const params: any[] = [metricType];

      if (startDate && endDate) {
        whereClause += ' AND created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate);
      }

      const stmt = this.db.prepare(`
        SELECT
          metric_name,
          AVG(value) as avg_value,
          MIN(value) as min_value,
          MAX(value) as max_value,
          COUNT(*) as count
        FROM performance_metrics
        ${whereClause}
        GROUP BY metric_name
        ORDER BY avg_value DESC
      `);

      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        metricName: row.metric_name,
        avgValue: row.avg_value,
        minValue: row.min_value,
        maxValue: row.max_value,
        count: row.count
      }));
    } catch (error) {
      logger.trackError(error as Error, { metricType, startDate, endDate });
      throw error;
    }
  }

  // ========== Service Usage ==========

  /**
   * Создание записи использования сервиса
   */
  createServiceUsage(usage: Omit<ServiceUsage, 'id' | 'createdAt'>): number {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO service_usage (
          user_id, service_name, action, success, duration_ms,
          cost_bt, cost_rub, request_data, response_data, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        usage.userId,
        usage.serviceName,
        usage.action,
        usage.success ? 1 : 0,
        usage.durationMs,
        usage.costBt,
        usage.costRub,
        usage.requestData ? JSON.stringify(usage.requestData) : null,
        usage.responseData ? JSON.stringify(usage.responseData) : null,
        usage.errorMessage || null
      );

      logger.info('Service usage tracked', {
        usageId: result.lastInsertRowid,
        userId: usage.userId,
        serviceName: usage.serviceName,
        action: usage.action,
        success: usage.success
      });

      return result.lastInsertRowid as number;
    } catch (error) {
      logger.trackError(error as Error, { usage });
      throw error;
    }
  }

  /**
   * Получение использования сервисов
   */
  getServiceUsage(
    userId?: string,
    serviceName?: string,
    success?: boolean,
    limit: number = 100,
    offset: number = 0
  ): ServiceUsage[] {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (userId) {
        whereClause += whereClause ? ' AND user_id = ?' : ' WHERE user_id = ?';
        params.push(userId);
      }

      if (serviceName) {
        whereClause += whereClause ? ' AND service_name = ?' : ' WHERE service_name = ?';
        params.push(serviceName);
      }

      if (success !== undefined) {
        whereClause += whereClause ? ' AND success = ?' : ' WHERE success = ?';
        params.push(success ? 1 : 0);
      }

      params.push(limit, offset);

      const stmt = this.db.prepare(`
        SELECT * FROM service_usage
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        serviceName: row.service_name,
        action: row.action,
        success: row.success === 1,
        durationMs: row.duration_ms,
        costBt: row.cost_bt,
        costRub: row.cost_rub,
        requestData: row.request_data ? JSON.parse(row.request_data) : undefined,
        responseData: row.response_data ? JSON.parse(row.response_data) : undefined,
        errorMessage: row.error_message,
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.trackError(error as Error, { userId, serviceName, success, limit, offset });
      throw error;
    }
  }

  /**
   * Получение статистики использования сервисов
   */
  getServiceUsageStats(startDate?: number, endDate?: number): Array<{
    serviceName: string;
    totalUsage: number;
    successRate: number;
    avgDuration: number;
    totalRevenue: number;
    uniqueUsers: number;
  }> {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (startDate && endDate) {
        whereClause = ' WHERE created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate);
      }

      const stmt = this.db.prepare(`
        SELECT
          service_name,
          COUNT(*) as total_usage,
          AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as success_rate,
          AVG(duration_ms) as avg_duration,
          SUM(cost_rub) as total_revenue,
          COUNT(DISTINCT user_id) as unique_users
        FROM service_usage
        ${whereClause}
        GROUP BY service_name
        ORDER BY total_usage DESC
      `);

      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        serviceName: row.service_name,
        totalUsage: row.total_usage,
        successRate: row.success_rate,
        avgDuration: row.avg_duration || 0,
        totalRevenue: row.total_revenue || 0,
        uniqueUsers: row.unique_users
      }));
    } catch (error) {
      logger.trackError(error as Error, { startDate, endDate });
      throw error;
    }
  }

  // ========== Aggregated Metrics ==========

  /**
   * Создание агрегированной метрики
   */
  createAggregatedMetric(metric: Omit<AggregatedMetric, 'id' | 'createdAt' | 'updatedAt'>): number {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO aggregated_metrics (
          metric_date, metric_hour, user_id, service_name,
          total_events, total_sessions, total_users, total_api_calls,
          total_errors, total_revenue_bt, avg_session_duration,
          avg_response_time, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        metric.metricDate,
        metric.metricHour || null,
        metric.userId || null,
        metric.serviceName || null,
        metric.totalEvents,
        metric.totalSessions,
        metric.totalUsers,
        metric.totalApiCalls,
        metric.totalErrors,
        metric.totalRevenueBt,
        metric.avgSessionDuration,
        metric.avgResponseTime,
        metric.metadata ? JSON.stringify(metric.metadata) : null
      );

      return result.lastInsertRowid as number;
    } catch (error) {
      logger.trackError(error as Error, { metric });
      throw error;
    }
  }

  /**
   * Обновление агрегированной метрики
   */
  updateAggregatedMetric(
    id: number,
    updates: Partial<Omit<AggregatedMetric, 'id' | 'createdAt' | 'metricDate' | 'metricHour'>>
  ): void {
    try {
      const fields = [];
      const values = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          fields.push(`${dbKey} = ?`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        return;
      }

      fields.push('updated_at = ?');
      values.push(Math.floor(Date.now() / 1000));
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE aggregated_metrics
        SET ${fields.join(', ')}
        WHERE id = ?
      `);

      stmt.run(...values);
    } catch (error) {
      logger.trackError(error as Error, { id, updates });
      throw error;
    }
  }

  /**
   * Получение агрегированных метрик
   */
  getAggregatedMetrics(
    startDate: string,
    endDate: string,
    userId?: string,
    serviceName?: string
  ): AggregatedMetric[] {
    try {
      let whereClause = ' WHERE metric_date >= ? AND metric_date <= ?';
      const params: any[] = [startDate, endDate];

      if (userId) {
        whereClause += ' AND user_id = ?';
        params.push(userId);
      }

      if (serviceName) {
        whereClause += ' AND service_name = ?';
        params.push(serviceName);
      }

      const stmt = this.db.prepare(`
        SELECT * FROM aggregated_metrics
        ${whereClause}
        ORDER BY metric_date DESC, metric_hour DESC
      `);

      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        id: row.id,
        metricDate: row.metric_date,
        metricHour: row.metric_hour,
        userId: row.user_id,
        serviceName: row.service_name,
        totalEvents: row.total_events,
        totalSessions: row.total_sessions,
        totalUsers: row.total_users,
        totalApiCalls: row.total_api_calls,
        totalErrors: row.total_errors,
        totalRevenueBt: row.total_revenue_bt,
        avgSessionDuration: row.avg_session_duration,
        avgResponseTime: row.avg_response_time,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      logger.trackError(error as Error, { startDate, endDate, userId, serviceName });
      throw error;
    }
  }

  /**
   * Удаление старых метрик (для очистки)
   */
  deleteOldMetrics(olderThanDays: number): number {
    try {
      const cutoffTime = Math.floor(Date.now() / 1000) - (olderThanDays * 24 * 60 * 60);

      // Удаляем старые метрики производительности
      const perfStmt = this.db.prepare(`
        DELETE FROM performance_metrics WHERE created_at < ?
      `);
      const perfResult = perfStmt.run(cutoffTime);

      // Удаляем старые записи использования сервисов
      const usageStmt = this.db.prepare(`
        DELETE FROM service_usage WHERE created_at < ?
      `);
      const usageResult = usageStmt.run(cutoffTime);

      const totalDeleted = perfResult.changes + usageResult.changes;

      logger.info(`Deleted ${totalDeleted} old metrics`, {
        olderThanDays,
        cutoffTime,
        performanceMetrics: perfResult.changes,
        serviceUsage: usageResult.changes
      });

      return totalDeleted;
    } catch (error) {
      logger.trackError(error as Error, { olderThanDays });
      throw error;
    }
  }
}
