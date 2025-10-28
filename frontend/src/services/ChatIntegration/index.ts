/**
 * Chat Integration - Интеграция сервисов с чатом
 */

export { ChatIntegrationManager } from './ChatIntegrationManager';
export * from './types';

// Создаем единственный экземпляр менеджера
import { ChatIntegrationManager } from './ChatIntegrationManager';
export const chatIntegrationManager = new ChatIntegrationManager();
