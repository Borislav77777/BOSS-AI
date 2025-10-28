/**
 * Тесты для NotificationService
 */

import { notificationService } from '@/services/NotificationService';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Мокаем localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('NotificationService', () => {
  beforeEach(() => {
    // Очищаем все уведомления перед каждым тестом
    notificationService.hideAll();
    vi.clearAllMocks();
    // Очищаем DOM перед каждым тестом
    document.body.innerHTML = '';
  });

  it('показывает уведомление об успехе', () => {
    const id = notificationService.success('Успех', 'Операция выполнена успешно');

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');

    const notifications = notificationService.getNotifications();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].title).toBe('Успех');
    expect(notifications[0].message).toBe('Операция выполнена успешно');
  });

  it('показывает уведомление об ошибке', () => {
    const id = notificationService.error('Ошибка', 'Произошла ошибка');

    expect(id).toBeDefined();

    const notifications = notificationService.getNotifications();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('error');
    expect(notifications[0].title).toBe('Ошибка');
    expect(notifications[0].message).toBe('Произошла ошибка');
  });

  it('показывает предупреждение', () => {
    const id = notificationService.warning('Предупреждение', 'Внимание!');

    expect(id).toBeDefined();

    const notifications = notificationService.getNotifications();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('warning');
  });

  it('показывает информационное уведомление', () => {
    const id = notificationService.info('Информация', 'Полезная информация');

    expect(id).toBeDefined();

    const notifications = notificationService.getNotifications();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('info');
  });

  it('скрывает уведомление по ID', () => {
    const id = notificationService.success('Тест', 'Сообщение');

    expect(notificationService.getNotifications()).toHaveLength(1);

    notificationService.hide(id);

    expect(notificationService.getNotifications()).toHaveLength(0);
  });

  it('скрывает все уведомления', () => {
    notificationService.success('Тест 1', 'Сообщение 1');
    notificationService.error('Тест 2', 'Сообщение 2');

    expect(notificationService.getNotifications()).toHaveLength(2);

    notificationService.hideAll();

    expect(notificationService.getNotifications()).toHaveLength(0);
  });

  it('подписывается на изменения уведомлений', () => {
    const listener = vi.fn();
    const unsubscribe = notificationService.subscribe(listener);

    notificationService.success('Тест', 'Сообщение');

    expect(listener).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'success',
          title: 'Тест',
          message: 'Сообщение',
        }),
      ])
    );

    unsubscribe();
  });

  it('показывает уведомление об ошибке Error Boundary', () => {
    const error = new Error('Test error');
    const errorInfo = {
      componentStack: 'Test component stack',
      errorBoundary: 'TestErrorBoundary',
    };

    const id = notificationService.showErrorBoundaryNotification(error, errorInfo);

    expect(id).toBeDefined();

    const notifications = notificationService.getNotifications();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('error');
    expect(notifications[0].actions).toHaveLength(2); // Подробности и Закрыть
  });

  it('устанавливает правильную длительность для разных типов уведомлений', () => {
    const successId = notificationService.success('Успех', 'Сообщение');
    const errorId = notificationService.error('Ошибка', 'Сообщение');
    const warningId = notificationService.warning('Предупреждение', 'Сообщение');
    const infoId = notificationService.info('Информация', 'Сообщение');

    const notifications = notificationService.getNotifications();

    const successNotification = notifications.find(n => n.id === successId);
    const errorNotification = notifications.find(n => n.id === errorId);
    const warningNotification = notifications.find(n => n.id === warningId);
    const infoNotification = notifications.find(n => n.id === infoId);

    expect(successNotification?.duration).toBe(3000);
    expect(errorNotification?.duration).toBe(0); // Не скрывать автоматически
    expect(warningNotification?.duration).toBe(5000);
    expect(infoNotification?.duration).toBe(4000);
  });
});
