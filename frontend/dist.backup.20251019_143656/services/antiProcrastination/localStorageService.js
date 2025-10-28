/**
 * Сервис работы с LocalStorage для Anti-Procrastination OS
 * Хранение всех данных локально без авторизации
 */
const STORAGE_KEY = 'apos_data';
const VERSION = '1.0.0';
// Дефолтные настройки
const DEFAULT_SETTINGS = {
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
    init() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // Конвертация строк дат обратно в Date объекты
                return this.parseDates(data);
            }
            catch (error) {
                console.error('[APOS] Ошибка при парсинге данных:', error);
                return this.createInitialData();
            }
        }
        return this.createInitialData();
    }
    /**
     * Создание начальных данных
     */
    createInitialData() {
        const data = {
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
    save(data) {
        try {
            const toSave = {
                ...data,
                lastSync: new Date(),
                version: VERSION,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        }
        catch (error) {
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
    getData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored)
                return null;
            const data = JSON.parse(stored);
            return this.parseDates(data);
        }
        catch (error) {
            console.error('[APOS] Ошибка при получении данных:', error);
            return null;
        }
    }
    /**
     * Парсинг строковых дат в Date объекты
     */
    parseDates(data) {
        // Конвертация дат в объектах
        if (data.tasks && Array.isArray(data.tasks)) {
            data.tasks = data.tasks.map((task) => ({
                ...task,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
                deadline: task.deadline ? new Date(task.deadline) : undefined,
                timeBlocks: task.timeBlocks?.map((block) => ({
                    ...block,
                    startTime: new Date(block.startTime),
                    endTime: new Date(block.endTime),
                    microActions: block.microActions?.map((action) => ({
                        ...action,
                        startedAt: action.startedAt ? new Date(action.startedAt) : undefined,
                        completedAt: action.completedAt ? new Date(action.completedAt) : undefined,
                    })),
                })),
            }));
        }
        if (data.currentBlock) {
            const currentBlock = data.currentBlock;
            currentBlock.startTime = new Date(currentBlock.startTime);
            currentBlock.endTime = new Date(currentBlock.endTime);
        }
        if (data.completedBlocks && Array.isArray(data.completedBlocks)) {
            data.completedBlocks = data.completedBlocks.map((block) => ({
                ...block,
                startTime: new Date(block.startTime),
                endTime: new Date(block.endTime),
            }));
        }
        if (data.lastSync) {
            data.lastSync = new Date(data.lastSync);
        }
        return data;
    }
    /**
     * Очистка старых данных
     */
    cleanup(data) {
        console.log('[APOS] Очистка старых данных...');
        // Удаляем статистику старше 30 дней
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        data.dailyStats = data.dailyStats.filter(stat => new Date(stat.date) > thirtyDaysAgo);
        // Удаляем завершенные блоки старше 7 дней
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        data.completedBlocks = data.completedBlocks.filter(block => new Date(block.endTime) > sevenDaysAgo);
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
    export() {
        const data = this.getData();
        if (!data)
            return '';
        return JSON.stringify(data, null, 2);
    }
    /**
     * Импорт данных
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.save(data);
            return true;
        }
        catch (error) {
            console.error('[APOS] Ошибка при импорте:', error);
            return false;
        }
    }
    /**
     * Полная очистка данных
     */
    clear() {
        localStorage.removeItem(STORAGE_KEY);
    }
    /**
     * Получение размера данных в localStorage
     */
    getSize() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? new Blob([data]).size : 0;
    }
}
// Экспортируем единственный экземпляр
export const localStorageService = new LocalStorageService();
//# sourceMappingURL=localStorageService.js.map