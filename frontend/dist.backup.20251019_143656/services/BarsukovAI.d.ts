/**
 * BOSS AI - BARSUKOV OS SUPER AI
 * Центральный обработчик запросов
 *
 * Определяет какой сервис использовать и как обрабатывать запросы
 */
import { BossAIResponse, ModeActivation, ServiceMode } from '@/types/modes';
declare class BossAI {
    private activeModes;
    private availableModes;
    constructor();
    /**
     * Инициализация доступных режимов от всех сервисов
     */
    private initializeModes;
    /**
     * Анализ пользовательского запроса и определение подходящих режимов
     */
    analyzeUserIntent(userInput: string): Promise<ServiceMode[]>;
    /**
     * Активация режима
     */
    activateMode(modeId: string, userInput: string): Promise<ModeActivation>;
    /**
     * Обработка запроса через активированный режим
     */
    processRequest(modeId: string, userInput: string): Promise<BossAIResponse>;
    /**
     * Генерация предложений для пользователя
     */
    private generateSuggestions;
    /**
     * Генерация следующих действий
     */
    private generateNextActions;
    /**
     * Получение активных режимов
     */
    getActiveModes(): ModeActivation[];
    /**
     * Деактивация режима
     */
    deactivateMode(modeId: string): void;
    /**
     * Получение всех доступных режимов
     */
    getAvailableModes(): ServiceMode[];
}
export declare const bossAI: BossAI;
export {};
//# sourceMappingURL=BarsukovAI.d.ts.map