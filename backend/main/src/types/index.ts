/**
 * Общие типы для API Gateway
 */

/**
 * Стандартный ответ API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
  };
}

/**
 * Пользователь системы
 */
export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * Данные Telegram авторизации
 */
export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * JWT токен
 */
export interface JwtToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Конфигурация микросервиса
 */
export interface MicroserviceConfig {
  name: string;
  url: string;
  healthEndpoint: string;
  timeout: number;
  retries: number;
  isEnabled: boolean;
}

/**
 * Статус здоровья микросервиса
 */
export interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

/**
 * Статус здоровья API Gateway
 */
export interface GatewayHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: HealthStatus[];
  version: string;
}

/**
 * Логи запросов
 */
export interface RequestLog {
  id: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip: string;
  userId?: string;
  timestamp: string;
}

/**
 * Конфигурация прокси
 */
export interface ProxyConfig {
  target: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

/**
 * Ошибка прокси
 */
export interface ProxyError {
  status: number;
  data: any;
  isProxyError: true;
}

/**
 * Конфигурация rate limiting
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Статистика API Gateway
 */
export interface GatewayStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeConnections: number;
  uptime: number;
  services: {
    [serviceName: string]: {
      requests: number;
      errors: number;
      averageResponseTime: number;
    };
  };
}

/**
 * События WebSocket
 */
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

/**
 * Подписка на события
 */
export interface EventSubscription {
  userId: string;
  events: string[];
  socketId: string;
  subscribedAt: string;
}

/**
 * Конфигурация CORS
 */
export interface CorsConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

/**
 * Конфигурация безопасности
 */
export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  rateLimit: RateLimitConfig;
  cors: CorsConfig;
  helmet: boolean;
}

/**
 * Конфигурация логирования
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'simple';
  file?: string;
  console: boolean;
}

/**
 * Полная конфигурация API Gateway
 */
export interface GatewayConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  security: SecurityConfig;
  logging: LoggingConfig;
  microservices: {
    ozonManager: MicroserviceConfig;
    aiServices: MicroserviceConfig;
  };
  features: {
    websocket: boolean;
    rateLimit: boolean;
    cors: boolean;
    helmet: boolean;
    proxy: boolean;
  };
}
