/**
 * Типы для модуля аналитики и отчетов Boss AI Platform
 */

// Базовые типы событий
export type EventType =
  | 'click'
  | 'navigation'
  | 'api_call'
  | 'service_use'
  | 'error'
  | 'performance'
  | 'billing';

export type EventCategory =
  | 'ui'
  | 'api'
  | 'service'
  | 'billing'
  | 'performance'
  | 'error';

export type DeviceType =
  | 'desktop'
  | 'mobile'
  | 'tablet';

export type MetricType =
  | 'page_load'
  | 'api_response'
  | 'render_time'
  | 'memory_usage'
  | 'cpu_usage';

export type ProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type SentimentType =
  | 'positive'
  | 'neutral'
  | 'negative';

// Интерфейсы для событий пользователей
export interface UserEvent {
  id?: number;
  userId: string;
  eventType: EventType;
  eventCategory: EventCategory;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  serviceName?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: number;
}

export interface UserSession {
  id: string;
  userId: string;
  startedAt: number;
  endedAt?: number;
  durationSeconds?: number;
  pageViews: number;
  eventsCount: number;
  servicesUsed: string[];
  ipAddress?: string;
  userAgent?: string;
  deviceType?: DeviceType;
  browser?: string;
  os?: string;
}

export interface PerformanceMetric {
  id?: number;
  userId?: string;
  metricType: MetricType;
  metricName: string;
  value: number;
  unit: string;
  pageUrl?: string;
  serviceName?: string;
  createdAt?: number;
}

export interface ServiceUsage {
  id?: number;
  userId: string;
  serviceName: string;
  action: string;
  success: boolean;
  durationMs: number;
  costBt: number;
  costRub: number;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  errorMessage?: string;
  createdAt?: number;
}

export interface AggregatedMetric {
  id?: number;
  metricDate: string; // YYYY-MM-DD
  metricHour?: number; // 0-23 (NULL для дневных метрик)
  userId?: string; // NULL для общих метрик
  serviceName?: string; // NULL для общих метрик
  totalEvents: number;
  totalSessions: number;
  totalUsers: number;
  totalApiCalls: number;
  totalErrors: number;
  totalRevenueBt: number;
  avgSessionDuration: number;
  avgResponseTime: number;
  metadata?: Record<string, any>;
  createdAt?: number;
  updatedAt?: number;
}

// Речевая аналитика (152 ФЗ)
export interface SpeechAnalytics {
  id?: number;
  userId: string;
  audioFilePath: string;
  audioDurationSeconds?: number;
  transcription?: string;
  sentiment?: SentimentType;
  keywords?: string[];
  complianceCheck: boolean;
  complianceIssues?: string[];
  processingStatus: ProcessingStatus;
  errorMessage?: string;
  createdAt?: number;
  processedAt?: number;
}

export interface SpeechAnalyticsResult {
  id: number;
  transcription: string;
  sentiment: SentimentType;
  keywords: string[];
  complianceCheck: boolean;
  complianceIssues: string[];
  processingStatus: ProcessingStatus;
  audioDuration: number;
  processedAt: number;
}

// API запросы и ответы
export interface TrackEventRequest {
  userId: string;
  eventType: EventType;
  eventCategory: EventCategory;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  serviceName?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

export interface TrackPerformanceRequest {
  userId?: string;
  metricType: MetricType;
  metricName: string;
  value: number;
  unit: string;
  pageUrl?: string;
  serviceName?: string;
}

export interface TrackServiceUsageRequest {
  userId: string;
  serviceName: string;
  action: string;
  success: boolean;
  durationMs: number;
  costBt?: number;
  costRub?: number;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  errorMessage?: string;
}

export interface StartSessionRequest {
  sessionId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
}

export interface ProcessAudioRequest {
  userId: string;
  audioFilePath: string;
  audioDuration: number;
}

// Дашборд и отчеты
export interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalEvents: number;
  totalRevenue: number;
  avgSessionDuration: number;
  topServices: Array<{
    serviceName: string;
    usageCount: number;
    revenue: number;
  }>;
  recentEvents: UserEvent[];
  performanceMetrics: PerformanceMetric[];
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalEvents: number;
  totalSpent: number;
  avgSessionDuration: number;
  lastActivity: number;
  servicesUsed: string[];
  recentEvents: UserEvent[];
}

export interface ServiceAnalytics {
  serviceName: string;
  totalUsers: number;
  totalUsage: number;
  totalRevenue: number;
  avgResponseTime: number;
  errorRate: number;
  recentUsage: ServiceUsage[];
}

export interface ExportOptions {
  format: 'csv' | 'json';
  startDate?: string;
  endDate?: string;
  userId?: string;
  serviceName?: string;
  eventType?: EventType;
}

// WebSocket события
export interface AnalyticsUpdateEvent {
  type: 'event' | 'metric' | 'session' | 'performance';
  data: any;
  timestamp: number;
}

// Конфигурация
export interface AnalyticsConfig {
  retentionDays: number;
  aggregationInterval: number;
  batchSize: number;
  maxConcurrentRequests: number;
  requestTimeout: number;
}

// Ошибки
export interface AnalyticsError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}
