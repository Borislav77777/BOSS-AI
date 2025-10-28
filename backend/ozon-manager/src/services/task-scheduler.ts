import * as cron from 'node-cron';
import { StoreConfig } from '../types';
import { Logger } from '../utils/logger';
import { ArchiveManager } from './archive-manager';
import { PromotionsManager } from './promotions-manager';

/**
 * Планировщик задач для автоматического выполнения операций
 * Портировано из Python scheduler.py
 */
export class TaskScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private logger: Logger;
  private isRunning: boolean = false;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger();
  }

  /**
   * Запускает планировщик
   */
  start(): void {
    if (this.isRunning) {
      this.logger.logWarning('Планировщик уже запущен');
      return;
    }

    this.isRunning = true;
    this.logger.logInfo('Планировщик запущен');
  }

  /**
   * Останавливает планировщик
   */
  stop(): void {
    if (!this.isRunning) {
      this.logger.logWarning('Планировщик не запущен');
      return;
    }

    // Останавливаем все задачи
    for (const [taskId, task] of this.tasks.entries()) {
      task.stop();
      this.logger.logInfo(`Остановлена задача: ${taskId}`);
    }

    this.tasks.clear();
    this.isRunning = false;
    this.logger.logInfo('Планировщик остановлен');
  }

  /**
   * Перезагружает расписание для магазина
   */
  reloadStoreSchedule(store: StoreConfig): void {
    const taskId = `store_${store.name}`;

    // Удаляем существующую задачу
    if (this.tasks.has(taskId)) {
      this.tasks.get(taskId)!.stop();
      this.tasks.delete(taskId);
    }

    // Создаем новые задачи если включены
    if (store.remove_from_promotions && store.schedule_times.remove) {
      this.schedulePromotionCleanup(store);
    }

    if (store.unarchive_enabled && store.schedule_times.unarchive) {
      this.scheduleUnarchive(store);
    }

    this.logger.logInfo(`Расписание перезагружено для магазина: ${store.name}`);
  }

  /**
   * Планирует задачу удаления из акций
   */
  private schedulePromotionCleanup(store: StoreConfig): void {
    const taskId = `promotions_${store.name}`;
    const scheduleTime = store.schedule_times.remove;

    try {
      const cronExpression = this.parseTimeToCron(scheduleTime);
      const task = cron.schedule(cronExpression, async () => {
        this.logger.logInfo(`Запуск удаления из акций для магазина: ${store.name}`);

        try {
          const promotionsManager = new PromotionsManager(store, this.logger);
          const result = await promotionsManager.runPromotionCleanup();

          if (result.success) {
            this.logger.logInfo(`Удаление из акций завершено успешно: ${result.products_removed} товаров, ${result.actions_processed} акций`);
          } else {
            this.logger.logError(`Ошибка удаления из акций: ${result.errors.join(', ')}`);
          }
        } catch (error: any) {
          this.logger.logError(`Критическая ошибка при удалении из акций: ${error.message}`, error);
        }
      }, {
        scheduled: false,
        timezone: process.env.SCHEDULER_TIMEZONE || 'Europe/Moscow'
      });

      this.tasks.set(taskId, task);
      task.start();

      this.logger.logInfo(`Запланировано удаление из акций для ${store.name} в ${scheduleTime}`);
    } catch (error: any) {
      this.logger.logError(`Ошибка планирования удаления из акций: ${error.message}`, error);
    }
  }

  /**
   * Планирует задачу разархивации
   */
  private scheduleUnarchive(store: StoreConfig): void {
    const taskId = `unarchive_${store.name}`;
    const scheduleTime = store.schedule_times.unarchive;

    try {
      const cronExpression = this.parseTimeToCron(scheduleTime);
      const task = cron.schedule(cronExpression, async () => {
        this.logger.logInfo(`Запуск разархивации для магазина: ${store.name}`);

        try {
          const archiveManager = new ArchiveManager(store, this.logger);
          const result = await archiveManager.runSimpleUnarchiveProcess();

          if (result.success) {
            this.logger.logInfo(`Разархивация завершена: ${result.total_unarchived} товаров, ${result.cycles_completed} циклов`);
          } else {
            this.logger.logError(`Ошибка разархивации: ${result.message}`);
          }
        } catch (error: any) {
          this.logger.logError(`Критическая ошибка при разархивации: ${error.message}`, error);
        }
      }, {
        scheduled: false,
        timezone: process.env.SCHEDULER_TIMEZONE || 'Europe/Moscow'
      });

      this.tasks.set(taskId, task);
      task.start();

      this.logger.logInfo(`Запланирована разархивация для ${store.name} в ${scheduleTime}`);
    } catch (error: any) {
      this.logger.logError(`Ошибка планирования разархивации: ${error.message}`, error);
    }
  }

  /**
   * Парсит время в cron выражение
   */
  private parseTimeToCron(time: string): string {
    // Формат времени: "HH:MM" (например, "09:00")
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Неверный формат времени: ${time}. Ожидается HH:MM`);
    }

    // Cron: минуты часы день месяц день_недели
    return `${minutes} ${hours} * * *`;
  }

  /**
   * Получает статус планировщика
   */
  getStatus(): { isRunning: boolean; tasksCount: number; tasks: string[] } {
    return {
      isRunning: this.isRunning,
      tasksCount: this.tasks.size,
      tasks: Array.from(this.tasks.keys())
    };
  }

  /**
   * Получает следующее время выполнения задачи
   */
  getNextExecutionTime(taskId: string): Date | null {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    // Для node-cron нет прямого способа получить следующее время выполнения
    // Возвращаем null, так как это сложно реализовать без дополнительных библиотек
    return null;
  }
}
