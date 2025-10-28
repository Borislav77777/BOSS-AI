/**
 * Сервис управления задачами для Anti-Procrastination OS
 */

import { v4 as uuidv4 } from 'uuid';
import type { MicroAction, Task, TimeBlock } from '../../types/anti-procrastination';

class TaskService {
  /**
   * Создание новой задачи
   */
  createTask(
    title: string,
    description?: string,
    estimatedMinutes?: number,
    priority: Task['priority'] = 'medium'
  ): Task {
    return {
      id: uuidv4(),
      title,
      description,
      estimatedMinutes: estimatedMinutes || 30,
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'todo',
      timeBlocks: [],
    };
  }

  /**
   * Создание временного блока
   */
  createTimeBlock(
    taskId: string,
    title: string,
    duration: number,
    microActions: MicroAction[]
  ): TimeBlock {
    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 60000);

    return {
      id: uuidv4(),
      taskId,
      title,
      duration,
      microActions,
      startTime: now,
      endTime,
      status: 'pending',
    };
  }

  /**
   * Создание микро-действия
   */
  createMicroAction(
    description: string,
    estimatedMinutes: number
  ): MicroAction {
    return {
      id: uuidv4(),
      description,
      estimatedMinutes,
      completed: false,
    };
  }

  /**
   * Декомпозиция задачи на микро-действия (базовая логика)
   */
  decomposeTask(task: Task, targetBlockDuration: number = 25): TimeBlock[] {
    const blocks: TimeBlock[] = [];
    const totalMinutes = task.estimatedMinutes;
    const numBlocks = Math.ceil(totalMinutes / targetBlockDuration);

    // Простая декомпозиция на равные блоки
    for (let i = 0; i < numBlocks; i++) {
      const blockDuration = Math.min(targetBlockDuration, totalMinutes - i * targetBlockDuration);

      const microActions: MicroAction[] = [
        this.createMicroAction(`Шаг ${i + 1} из ${numBlocks}: ${task.title}`, blockDuration),
      ];

      const block = this.createTimeBlock(
        task.id,
        `${task.title} - Блок ${i + 1}/${numBlocks}`,
        blockDuration,
        microActions
      );

      blocks.push(block);
    }

    return blocks;
  }

  /**
   * Обновление статуса задачи
   */
  updateTaskStatus(task: Task, status: Task['status']): Task {
    return {
      ...task,
      status,
      updatedAt: new Date(),
    };
  }

  /**
   * Добавление временного блока к задаче
   */
  addTimeBlock(task: Task, block: TimeBlock): Task {
    return {
      ...task,
      timeBlocks: [...task.timeBlocks, block],
      updatedAt: new Date(),
    };
  }

  /**
   * Отметка микро-действия как выполненного
   */
  completeMicroAction(action: MicroAction): MicroAction {
    return {
      ...action,
      completed: true,
      completedAt: new Date(),
    };
  }

  /**
   * Старт временного блока
   */
  startTimeBlock(block: TimeBlock): TimeBlock {
    return {
      ...block,
      status: 'in_progress',
      startTime: new Date(),
      endTime: new Date(Date.now() + block.duration * 60000),
    };
  }

  /**
   * Завершение временного блока
   */
  completeTimeBlock(block: TimeBlock): TimeBlock {
    const actualDuration = Math.floor(
      (new Date().getTime() - block.startTime.getTime()) / 60000
    );

    return {
      ...block,
      status: 'completed',
      actualDuration,
    };
  }

  /**
   * Пауза временного блока
   */
  pauseTimeBlock(block: TimeBlock): TimeBlock {
    return {
      ...block,
      status: 'paused',
    };
  }

  /**
   * Фильтрация задач
   */
  filterTasks(
    tasks: Task[],
    status?: Task['status'],
    priority?: Task['priority']
  ): Task[] {
    return tasks.filter(task => {
      if (status && task.status !== status) return false;
      if (priority && task.priority !== priority) return false;
      return true;
    });
  }

  /**
   * Сортировка задач по приоритету
   */
  sortByPriority(tasks: Task[]): Task[] {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...tasks].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  /**
   * Сортировка задач по дедлайну
   */
  sortByDeadline(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    });
  }

  /**
   * Подсчет прогресса задачи
   */
  calculateProgress(task: Task): number {
    if (task.timeBlocks.length === 0) return 0;

    const completed = task.timeBlocks.filter(b => b.status === 'completed').length;
    return Math.round((completed / task.timeBlocks.length) * 100);
  }
}

export const taskService = new TaskService();
