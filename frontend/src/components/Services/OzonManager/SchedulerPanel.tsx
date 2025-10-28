import React, { useEffect, useState } from 'react';
import { SchedulerStatus } from './types';

interface SchedulerPanelProps {
    onReloadSchedule: () => void;
    isLoading: boolean;
}

/**
 * Панель управления планировщиком
 * Воспроизводит функционал из Python gui.py (строки 709-718)
 */
export const SchedulerPanel: React.FC<SchedulerPanelProps> = ({
    onReloadSchedule,
    isLoading
}) => {
    const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus>({
        isRunning: false,
        tasksCount: 0,
        tasks: []
    });

    const [nextExecution, setNextExecution] = useState<string | null>(null);

    // Загружаем статус планировщика
    useEffect(() => {
        loadSchedulerStatus();
    }, []);

    const loadSchedulerStatus = async () => {
        try {
            // Имитируем загрузку статуса (в реальности будет API вызов)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Случайные данные для демонстрации
            setSchedulerStatus({
                isRunning: Math.random() > 0.5,
                tasksCount: Math.floor(Math.random() * 5),
                tasks: ['store1_promotions', 'store1_unarchive', 'store2_promotions']
            });

            // Случайное время следующего выполнения
            const now = new Date();
            const nextTime = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000);
            setNextExecution(nextTime.toLocaleString('ru-RU'));
        } catch (error) {
            console.error('Ошибка загрузки статуса планировщика:', error);
        }
    };

    const handleReloadSchedule = async () => {
        await onReloadSchedule();
        await loadSchedulerStatus();
    };

    return (
        <div className="space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-var-text">Планировщик задач</h2>
                <button
                    onClick={handleReloadSchedule}
                    disabled={isLoading}
                    className="unified-button unified-button-primary"
                >
                    {isLoading ? 'Перезагрузка...' : 'Перезагрузить расписание'}
                </button>
            </div>

            {/* Статус планировщика */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Статус планировщика</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Общий статус */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Статус:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${schedulerStatus.isRunning
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {schedulerStatus.isRunning ? 'Запущен' : 'Остановлен'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Активных задач:</span>
                            <span className="text-sm text-foreground">{schedulerStatus.tasksCount}</span>
                        </div>

                        {nextExecution && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">Следующее выполнение:</span>
                                <span className="text-sm text-foreground">{nextExecution}</span>
                            </div>
                        )}
                    </div>

                    {/* Список задач */}
                    <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Активные задачи:</h4>
                        {schedulerStatus.tasks.length === 0 ? (
                            <p className="text-sm text-secondary">Нет активных задач</p>
                        ) : (
                            <div className="space-y-2">
                                {schedulerStatus.tasks.map((task, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-sm text-foreground">{task}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Информация о планировщике */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Информация о планировщике</h4>
                <div className="text-sm text-blue-800 space-y-1">
                    <p>• Планировщик автоматически выполняет операции по расписанию</p>
                    <p>• Время выполнения настраивается для каждого магазина отдельно</p>
                    <p>• Операции выполняются в фоновом режиме</p>
                    <p>• Логи операций сохраняются в системе</p>
                </div>
            </div>

            {/* Управление */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4 text-var-text">Управление</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-var-text">Перезагрузка расписания</h4>
                            <p className="text-sm text-var-text-muted">
                                Перезагружает расписание для всех магазинов
                            </p>
                        </div>
                        <button
                            onClick={handleReloadSchedule}
                            disabled={isLoading}
                            className="unified-button unified-button-primary"
                        >
                            {isLoading ? 'Перезагрузка...' : 'Перезагрузить'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-var-text">Обновить статус</h4>
                            <p className="text-sm text-var-text-muted">
                                Обновляет информацию о состоянии планировщика
                            </p>
                        </div>
                        <button
                            onClick={loadSchedulerStatus}
                            className="unified-button unified-button-secondary"
                        >
                            Обновить
                        </button>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2 text-foreground">Статистика</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">{schedulerStatus.tasksCount}</div>
                        <div className="text-secondary">Активных задач</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">
                            {schedulerStatus.isRunning ? 'Да' : 'Нет'}
                        </div>
                        <div className="text-secondary">Планировщик</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">24/7</div>
                        <div className="text-secondary">Режим работы</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">Авто</div>
                        <div className="text-secondary">Управление</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
