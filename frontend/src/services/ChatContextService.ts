/**
 * Сервис управления контекстом чата
 * Отвечает за прикрепление и отслеживание контекста в чате
 */

import { WorkspaceItem } from '@/types';
import { ChatContext, ChatContextButton } from '@/types/chat';

class ChatContextService {
  private context: ChatContext = {
    attachedItems: [],
    userLocation: 'workspace'
  };

  private listeners: Set<(context: ChatContext) => void> = new Set();

  constructor() {
    this.initEventListeners();
  }

  /**
   * Инициализация слушателей событий
   */
  private initEventListeners(): void {
    // Слушаем события прикрепления контекста
    window.addEventListener('chat:attach-context', this.handleAttachContext as EventListener);
    window.addEventListener('chat:detach-context', this.handleDetachContext as EventListener);

    // Слушаем события навигации по workspace
    window.addEventListener('workspace:navigate', this.handleWorkspaceNavigate as EventListener);

    // Слушаем события отправки в чат из workspace
    window.addEventListener('workspace:send-to-chat', this.handleWorkspaceSendToChat as EventListener);
  }

  /**
   * Обработка прикрепления контекста
   */
  private handleAttachContext = (event: CustomEvent<ChatContextButton>): void => {
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
  private handleDetachContext = (event: CustomEvent<{ id: string }>): void => {
    const { id } = event.detail;

    this.context.attachedItems = this.context.attachedItems.filter(item => item.id !== id);
    this.notifyListeners();
    console.log(`Контекст удален: ${id}`);
  };

  /**
   * Обработка навигации по workspace
   */
  private handleWorkspaceNavigate = (event: CustomEvent<{ projectId: string }>): void => {
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
  private handleWorkspaceSendToChat = (event: CustomEvent<{ items: WorkspaceItem[] }>): void => {
    const { items } = event.detail;

    items.forEach(item => {
      const contextButton: ChatContextButton = {
        id: item.id,
        type: item.type === 'folder' ? 'project' : (item.type === 'note' ? 'document' : item.type as 'document' | 'file' | 'image'),
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

  /**
   * Автоматическое прикрепление активного проекта
   */
  private autoAttachActiveProject(): void {
    if (this.context.activeProject) {
      const existingProject = this.context.attachedItems.find(
        item => item.type === 'project' && item.id === this.context.activeProject!.id
      );

      if (!existingProject) {
        const projectButton: ChatContextButton = {
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
  private findProjectById(projectId: string): WorkspaceItem | null {
    // Получаем workspace items из глобального состояния
    const workspaceItems = (window as { __PLATFORM_STATE__?: { workspaceItems: WorkspaceItem[] } }).__PLATFORM_STATE__?.workspaceItems || [];
    return workspaceItems.find((item: WorkspaceItem) => item.id === projectId && item.type === 'folder') || null;
  }

  /**
   * Прикрепление контекста
   */
  public attachContext(contextButton: ChatContextButton): void {
    window.dispatchEvent(new CustomEvent('chat:attach-context', {
      detail: contextButton
    }));
  }

  /**
   * Удаление контекста
   */
  public detachContext(id: string): void {
    window.dispatchEvent(new CustomEvent('chat:detach-context', {
      detail: { id }
    }));
  }

  /**
   * Получение текущего контекста
   */
  public getContext(): ChatContext {
    return { ...this.context };
  }

  /**
   * Подписка на изменения контекста
   */
  public subscribe(listener: (context: ChatContext) => void): () => void {
    this.listeners.add(listener);

    // Возвращаем функцию отписки
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Уведомление слушателей об изменениях
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getContext());
      } catch (error) {
        console.error('Ошибка в слушателе контекста чата:', error);
      }
    });
  }

  /**
   * Очистка всего контекста
   */
  public clearContext(): void {
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
  public getContextForAI(): {
    attachedItems: ChatContextButton[];
    activeProject?: { id: string; title: string };
    userLocation: string;
    contextSummary: string;
  } {
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
  private generateContextSummary(): string {
    const parts: string[] = [];

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
