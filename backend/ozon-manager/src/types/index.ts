// Типы для Ozon Manager Backend

export interface StoreConfig {
  id?: string;
  name: string;
  client_id: string;
  api_key: string;
  remove_from_promotions: boolean;
  unarchive_enabled: boolean;
  manual_run_on_startup: boolean;
  schedule_times: {
    remove: string;
    unarchive: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleConfig {
  type: 'time' | 'interval';
  time: string;
  interval_hours: number;
}

export interface OzonAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  status_code?: number;
}

export interface PromotionResult {
  success: boolean;
  products_removed: number;
  actions_processed: number;
  errors: string[];
}

export interface ArchiveResult {
  success: boolean;
  total_unarchived: number;
  cycles_completed: number;
  stopped_reason: string;
  message: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  store_name?: string;
  operation?: string;
}

export interface ApiRequest {
  method: string;
  url: string;
  status_code: number;
  response_time: number;
  error?: string;
}

export interface RateLimiter {
  max_requests: number;
  time_window: number;
  requests: number[];
}

export interface OzonClientConfig {
  client_id: string;
  api_key: string;
  base_url: string;
  timeout: number;
  rate_limit: number;
}
