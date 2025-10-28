/**
 * Сервис для управления акцентными цветами из радужной полоски
 * Динамически меняет акцентные цвета интерфейса на основе цветов полоски
 */
export interface AccentColorSet {
    primary: string;
    secondary: string;
    tertiary: string;
    name: string;
}
export declare class AccentColorService {
    private static instance;
    private currentAccentSet;
    private accentSets;
    private constructor();
    static getInstance(): AccentColorService;
    /**
     * Инициализация акцентных цветов
     */
    private initializeAccentColors;
    /**
     * Применение акцентных цветов к CSS переменным
     */
    private applyAccentColors;
    /**
     * Установка конкретного набора акцентных цветов
     */
    setAccentSet(setName: string): void;
    /**
     * Получение текущего набора акцентных цветов
     */
    getCurrentAccentSet(): AccentColorSet;
    /**
     * Получение всех доступных наборов акцентных цветов
     */
    getAllAccentSets(): AccentColorSet[];
    /**
     * Циклическое переключение между наборами акцентных цветов
     */
    cycleAccentSets(): void;
    /**
     * Случайный выбор набора акцентных цветов
     */
    setRandomAccentSet(): void;
    /**
     * Сохранение выбранного набора в localStorage
     */
    private saveAccentSet;
    /**
     * Загрузка сохраненного набора из localStorage
     */
    private loadAccentSet;
    /**
     * Восстановление сохраненного набора при инициализации
     */
    restoreAccentSet(): void;
    /**
     * Автоматическое переключение акцентных цветов (как в полоске)
     */
    startAutoCycle(intervalMs?: number): void;
    /**
     * Получение цвета по имени из текущего набора
     */
    getAccentColor(colorType: 'primary' | 'secondary' | 'tertiary'): string;
    /**
     * Создание градиента из текущих акцентных цветов
     */
    createAccentGradient(direction?: 'horizontal' | 'vertical' | 'diagonal'): string;
}
export declare const accentColorService: AccentColorService;
//# sourceMappingURL=AccentColorService.d.ts.map