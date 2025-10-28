/**
 * Сервис для показа уведомлений пользователю
 */

import { ERRORS } from '@/constants/errors';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private nextId = 1;

  /**
   * Показывает уведомление
   */
  show(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      duration?: number;
      actions?: NotificationAction[];
      metadata?: Record<string, any>;
    }
  ): string {
    const notification: Notification = {
      id: `notification_${this.nextId++}`,
      type,
      title,
      message,
      duration: options?.duration ?? this.getDefaultDuration(type),
      actions: options?.actions,
      metadata: options?.metadata,
    };

    this.notifications.unshift(notification);
    this.notifyListeners();

    // Автоматическое скрытие
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.hide(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  /**
   * Показывает уведомление об успехе
   */
  success(title: string, message: string, options?: Partial<Notification>): string {
    return this.show('success', title, message, options);
  }

  /**
   * Показывает уведомление об ошибке
   */
  error(title: string, message: string, options?: Partial<Notification>): string {
    return this.show('error', title, message, options);
  }

  /**
   * Показывает предупреждение
   */
  warning(title: string, message: string, options?: Partial<Notification>): string {
    return this.show('warning', title, message, options);
  }

  /**
   * Показывает информационное уведомление
   */
  info(title: string, message: string, options?: Partial<Notification>): string {
    return this.show('info', title, message, options);
  }

  /**
   * Скрывает уведомление
   */
  hide(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Скрывает все уведомления
   */
  hideAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Получает все активные уведомления
   */
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Подписывается на изменения уведомлений
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Показывает уведомление об ошибке из Error Boundary
   */
  showErrorBoundaryNotification(
    error: Error,
    errorInfo?: {
      componentStack?: string;
      errorBoundary?: string;
    }
  ): string {
    const errorType = this.determineErrorType(error);
    const title = this.getErrorTitle(errorType);
    const message = this.getErrorMessage(error, errorType);

    return this.error(title, message, {
      duration: 0, // Не скрывать автоматически
      actions: [
        {
          label: 'Подробности',
          action: () => this.showErrorDetails(error, errorInfo),
          variant: 'secondary',
        },
        {
          label: 'Закрыть',
          action: () => this.hideAll(),
          variant: 'primary',
        },
      ],
      metadata: {
        errorType,
        componentStack: errorInfo?.componentStack,
        errorBoundary: errorInfo?.errorBoundary,
      },
    });
  }

  private getDefaultDuration(type: NotificationType): number {
    switch (type) {
      case 'success': return 3000;
      case 'error': return 0; // Не скрывать ошибки автоматически
      case 'warning': return 5000;
      case 'info': return 4000;
      default: return 3000;
    }
  }

  private determineErrorType(error: Error): string {
    if (error.name === 'TypeError') return 'Ошибка типа';
    if (error.name === 'ReferenceError') return 'Ошибка ссылки';
    if (error.name === 'NetworkError') return 'Ошибка сети';
    if (error.message.includes('fetch')) return 'Ошибка загрузки';
    if (error.message.includes('auth')) return 'Ошибка аутентификации';
    if (error.message.includes('permission')) return 'Ошибка доступа';
    return 'Неизвестная ошибка';
  }

  private getErrorTitle(errorType: string): string {
    return errorType;
  }

  private getErrorMessage(error: Error, errorType: string): string {
    if (error.message) {
      return error.message;
    }

    switch (errorType) {
      case 'Ошибка сети': return ERRORS.MESSAGES.NETWORK;
      case 'Ошибка аутентификации': return ERRORS.MESSAGES.AUTHENTICATION;
      case 'Ошибка доступа': return ERRORS.MESSAGES.AUTHORIZATION;
      default: return ERRORS.MESSAGES.GENERIC;
    }
  }

  private showErrorDetails(error: Error, _errorInfo?: any): void {
    // const details = {
    //   message: error.message,
    //   stack: error.stack,
    //   componentStack: errorInfo?.componentStack,
    //   userAgent: navigator.userAgent,
    //   url: window.location.href,
    //   timestamp: new Date().toISOString(),
    // };

    // Показываем детали в консоли для разработки
    if (import.meta.env.DEV) {
      console.group('🔍 Детали ошибки');
      console.error('Ошибка:', error);
      // console.log('Информация:', errorInfo);
      // console.log('Детали:', details);
      console.groupEnd();
    }

    // В продакшене можно показать модальное окно с деталями
    this.info('Детали ошибки', 'Подробная информация об ошибке выведена в консоль разработчика');
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}

export const notificationService = new NotificationService();
