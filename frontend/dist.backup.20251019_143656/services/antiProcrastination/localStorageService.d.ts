/**
 * Сервис работы с LocalStorage для Anti-Procrastination OS
 * Хранение всех данных локально без авторизации
 */
import type { APOSData } from '../../types/anti-procrastination';
declare class LocalStorageService {
    /**
     * Инициализация хранилища
     */
    init(): APOSData;
    /**
     * Создание начальных данных
     */
    private createInitialData;
    /**
     * Сохранение данных
     */
    save(data: APOSData): void;
    /**
     * Получение всех данных
     */
    getData(): APOSData | null;
    /**
     * Парсинг строковых дат в Date объекты
     */
    private parseDates;
    /**
     * Очистка старых данных
     */
    private cleanup;
    /**
     * Экспорт данных
     */
    export(): string;
    /**
     * Импорт данных
     */
    import(jsonString: string): boolean;
    /**
     * Полная очистка данных
     */
    clear(): void;
    /**
     * Получение размера данных в localStorage
     */
    getSize(): number;
}
export declare const localStorageService: LocalStorageService;
export {};
//# sourceMappingURL=localStorageService.d.ts.map