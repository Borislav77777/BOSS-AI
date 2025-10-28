/**
 * Сервис работы с LocalStorage для Anti-Procrastination OS
 * Хранение всех данных локально без авторизации
 */

import type { APOSData, UserSettings } from '../../types/anti-procrastination';

const STORAGE_KEY = 'apos_data';
const VERSION = '1.0.0';

// Дефолтные настройки
const DEFAULT_SETTINGS: UserSettings = {
  pomodoro: {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
  },
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
  },
  detoxMode: {
    enabled: false,
    blockedSites: [],
  },
  theme: 'auto',
  language: 'ru',
};

class LocalStorageService {
  /**
   * Инициализация хранилища
   */
  init(): APOSData {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const data = JSON.parse(stored) as Record<string, unknown>;
        // Конвертация строк дат обратно в Date объекты
        return this.parseDates(data);
      } catch (error) {
        console.error('[APOS] Ошибка при парсинге данных:', error);
        return this.createInitialData();
      }
    }

    return this.createInitialData();
  }

  /**
   * Создание начальных данных
   */
  private createInitialData(): APOSData {
    const data: APOSData = {
      tasks: [],
      currentBlock: null,
      completedBlocks: [],
      dailyStats: [],
      settings: DEFAULT_SETTINGS,
      lastSync: new Date(),
    };

    this.save(data);
    return data;
  }

  /**
   * Сохранение данных
   */
  save(data: APOSData): void {
    try {
      const toSave = {
        ...data,
        lastSync: new Date(),
        version: VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('[APOS] Ошибка при сохранении:', error);
      // Если переполнение - очищаем старые данные
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanup(data);
        this.save(data);
      }
    }
  }

  /**
   * Получение всех данных
   */
  getData(): APOSData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored) as Record<string, unknown>;
      return this.parseDates(data);
    } catch (error) {
      console.error('[APOS] Ошибка при получении данных:', error);
      return null;
    }
  }

  /**
   * Парсинг строковых дат в Date объекты
   */
  private parseDates(data: Record<string, unknown>): APOSData {
    // Конвертация дат в объектах
    if (data.tasks && Array.isArray(data.tasks)) {
      data.tasks = (data.tasks as Record<string, unknown>[]).map((task: Record<string, unknown>) => ({
        ...task,
        createdAt: new Date(task.createdAt as string),
        updatedAt: new Date(task.updatedAt as string),
        deadline: task.deadline ? new Date(task.deadline as string) : undefined,
        timeBlocks: (task.timeBlocks as Record<string, unknown>[])?.map((block: Record<string, unknown>) => ({
          ...block,
          startTime: new Date(block.startTime as string),
          endTime: new Date(block.endTime as string),
          microActions: (block.microActions as Record<string, unknown>[])?.map((action: Record<string, unknown>) => ({
            ...action,
            startedAt: action.startedAt ? new Date(action.startedAt as string) : undefined,
            completedAt: action.completedAt ? new Date(action.completedAt as string) : undefined,
          })),
        })),
      }));
    }

    if (data.currentBlock) {
      const currentBlock = data.currentBlock as Record<string, unknown>;
      currentBlock.startTime = new Date(currentBlock.startTime as string);
      currentBlock.endTime = new Date(currentBlock.endTime as string);
    }

    if (data.completedBlocks && Array.isArray(data.completedBlocks)) {
      data.completedBlocks = (data.completedBlocks as Record<string, unknown>[]).map((block: Record<string, unknown>) => ({
        ...block,
        startTime: new Date(block.startTime as string),
        endTime: new Date(block.endTime as string),
      }));
    }

    if (data.lastSync) {
      data.lastSync = new Date(data.lastSync as string);
    }

    return data as unknown as APOSData;
  }

  /**
   * Очистка старых данных
   */
  private cleanup(data: APOSData): void {
    console.log('[APOS] Очистка старых данных...');

    // Удаляем статистику старше 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    data.dailyStats = data.dailyStats.filter(
      stat => new Date(stat.date) > thirtyDaysAgo
    );

    // Удаляем завершенные блоки старше 7 дней
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    data.completedBlocks = data.completedBlocks.filter(
      block => new Date(block.endTime) > sevenDaysAgo
    );

    // Удаляем выполненные задачи старше 30 дней
    data.tasks = data.tasks.filter(task => {
      if (task.status === 'completed') {
        return new Date(task.updatedAt) > thirtyDaysAgo;
      }
      return true;
    });
  }

  /**
   * Экспорт данных
   */
  export(): string {
    const data = this.getData();
    if (!data) return '';

    return JSON.stringify(data, null, 2);
  }

  /**
   * Импорт данных
   */
  import(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as APOSData;
      this.save(data);
      return true;
    } catch (error) {
      console.error('[APOS] Ошибка при импорте:', error);
      return false;
    }
  }

  /**
   * Полная очистка данных
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Получение размера данных в localStorage
   */
  getSize(): number {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  }
}

// Экспортируем единственный экземпляр
export const localStorageService = new LocalStorageService();
