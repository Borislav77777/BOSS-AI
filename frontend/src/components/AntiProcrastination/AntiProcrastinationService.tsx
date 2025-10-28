/**
 * Anti-Procrastination OS - Главный компонент
 * Система борьбы с прокрастинацией через микро-действия
 */

import React, { useCallback, useEffect, useState } from 'react';
import { localStorageService } from '../../services/antiProcrastination/localStorageService';
import { notificationService } from '../../services/antiProcrastination/notificationService';
import { taskService } from '../../services/antiProcrastination/taskService';
import type { APOSData, Task, TimeBlock } from '../../types/anti-procrastination';
import './AntiProcrastinationService.css';

export const AntiProcrastinationService: React.FC = () => {
    const [data, setData] = useState<APOSData | null>(null);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [currentBlock, setCurrentBlock] = useState<TimeBlock | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Завершить блок
    const handleBlockComplete = useCallback(() => {
        if (!currentBlock || !currentTask || !data) return;

        const completedBlock = taskService.completeTimeBlock(currentBlock);

        // Обновляем задачу
        const updatedTask = {
            ...currentTask,
            timeBlocks: currentTask.timeBlocks.map(b =>
                b.id === currentBlock.id ? completedBlock : b
            ),
        };

        setData({
            ...data,
            tasks: data.tasks.map(t => t.id === currentTask.id ? updatedTask : t),
            completedBlocks: [...data.completedBlocks, completedBlock],
        });

        notificationService.notifyBlockComplete(
            completedBlock.title,
            completedBlock.actualDuration
        );

        // Перерыв
        notificationService.notifyBreak(5);

        setTimeout(() => {
            startNextBlock(updatedTask);
        }, 5000);
    }, [currentBlock, currentTask, data]);

    // Инициализация
    useEffect(() => {
        const initialData = localStorageService.init();
        setData(initialData);
        setCurrentBlock(initialData.currentBlock);
    }, []);

    // Таймер
    useEffect(() => {
        if (!currentBlock || currentBlock.status !== 'in_progress') return;

        const interval = setInterval(() => {
            const now = Date.now();
            const end = currentBlock.endTime.getTime();
            const left = Math.max(0, Math.floor((end - now) / 1000));

            setTimeLeft(left);

            if (left === 0) {
                handleBlockComplete();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentBlock, handleBlockComplete]);

    // Сохранение при изменениях
    useEffect(() => {
        if (data) {
            localStorageService.save({
                ...data,
                currentBlock,
            });
        }
    }, [data, currentBlock]);

    // Создание новой задачи
    const handleCreateTask = () => {
        if (!newTaskTitle.trim() || !data) return;

        const task = taskService.createTask(newTaskTitle);
        setData({
            ...data,
            tasks: [...data.tasks, task],
        });
        setNewTaskTitle('');
        notificationService.showToast('Задача создана!', 'success');
    };

    // Начать задачу
    const handleStartTask = (task: Task) => {
        setCurrentTask(task);

        // Создаем блоки если их нет
        if (task.timeBlocks.length === 0) {
            const blocks = taskService.decomposeTask(task, 25);
            const updatedTask = { ...task, timeBlocks: blocks };

            if (data) {
                setData({
                    ...data,
                    tasks: data.tasks.map(t => t.id === task.id ? updatedTask : t),
                });
            }

            setCurrentTask(updatedTask);
        }

        // Начинаем первый блок
        startNextBlock(task);
    };

    // Начать следующий блок
    const startNextBlock = (task: Task) => {
        const nextBlock = task.timeBlocks.find(b => b.status === 'pending');

        if (!nextBlock) {
            notificationService.showToast('Все блоки завершены!', 'success');
            return;
        }

        const startedBlock = taskService.startTimeBlock(nextBlock);
        setCurrentBlock(startedBlock);
        setTimeLeft(startedBlock.duration * 60);

        notificationService.notifyBlockStart(startedBlock.title, startedBlock.duration);
    };

    // Форматирование времени
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Подсказка для задачи
    const handleHelp = () => {
        notificationService.showToast(
            'Разбейте задачу на маленькие шаги по 5-15 минут каждый',
            'info',
            5000
        );
    };

    if (!data) {
        return <div className="apos-loading">Загрузка...</div>;
    }

    return (
        <div className="apos-container">
            {/* Заголовок */}
            <div className="apos-header">
                <h1>⚡ Anti-Procrastination OS</h1>
                <p>Система борьбы с прокрастинацией через микро-действия</p>
            </div>

            {/* Текущий блок */}
            {currentBlock && currentBlock.status === 'in_progress' && (
                <div className="apos-current-block">
                    <h2>🎯 Текущий блок</h2>
                    <h3>{currentBlock.title}</h3>
                    <div className="apos-timer">
                        <div className="apos-time">{formatTime(timeLeft)}</div>
                        <div className="apos-progress">
                            <div
                                className={`apos-progress-bar progress-${Math.round(((currentBlock.duration * 60 - timeLeft) / (currentBlock.duration * 60)) * 100)}`}
                            />
                        </div>
                    </div>

                    <div className="apos-micro-actions">
                        <h4>📋 Микро-действия:</h4>
                        {currentBlock.microActions.map((action) => (
                            <div key={action.id} className={`apos-action ${action.completed ? 'completed' : ''}`}>
                                <input
                                    type="checkbox"
                                    id={`action-${action.id}`}
                                    checked={action.completed}
                                    onChange={() => {
                                        // Обновить статус действия
                                    }}
                                />
                                <label htmlFor={`action-${action.id}`} className="sr-only">
                                    {action.description}
                                </label>
                                <span>{action.description}</span>
                                <span className="apos-duration">{action.estimatedMinutes} мин</span>
                            </div>
                        ))}
                    </div>

                    <div className="apos-block-controls">
                        <button onClick={handleBlockComplete} className="apos-btn-complete">
                            ✅ Завершить блок
                        </button>
                    </div>
                </div>
            )}

            {/* Создание новой задачи */}
            <div className="apos-create-task">
                <h2>➕ Новая задача</h2>
                <div className="apos-input-group">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Что нужно сделать?"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                    />
                    <button onClick={handleCreateTask}>Создать</button>
                </div>
            </div>

            {/* Список задач */}
            <div className="apos-tasks">
                <h2>📝 Задачи</h2>
                {data.tasks.filter(t => t.status !== 'completed').map((task) => (
                    <div key={task.id} className={`apos-task apos-task-${task.priority}`}>
                        <div className="apos-task-header">
                            <h3>{task.title}</h3>
                            <span className="apos-priority">{task.priority}</span>
                        </div>

                        {task.description && (
                            <p className="apos-description">{task.description}</p>
                        )}

                        <div className="apos-task-meta">
                            <span>⏱️ {task.estimatedMinutes} мин</span>
                            <span>📊 {taskService.calculateProgress(task)}%</span>
                        </div>

                        <div className="apos-task-controls">
                            <button
                                onClick={() => handleStartTask(task)}
                                className="apos-btn-start"
                            >
                                ▶️ Начать
                            </button>
                            <button
                                onClick={handleHelp}
                                className="apos-btn-help"
                            >
                                🆘 Помощь
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Статистика */}
            <div className="apos-stats">
                <h2>📊 Статистика</h2>
                <div className="apos-stats-grid">
                    <div className="apos-stat">
                        <span className="apos-stat-value">{data.completedBlocks.length}</span>
                        <span className="apos-stat-label">Блоков завершено</span>
                    </div>
                    <div className="apos-stat">
                        <span className="apos-stat-value">
                            {data.tasks.filter(t => t.status === 'completed').length}
                        </span>
                        <span className="apos-stat-label">Задач выполнено</span>
                    </div>
                    <div className="apos-stat">
                        <span className="apos-stat-value">
                            {Math.floor(data.completedBlocks.reduce((acc, b) => acc + b.duration, 0) / 60)}
                        </span>
                        <span className="apos-stat-label">Часов в фокусе</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AntiProcrastinationService;
