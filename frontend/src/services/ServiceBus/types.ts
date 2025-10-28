/**
 * Типы для Service Bus
 */

export interface ServiceEvent {
  id: string;
  type: string;
  source: string;
  target?: string;
  data: unknown;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'critical';
  ttl?: number; // Time to live in milliseconds
}

export interface ServiceRequest {
  id: string;
  method: string;
  params: unknown;
  source: string;
  target: string;
  timeout?: number;
  timestamp: Date;
}

export interface ServiceResponse {
  id: string;
  requestId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: Date;
}

export interface ServiceMiddleware {
  name: string;
  priority: number;
  beforeEvent?: (event: ServiceEvent) => ServiceEvent | null;
  afterEvent?: (event: ServiceEvent) => ServiceEvent | null;
  beforeRequest?: (request: ServiceRequest) => ServiceRequest | null;
  afterResponse?: (response: ServiceResponse) => ServiceResponse | null;
}

export interface ServiceBus {
  // События
  publish(event: ServiceEvent): void;
  subscribe(eventType: string, handler: EventHandler): string;
  unsubscribe(subscriptionId: string): void;

  // Запросы/Ответы
  request(request: ServiceRequest): Promise<ServiceResponse>;
  respond(serviceId: string, method: string, handler: RequestHandler): void;
  unrespond(serviceId: string, method: string): void;

  // Middleware
  addMiddleware(middleware: ServiceMiddleware): void;
  removeMiddleware(name: string): void;

  // Управление
  start(): void;
  stop(): void;
  isRunning(): boolean;

  // Отладка
  getSubscriptions(): SubscriptionInfo[];
  getActiveRequests(): RequestInfo[];
  getMiddleware(): ServiceMiddleware[];
}

export type EventHandler = (event: ServiceEvent) => void | Promise<void>;
export type RequestHandler = (request: ServiceRequest) => Promise<ServiceResponse>;

export interface SubscriptionInfo {
  id: string;
  eventType: string;
  handler: EventHandler;
  serviceId: string;
  createdAt: Date;
}

export interface RequestInfo {
  id: string;
  method: string;
  source: string;
  target: string;
  status: 'pending' | 'completed' | 'timeout' | 'error';
  createdAt: Date;
  completedAt?: Date;
}

export interface ServiceBusConfig {
  maxConcurrentRequests: number;
  defaultTimeout: number;
  eventBufferSize: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}
