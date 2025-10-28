/**
 * Модуль уведомлений о изменениях настроек
 */

import { SettingValue } from '@/types';
import { SettingsNotifications } from '../types/SettingsTypes';

export class SettingsNotificationsImpl implements SettingsNotifications {
  private listeners: Map<string, Set<(value: SettingValue) => void>> = new Map();

  notify(key: string, value: SettingValue): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Ошибка в callback для настройки ${key}:`, error);
        }
      });
    }
  }

  notifyAll(): void {
    this.listeners.forEach((callbacks, key) => {
      callbacks.forEach(callback => {
        try {
          // Получаем текущее значение настройки из контекста
          // Это должно быть реализовано в главном сервисе
          callback(undefined as SettingValue);
        } catch (error) {
          console.error(`Ошибка в callback для настройки ${key}:`, error);
        }
      });
    });
  }

  subscribe(key: string, callback: (value: SettingValue) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    // Возвращаем функцию отписки
    return () => {
      this.unsubscribe(key, callback);
    };
  }

  unsubscribe(key: string, callback: (value: SettingValue) => void): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.delete(callback);

      // Удаляем пустые наборы
      if (callbacks.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  getSubscribersCount(key: string): number {
    const callbacks = this.listeners.get(key);
    return callbacks ? callbacks.size : 0;
  }

  getAllSubscribersCount(): number {
    let total = 0;
    this.listeners.forEach(callbacks => {
      total += callbacks.size;
    });
    return total;
  }

  getSubscribedKeys(): string[] {
    return Array.from(this.listeners.keys());
  }

  clearAllSubscriptions(): void {
    this.listeners.clear();
  }

  clearSubscriptionsForKey(key: string): void {
    this.listeners.delete(key);
  }

  hasSubscribers(key: string): boolean {
    const callbacks = this.listeners.get(key);
    return callbacks ? callbacks.size > 0 : false;
  }

  getSubscribersInfo(): Record<string, number> {
    const info: Record<string, number> = {};
    this.listeners.forEach((callbacks, key) => {
      info[key] = callbacks.size;
    });
    return info;
  }
}
