import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
/**
 * Просмотр логов
 * Воспроизводит функционал из Python gui.py (строки 742-759)
 */
export const LogsViewer = ({ onRefresh, onOpenLogsFolder, isLoading }) => {
    const [logs, setLogs] = useState([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const logsEndRef = useRef(null);
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
        }
        catch (error) {
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
    const getLogLevel = (log) => {
        if (log.includes('[ERROR]'))
            return 'error';
        if (log.includes('[WARN]'))
            return 'warn';
        if (log.includes('[INFO]'))
            return 'info';
        if (log.includes('[DEBUG]'))
            return 'debug';
        return 'info';
    };
    const getLogLevelColor = (level) => {
        switch (level) {
            case 'error': return 'text-red-600';
            case 'warn': return 'text-yellow-600';
            case 'info': return 'text-blue-600';
            case 'debug': return 'text-secondary';
            default: return 'text-secondary';
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold text-var-text", children: "\u041B\u043E\u0433\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u044B" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: handleRefresh, disabled: isLoading, className: "unified-button unified-button-secondary", children: isLoading ? 'Обновление...' : 'Обновить' }), _jsx("button", { onClick: handleClearLogs, className: "unified-button btn-danger", children: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C" }), _jsx("button", { onClick: onOpenLogsFolder, className: "unified-button unified-button-secondary", children: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0430\u043F\u043A\u0443 \u043B\u043E\u0433\u043E\u0432" })] })] }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: autoScroll, onChange: (e) => setAutoScroll(e.target.checked), className: "mr-2" }), _jsx("span", { className: "text-sm text-foreground", children: "\u0410\u0432\u0442\u043E\u043F\u0440\u043E\u043A\u0440\u0443\u0442\u043A\u0430 \u043A \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u043C\u0443 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044E" })] }) }), _jsxs("div", { className: "text-sm text-secondary", children: ["\u0412\u0441\u0435\u0433\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439: ", logs.length] })] }) }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsxs("div", { className: "p-4 border-b", children: [_jsx("h3", { className: "text-lg font-medium text-foreground", children: "\u0416\u0443\u0440\u043D\u0430\u043B \u0441\u043E\u0431\u044B\u0442\u0438\u0439" }), _jsx("p", { className: "text-sm text-secondary", children: "\u041B\u043E\u0433\u0438 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u043D\u044B\u0445 \u0441\u043E\u0431\u044B\u0442\u0438\u0439" })] }), _jsx("div", { className: "h-96 overflow-y-auto bg-gray-900 text-green-400 font-mono text-sm p-4", children: logs.length === 0 ? (_jsx("div", { className: "text-secondary text-center py-8", children: "\u041D\u0435\u0442 \u043B\u043E\u0433\u043E\u0432 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F" })) : (_jsxs("div", { className: "space-y-1", children: [logs.map((log, index) => {
                                    const level = getLogLevel(log);
                                    const levelColor = getLogLevelColor(level);
                                    return (_jsxs("div", { className: "flex items-start", children: [_jsxs("span", { className: `${levelColor} font-semibold mr-2`, children: ["[", level.toUpperCase(), "]"] }), _jsx("span", { className: "text-foreground", children: log })] }, index));
                                }), _jsx("div", { ref: logsEndRef })] })) })] }), logs.length > 0 && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-foreground mb-2", children: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u043B\u043E\u0433\u043E\u0432" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-foreground", children: logs.length }), _jsx("div", { className: "text-secondary", children: "\u0412\u0441\u0435\u0433\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-red-600", children: logs.filter(log => log.includes('[ERROR]')).length }), _jsx("div", { className: "text-secondary", children: "\u041E\u0448\u0438\u0431\u043A\u0438" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-yellow-600", children: logs.filter(log => log.includes('[WARN]')).length }), _jsx("div", { className: "text-secondary", children: "\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-blue-600", children: logs.filter(log => log.includes('[INFO]')).length }), _jsx("div", { className: "text-secondary", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F" })] })] })] })), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-blue-900 mb-2", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u043B\u043E\u0433\u0430\u0445" }), _jsxs("div", { className: "text-sm text-blue-800 space-y-1", children: [_jsx("p", { children: "\u2022 \u041B\u043E\u0433\u0438 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043A\u0430\u0436\u0434\u044B\u0435 30 \u0441\u0435\u043A\u0443\u043D\u0434" }), _jsx("p", { children: "\u2022 \u0421\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 1000 \u0437\u0430\u043F\u0438\u0441\u0435\u0439" }), _jsx("p", { children: "\u2022 \u0423\u0440\u043E\u0432\u043D\u0438: ERROR (\u043E\u0448\u0438\u0431\u043A\u0438), WARN (\u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F), INFO (\u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F), DEBUG (\u043E\u0442\u043B\u0430\u0434\u043A\u0430)" }), _jsx("p", { children: "\u2022 \u041B\u043E\u0433\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0432 \u0444\u0430\u0439\u043B: ./logs/ozon_manager.log" })] })] })] }));
};
//# sourceMappingURL=LogsViewer.js.map