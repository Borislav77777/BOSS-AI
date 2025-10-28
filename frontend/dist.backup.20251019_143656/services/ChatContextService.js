/**
 * Сервис управления контекстом чата
 * Отвечает за прикрепление и отслеживание контекста в чате
 */
class ChatContextService {
    constructor() {
        this.context = {
            attachedItems: [],
            userLocation: 'workspace'
        };
        this.listeners = new Set();
        /**
         * Обработка прикрепления контекста
         */
        this.handleAttachContext = (event) => {
            const contextButton = event.detail;
            // Проверяем, не прикреплен ли уже этот элемент
            const existingIndex = this.context.attachedItems.findIndex(item => item.id === contextButton.id);
            if (existingIndex === -1) {
                this.context.attachedItems.push(contextButton);
                this.notifyListeners();
                console.log(`Контекст прикреплен: ${contextButton.type} - ${contextButton.title}`);
            }
        };
        /**
         * Обработка удаления контекста
         */
        this.handleDetachContext = (event) => {
            const { id } = event.detail;
            this.context.attachedItems = this.context.attachedItems.filter(item => item.id !== id);
            this.notifyListeners();
            console.log(`Контекст удален: ${id}`);
        };
        /**
         * Обработка навигации по workspace
         */
        this.handleWorkspaceNavigate = (event) => {
            const { projectId } = event.detail;
            // Находим проект в workspace
            const project = this.findProjectById(projectId);
            if (project) {
                this.context.activeProject = {
                    id: project.id,
                    title: project.title,
                    type: 'project'
                };
                this.context.userLocation = 'project';
                // Автоматически прикрепляем активный проект к контексту
                this.autoAttachActiveProject();
                this.notifyListeners();
                console.log(`Активный проект: ${project.title}`);
            }
        };
        /**
         * Обработка отправки в чат из workspace
         */
        this.handleWorkspaceSendToChat = (event) => {
            const { items } = event.detail;
            items.forEach(item => {
                const contextButton = {
                    id: item.id,
                    type: item.type === 'folder' ? 'project' : (item.type === 'note' ? 'document' : item.type),
                    title: item.title,
                    icon: item.emoji || '📄',
                    content: item.content,
                    metadata: {
                        path: item.path,
                        size: item.size,
                        tags: item.tags,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt
                    },
                    removable: true,
                    source: 'workspace'
                };
                this.attachContext(contextButton);
            });
        };
        this.initEventListeners();
    }
    /**
     * Инициализация слушателей событий
     */
    initEventListeners() {
        // Слушаем события прикрепления контекста
        window.addEventListener('chat:attach-context', this.handleAttachContext);
        window.addEventListener('chat:detach-context', this.handleDetachContext);
        // Слушаем события навигации по workspace
        window.addEventListener('workspace:navigate', this.handleWorkspaceNavigate);
        // Слушаем события отправки в чат из workspace
        window.addEventListener('workspace:send-to-chat', this.handleWorkspaceSendToChat);
    }
    /**
     * Автоматическое прикрепление активного проекта
     */
    autoAttachActiveProject() {
        if (this.context.activeProject) {
            const existingProject = this.context.attachedItems.find(item => item.type === 'project' && item.id === this.context.activeProject.id);
            if (!existingProject) {
                const projectButton = {
                    id: this.context.activeProject.id,
                    type: 'project',
                    title: this.context.activeProject.title,
                    icon: '📁',
                    removable: true,
                    source: 'workspace',
                    metadata: {
                        autoAttached: true
                    }
                };
                this.context.attachedItems.push(projectButton);
            }
        }
    }
    /**
     * Поиск проекта по ID
     */
    findProjectById(projectId) {
        // Получаем workspace items из глобального состояния
        const workspaceItems = window.__PLATFORM_STATE__?.workspaceItems || [];
        return workspaceItems.find((item) => item.id === projectId && item.type === 'folder') || null;
    }
    /**
     * Прикрепление контекста
     */
    attachContext(contextButton) {
        window.dispatchEvent(new CustomEvent('chat:attach-context', {
            detail: contextButton
        }));
    }
    /**
     * Удаление контекста
     */
    detachContext(id) {
        window.dispatchEvent(new CustomEvent('chat:detach-context', {
            detail: { id }
        }));
    }
    /**
     * Получение текущего контекста
     */
    getContext() {
        return { ...this.context };
    }
    /**
     * Подписка на изменения контекста
     */
    subscribe(listener) {
        this.listeners.add(listener);
        // Возвращаем функцию отписки
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * Уведомление слушателей об изменениях
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.getContext());
            }
            catch (error) {
                console.error('Ошибка в слушателе контекста чата:', error);
            }
        });
    }
    /**
     * Очистка всего контекста
     */
    clearContext() {
        this.context.attachedItems = [];
        this.context.activeProject = undefined;
        this.context.activeDocument = undefined;
        this.context.userLocation = 'workspace';
        this.notifyListeners();
        console.log('Контекст чата очищен');
    }
    /**
     * Получение контекста для AI Brain
     */
    getContextForAI() {
        const contextSummary = this.generateContextSummary();
        return {
            attachedItems: this.context.attachedItems,
            activeProject: this.context.activeProject,
            userLocation: this.context.userLocation,
            contextSummary
        };
    }
    /**
     * Генерация краткого описания контекста для AI
     */
    generateContextSummary() {
        const parts = [];
        if (this.context.activeProject) {
            parts.push(`Активный проект: ${this.context.activeProject.title}`);
        }
        if (this.context.attachedItems.length > 0) {
            const items = this.context.attachedItems.map(item => `${item.type}: ${item.title}`).join(', ');
            parts.push(`Прикрепленные элементы: ${items}`);
        }
        parts.push(`Расположение пользователя: ${this.context.userLocation}`);
        return parts.join(' | ');
    }
}
// Экспортируем singleton
export const chatContextService = new ChatContextService();
//# sourceMappingURL=ChatContextService.js.map