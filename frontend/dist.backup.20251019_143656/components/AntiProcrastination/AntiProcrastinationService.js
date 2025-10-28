import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Anti-Procrastination OS - Главный компонент
 * Система борьбы с прокрастинацией через микро-действия
 */
import React, { useCallback, useEffect, useState } from 'react';
import { localStorageService } from '../../services/antiProcrastination/localStorageService';
import { notificationService } from '../../services/antiProcrastination/notificationService';
import { taskService } from '../../services/antiProcrastination/taskService';
import './AntiProcrastinationService.css';
export const AntiProcrastinationService = () => {
    const [data, setData] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [currentBlock, setCurrentBlock] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    // Завершить блок
    const handleBlockComplete = useCallback(() => {
        if (!currentBlock || !currentTask || !data)
            return;
        const completedBlock = taskService.completeTimeBlock(currentBlock);
        // Обновляем задачу
        const updatedTask = {
            ...currentTask,
            timeBlocks: currentTask.timeBlocks.map(b => b.id === currentBlock.id ? completedBlock : b),
        };
        setData({
            ...data,
            tasks: data.tasks.map(t => t.id === currentTask.id ? updatedTask : t),
            completedBlocks: [...data.completedBlocks, completedBlock],
        });
        notificationService.notifyBlockComplete(completedBlock.title, completedBlock.actualDuration);
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
        if (!currentBlock || currentBlock.status !== 'in_progress')
            return;
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
        if (!newTaskTitle.trim() || !data)
            return;
        const task = taskService.createTask(newTaskTitle);
        setData({
            ...data,
            tasks: [...data.tasks, task],
        });
        setNewTaskTitle('');
        notificationService.showToast('Задача создана!', 'success');
    };
    // Начать задачу
    const handleStartTask = (task) => {
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
    const startNextBlock = (task) => {
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
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    // Подсказка для задачи
    const handleHelp = () => {
        notificationService.showToast('Разбейте задачу на маленькие шаги по 5-15 минут каждый', 'info', 5000);
    };
    if (!data) {
        return _jsx("div", { className: "apos-loading", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." });
    }
    return (_jsxs("div", { className: "apos-container", children: [_jsxs("div", { className: "apos-header", children: [_jsx("h1", { children: "\u26A1 Anti-Procrastination OS" }), _jsx("p", { children: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0431\u043E\u0440\u044C\u0431\u044B \u0441 \u043F\u0440\u043E\u043A\u0440\u0430\u0441\u0442\u0438\u043D\u0430\u0446\u0438\u0435\u0439 \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043A\u0440\u043E-\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }), currentBlock && currentBlock.status === 'in_progress' && (_jsxs("div", { className: "apos-current-block", children: [_jsx("h2", { children: "\uD83C\uDFAF \u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0431\u043B\u043E\u043A" }), _jsx("h3", { children: currentBlock.title }), _jsxs("div", { className: "apos-timer", children: [_jsx("div", { className: "apos-time", children: formatTime(timeLeft) }), _jsx("div", { className: "apos-progress", children: _jsx("div", { className: `apos-progress-bar progress-${Math.round(((currentBlock.duration * 60 - timeLeft) / (currentBlock.duration * 60)) * 100)}` }) })] }), _jsxs("div", { className: "apos-micro-actions", children: [_jsx("h4", { children: "\uD83D\uDCCB \u041C\u0438\u043A\u0440\u043E-\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F:" }), currentBlock.microActions.map((action) => (_jsxs("div", { className: `apos-action ${action.completed ? 'completed' : ''}`, children: [_jsx("input", { type: "checkbox", id: `action-${action.id}`, checked: action.completed, onChange: () => {
                                            // Обновить статус действия
                                        } }), _jsx("label", { htmlFor: `action-${action.id}`, className: "sr-only", children: action.description }), _jsx("span", { children: action.description }), _jsxs("span", { className: "apos-duration", children: [action.estimatedMinutes, " \u043C\u0438\u043D"] })] }, action.id)))] }), _jsx("div", { className: "apos-block-controls", children: _jsx("button", { onClick: handleBlockComplete, className: "apos-btn-complete", children: "\u2705 \u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0431\u043B\u043E\u043A" }) })] })), _jsxs("div", { className: "apos-create-task", children: [_jsx("h2", { children: "\u2795 \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u0434\u0430\u0447\u0430" }), _jsxs("div", { className: "apos-input-group", children: [_jsx("input", { type: "text", value: newTaskTitle, onChange: (e) => setNewTaskTitle(e.target.value), placeholder: "\u0427\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C?", onKeyPress: (e) => e.key === 'Enter' && handleCreateTask() }), _jsx("button", { onClick: handleCreateTask, children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C" })] })] }), _jsxs("div", { className: "apos-tasks", children: [_jsx("h2", { children: "\uD83D\uDCDD \u0417\u0430\u0434\u0430\u0447\u0438" }), data.tasks.filter(t => t.status !== 'completed').map((task) => (_jsxs("div", { className: `apos-task apos-task-${task.priority}`, children: [_jsxs("div", { className: "apos-task-header", children: [_jsx("h3", { children: task.title }), _jsx("span", { className: "apos-priority", children: task.priority })] }), task.description && (_jsx("p", { className: "apos-description", children: task.description })), _jsxs("div", { className: "apos-task-meta", children: [_jsxs("span", { children: ["\u23F1\uFE0F ", task.estimatedMinutes, " \u043C\u0438\u043D"] }), _jsxs("span", { children: ["\uD83D\uDCCA ", taskService.calculateProgress(task), "%"] })] }), _jsxs("div", { className: "apos-task-controls", children: [_jsx("button", { onClick: () => handleStartTask(task), className: "apos-btn-start", children: "\u25B6\uFE0F \u041D\u0430\u0447\u0430\u0442\u044C" }), _jsx("button", { onClick: handleHelp, className: "apos-btn-help", children: "\uD83C\uDD98 \u041F\u043E\u043C\u043E\u0449\u044C" })] })] }, task.id)))] }), _jsxs("div", { className: "apos-stats", children: [_jsx("h2", { children: "\uD83D\uDCCA \u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430" }), _jsxs("div", { className: "apos-stats-grid", children: [_jsxs("div", { className: "apos-stat", children: [_jsx("span", { className: "apos-stat-value", children: data.completedBlocks.length }), _jsx("span", { className: "apos-stat-label", children: "\u0411\u043B\u043E\u043A\u043E\u0432 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E" })] }), _jsxs("div", { className: "apos-stat", children: [_jsx("span", { className: "apos-stat-value", children: data.tasks.filter(t => t.status === 'completed').length }), _jsx("span", { className: "apos-stat-label", children: "\u0417\u0430\u0434\u0430\u0447 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E" })] }), _jsxs("div", { className: "apos-stat", children: [_jsx("span", { className: "apos-stat-value", children: Math.floor(data.completedBlocks.reduce((acc, b) => acc + b.duration, 0) / 60) }), _jsx("span", { className: "apos-stat-label", children: "\u0427\u0430\u0441\u043E\u0432 \u0432 \u0444\u043E\u043A\u0443\u0441\u0435" })] })] })] })] }));
};
export default AntiProcrastinationService;
//# sourceMappingURL=AntiProcrastinationService.js.map