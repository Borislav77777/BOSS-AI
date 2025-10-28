/**
 * Модуль для работы с localStorage акцентных цветов
 */
import { AccentColorState } from './AccentColorState';
export declare class AccentColorStorage {
    private static readonly STORAGE_KEYS;
    /**
     * Загрузка состояния из localStorage
     */
    static loadState(): Partial<AccentColorState>;
    /**
     * Сохранение состояния в localStorage
     */
    static saveState(state: AccentColorState): void;
}
//# sourceMappingURL=AccentColorStorage.d.ts.map