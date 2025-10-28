// Общие типы для всех сервисов Boss AI Platform

export interface User {
    id: string;
    telegram_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    auth_date: number;
    agreed_to_terms: boolean;
    agreed_at?: string;
    created_at: string;
    last_login: string;
}

export interface Session {
    id: string;
    user_id: string;
    token: string;
    expires_at: string;
    created_at: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ServiceConfig {
    name: string;
    version: string;
    enabled: boolean;
    config: Record<string, any>;
}

export interface HealthStatus {
    service: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    uptime: number;
    lastCheck: string;
    details?: Record<string, any>;
}

export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: string;
    service: string;
}

export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

export interface LogEntry {
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    service: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

// Ozon Manager типы
export interface OzonStore {
    id: string;
    user_id: string;
    name: string;
    api_key: string;
    client_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface OzonProduct {
    id: string;
    name: string;
    sku: string;
    price: number;
    status: string;
    created_at: string;
}

export interface OzonPromotion {
    id: string;
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

// AI Services типы
export interface AIService {
    id: string;
    name: string;
    type: 'chatgpt' | 'claude' | 'gemini' | 'custom';
    config: Record<string, any>;
    is_active: boolean;
}

export interface AIRequest {
    service: string;
    prompt: string;
    context?: Record<string, any>;
    options?: Record<string, any>;
}

export interface AIResponse {
    service: string;
    response: string;
    tokens_used?: number;
    processing_time: number;
    metadata?: Record<string, any>;
}
