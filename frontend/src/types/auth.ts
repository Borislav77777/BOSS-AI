/**
 * Типы для системы авторизации через Telegram
 * 
 * @module types/auth
 */

/**
 * Данные авторизованного пользователя (Telegram)
 */
export interface AuthUser {
  /** ID пользователя в БД */
  id: number;
  
  /** Telegram ID пользователя */
  telegram_id: number;
  
  /** Username в Telegram (может отсутствовать) */
  username?: string;
  
  /** Имя пользователя */
  first_name: string;
  
  /** Фамилия пользователя (может отсутствовать) */
  last_name?: string;
  
  /** URL фото профиля (может отсутствовать) */
  photo_url?: string;
  
  /** Согласился ли пользователь с условиями */
  agreed_to_terms: boolean;
  
  /** Timestamp создания аккаунта */
  created_at?: number;
  
  /** Timestamp последнего входа */
  last_login?: number;
}

/**
 * Данные от Telegram Login Widget
 * Согласно официальной документации Telegram
 */
export interface TelegramAuthData {
  /** Telegram ID пользователя */
  id: number;
  
  /** Имя пользователя */
  first_name: string;
  
  /** Фамилия пользователя (опционально) */
  last_name?: string;
  
  /** Username в Telegram (опционально) */
  username?: string;
  
  /** URL фото профиля (опционально) */
  photo_url?: string;
  
  /** Timestamp авторизации (Unix timestamp) */
  auth_date: number;
  
  /** HMAC-SHA256 hash для валидации */
  hash: string;
}

/**
 * Ответ от backend при успешной авторизации
 */
export interface AuthResponse {
  /** Флаг успешности */
  success: boolean;
  
  /** Данные авторизации */
  data: {
    /** Данные пользователя */
    user: AuthUser;
    
    /** JWT токен для последующих запросов */
    token: string;
    
    /** Нужно ли показать диалог соглашения */
    needsAgreement: boolean;
  };
}

/**
 * Ответ от backend с данными пользователя
 */
export interface CurrentUserResponse {
  /** Флаг успешности */
  success: boolean;
  
  /** Данные пользователя */
  data: AuthUser;
}

/**
 * Ответ от backend при ошибке
 */
export interface AuthErrorResponse {
  /** Флаг успешности (всегда false) */
  success: false;
  
  /** Сообщение об ошибке */
  error: string;
}

/**
 * Состояние авторизации
 */
export enum AuthStatus {
  /** Не авторизован */
  UNAUTHORIZED = 'unauthorized',
  
  /** В процессе авторизации */
  LOADING = 'loading',
  
  /** Авторизован, но не принял соглашение */
  NEEDS_AGREEMENT = 'needs_agreement',
  
  /** Полностью авторизован */
  AUTHORIZED = 'authorized',
  
  /** Ошибка авторизации */
  ERROR = 'error',
}

/**
 * Конфигурация AuthService
 */
export interface AuthServiceConfig {
  /** Base URL API */
  baseUrl: string;
  
  /** Ключ для хранения токена в localStorage */
  tokenKey: string;
  
  /** Ключ для хранения данных пользователя в localStorage */
  userKey: string;
}

/**
 * Опции для Telegram Login Widget
 */
export interface TelegramLoginWidgetOptions {
  /** Username бота */
  botUsername: string;
  
  /** Размер кнопки */
  size?: 'large' | 'medium' | 'small';
  
  /** Радиус углов кнопки */
  radius?: number;
  
  /** Запрашивать ли доступ к отправке сообщений */
  requestAccess?: boolean;
  
  /** Callback функция при успешной авторизации */
  onAuth: (user: TelegramAuthData) => void;
}

