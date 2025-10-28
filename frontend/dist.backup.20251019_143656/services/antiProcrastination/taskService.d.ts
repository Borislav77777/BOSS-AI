/**
 * Сервис управления задачами для Anti-Procrastination OS
 */
import type { MicroAction, Task, TimeBlock } from '../../types/anti-procrastination';
declare class TaskService {
    /**
     * Создание новой задачи
     */
    createTask(title: string, description?: string, estimatedMinutes?: number, priority?: Task['priority']): Task;
    /**
     * Создание временного блока
     */
    createTimeBlock(taskId: string, title: string, duration: number, microActions: MicroAction[]): TimeBlock;
    /**
     * Создание микро-действия
     */
    createMicroAction(description: string, estimatedMinutes: number): MicroAction;
    /**
     * Декомпозиция задачи на микро-действия (базовая логика)
     */
    decomposeTask(task: Task, targetBlockDuration?: number): TimeBlock[];
    /**
     * Обновление статуса задачи
     */
    updateTaskStatus(task: Task, status: Task['status']): Task;
    /**
     * Добавление временного блока к задаче
     */
    addTimeBlock(task: Task, block: TimeBlock): Task;
    /**
     * Отметка микро-действия как выполненного
     */
    completeMicroAction(action: MicroAction): MicroAction;
    /**
     * Старт временного блока
     */
    startTimeBlock(block: TimeBlock): TimeBlock;
    /**
     * Завершение временного блока
     */
    completeTimeBlock(block: TimeBlock): TimeBlock;
    /**
     * Пауза временного блока
     */
    pauseTimeBlock(block: TimeBlock): TimeBlock;
    /**
     * Фильтрация задач
     */
    filterTasks(tasks: Task[], status?: Task['status'], priority?: Task['priority']): Task[];
    /**
     * Сортировка задач по приоритету
     */
    sortByPriority(tasks: Task[]): Task[];
    /**
     * Сортировка задач по дедлайну
     */
    sortByDeadline(tasks: Task[]): Task[];
    /**
     * Подсчет прогресса задачи
     */
    calculateProgress(task: Task): number;
}
export declare const taskService: TaskService;
export {};
//# sourceMappingURL=taskService.d.ts.map