import { useChat } from './useChat';
/**
 * Контроллер чата (скелет без изменения поведения)
 * Делегирует логику в существующий useChat для безопасной миграции
 */
export function useChatController() {
    return useChat();
}
//# sourceMappingURL=useChatController.js.map