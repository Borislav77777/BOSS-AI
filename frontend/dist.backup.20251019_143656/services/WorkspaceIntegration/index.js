/**
 * Workspace Integration - Интеграция сервисов с Workspace
 */
export * from './types';
export { WorkspaceIntegrationManager } from './WorkspaceIntegrationManager';
// Создаем единственный экземпляр менеджера
import { WorkspaceIntegrationManager } from './WorkspaceIntegrationManager';
export const workspaceIntegrationManager = new WorkspaceIntegrationManager();
//# sourceMappingURL=index.js.map