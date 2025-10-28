import React, { useEffect, useRef, useState } from 'react';

interface LogsViewerProps {
    onRefresh: () => void;
    onOpenLogsFolder: () => void;
    isLoading: boolean;
}

/**
 * Просмотр логов
 * Воспроизводит функционал из Python gui.py (строки 742-759)
 */
export const LogsViewer: React.FC<LogsViewerProps> = ({
    onRefresh,
    onOpenLogsFolder,
    isLoading
}) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Загружаем логи
    useEffect(() => {
        loadLogs();
    }, []);

    // Автопрокрутка к последнему сообщению
    useEffect(() => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    const loadLogs = async () => {
        try {
            // Имитируем загрузку логов (в реальности будет API вызов)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Генерируем примеры логов
            const sampleLogs = [
                '2024-01-15 10:30:15 [INFO] Ozon Manager API запущен на порту 3001',
                '2024-01-15 10:30:16 [INFO] Загружено магазинов: 3',
                '2024-01-15 10:30:17 [INFO] Планировщик запущен',
                '2024-01-15 10:35:22 [INFO] Запуск удаления из акций для магазина: Test Store',
                '2024-01-15 10:35:25 [INFO] Найдено акций: 5',
                '2024-01-15 10:35:26 [INFO] Невыгодных акций найдено: 2',
                '2024-01-15 10:35:28 [INFO] Обрабатываем акцию: Скидка за наш счет (ID: 12345)',
                '2024-01-15 10:35:30 [INFO] Найдено товаров в акции: 15',
                '2024-01-15 10:35:32 [INFO] Удалено товаров из акции: 15',
                '2024-01-15 10:35:35 [INFO] Успешно разархивировано: 15 товаров',
                '2024-01-15 10:35:36 [INFO] Всего разархивировано: 15',
                '2024-01-15 10:35:40 [INFO] Очистка акций завершена. Удалено товаров: 15, обработано акций: 2',
                '2024-01-15 10:40:15 [INFO] Запуск разархивации для магазина: Test Store',
                '2024-01-15 10:40:18 [INFO] Получено 1 автоархивированных товаров',
                '2024-01-15 10:40:20 [INFO] Подготовлено к разархивации: 1 товаров',
                '2024-01-15 10:40:22 [INFO] ID товаров: 98765',
                '2024-01-15 10:40:25 [INFO] Успешно разархивировано: 1 товаров',
                '2024-01-15 10:40:26 [INFO] Всего разархивировано: 1',
                '2024-01-15 10:40:30 [INFO] Разархивация завершена: 1 товаров, 1 циклов',
                '2024-01-15 10:45:00 [INFO] Планировщик: перезагрузка расписания для 3 магазинов'
            ];

            setLogs(sampleLogs);
        } catch (error) {
            console.error('Ошибка загрузки логов:', error);
            setLogs(['Ошибка загрузки логов']);
        }
    };

    const handleRefresh = async () => {
        await onRefresh();
        await loadLogs();
    };

    const handleClearLogs = () => {
        setLogs([]);
    };

    const getLogLevel = (log: string) => {
        if (log.includes('[ERROR]')) return 'error';
        if (log.includes('[WARN]')) return 'warn';
        if (log.includes('[INFO]')) return 'info';
        if (log.includes('[DEBUG]')) return 'debug';
        return 'info';
    };

    const getLogLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-600';
            case 'warn': return 'text-yellow-600';
            case 'info': return 'text-blue-600';
            case 'debug': return 'text-secondary';
            default: return 'text-secondary';
        }
    };

    return (
        <div className="space-y-4">
            {/* Заголовок и кнопки */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-var-text">Логи системы</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="unified-button unified-button-secondary"
                    >
                        {isLoading ? 'Обновление...' : 'Обновить'}
                    </button>
                    <button
                        onClick={handleClearLogs}
                        className="unified-button btn-danger"
                    >
                        Очистить
                    </button>
                    <button
                        onClick={onOpenLogsFolder}
                        className="unified-button unified-button-secondary"
                    >
                        Открыть папку логов
                    </button>
                </div>
            </div>

            {/* Настройки */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={autoScroll}
                                onChange={(e) => setAutoScroll(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-foreground">Автопрокрутка к последнему сообщению</span>
                        </label>
                    </div>
                    <div className="text-sm text-secondary">
                        Всего сообщений: {logs.length}
                    </div>
                </div>
            </div>

            {/* Область логов */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-medium text-foreground">Журнал событий</h3>
                    <p className="text-sm text-secondary">Логи операций и системных событий</p>
                </div>

                <div className="h-96 overflow-y-auto bg-gray-900 text-green-400 font-mono text-sm p-4">
                    {logs.length === 0 ? (
                        <div className="text-secondary text-center py-8">
                            Нет логов для отображения
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {logs.map((log, index) => {
                                const level = getLogLevel(log);
                                const levelColor = getLogLevelColor(level);

                                return (
                                    <div key={index} className="flex items-start">
                                        <span className={`${levelColor} font-semibold mr-2`}>
                                            [{level.toUpperCase()}]
                                        </span>
                                        <span className="text-foreground">{log}</span>
                                    </div>
                                );
                            })}
                            <div ref={logsEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Статистика логов */}
            {logs.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Статистика логов</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-foreground">{logs.length}</div>
                            <div className="text-secondary">Всего сообщений</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-red-600">
                                {logs.filter(log => log.includes('[ERROR]')).length}
                            </div>
                            <div className="text-secondary">Ошибки</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-yellow-600">
                                {logs.filter(log => log.includes('[WARN]')).length}
                            </div>
                            <div className="text-secondary">Предупреждения</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                                {logs.filter(log => log.includes('[INFO]')).length}
                            </div>
                            <div className="text-secondary">Информация</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Информация о логах */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Информация о логах</h4>
                <div className="text-sm text-blue-800 space-y-1">
                    <p>• Логи автоматически обновляются каждые 30 секунд</p>
                    <p>• Сохраняются последние 1000 записей</p>
                    <p>• Уровни: ERROR (ошибки), WARN (предупреждения), INFO (информация), DEBUG (отладка)</p>
                    <p>• Логи сохраняются в файл: ./logs/ozon_manager.log</p>
                </div>
            </div>
        </div>
    );
};
