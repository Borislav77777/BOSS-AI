/**
 * Сервис управления задачами для Anti-Procrastination OS
 */
import { v4 as uuidv4 } from 'uuid';
class TaskService {
    /**
     * Создание новой задачи
     */
    createTask(title, description, estimatedMinutes, priority = 'medium') {
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
    createTimeBlock(taskId, title, duration, microActions) {
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
    createMicroAction(description, estimatedMinutes) {
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
    decomposeTask(task, targetBlockDuration = 25) {
        const blocks = [];
        const totalMinutes = task.estimatedMinutes;
        const numBlocks = Math.ceil(totalMinutes / targetBlockDuration);
        // Простая декомпозиция на равные блоки
        for (let i = 0; i < numBlocks; i++) {
            const blockDuration = Math.min(targetBlockDuration, totalMinutes - i * targetBlockDuration);
            const microActions = [
                this.createMicroAction(`Шаг ${i + 1} из ${numBlocks}: ${task.title}`, blockDuration),
            ];
            const block = this.createTimeBlock(task.id, `${task.title} - Блок ${i + 1}/${numBlocks}`, blockDuration, microActions);
            blocks.push(block);
        }
        return blocks;
    }
    /**
     * Обновление статуса задачи
     */
    updateTaskStatus(task, status) {
        return {
            ...task,
            status,
            updatedAt: new Date(),
        };
    }
    /**
     * Добавление временного блока к задаче
     */
    addTimeBlock(task, block) {
        return {
            ...task,
            timeBlocks: [...task.timeBlocks, block],
            updatedAt: new Date(),
        };
    }
    /**
     * Отметка микро-действия как выполненного
     */
    completeMicroAction(action) {
        return {
            ...action,
            completed: true,
            completedAt: new Date(),
        };
    }
    /**
     * Старт временного блока
     */
    startTimeBlock(block) {
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
    completeTimeBlock(block) {
        const actualDuration = Math.floor((new Date().getTime() - block.startTime.getTime()) / 60000);
        return {
            ...block,
            status: 'completed',
            actualDuration,
        };
    }
    /**
     * Пауза временного блока
     */
    pauseTimeBlock(block) {
        return {
            ...block,
            status: 'paused',
        };
    }
    /**
     * Фильтрация задач
     */
    filterTasks(tasks, status, priority) {
        return tasks.filter(task => {
            if (status && task.status !== status)
                return false;
            if (priority && task.priority !== priority)
                return false;
            return true;
        });
    }
    /**
     * Сортировка задач по приоритету
     */
    sortByPriority(tasks) {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    /**
     * Сортировка задач по дедлайну
     */
    sortByDeadline(tasks) {
        return [...tasks].sort((a, b) => {
            if (!a.deadline)
                return 1;
            if (!b.deadline)
                return -1;
            return a.deadline.getTime() - b.deadline.getTime();
        });
    }
    /**
     * Подсчет прогресса задачи
     */
    calculateProgress(task) {
        if (task.timeBlocks.length === 0)
            return 0;
        const completed = task.timeBlocks.filter(b => b.status === 'completed').length;
        return Math.round((completed / task.timeBlocks.length) * 100);
    }
}
export const taskService = new TaskService();
//# sourceMappingURL=taskService.js.map