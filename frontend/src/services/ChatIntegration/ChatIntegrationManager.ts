/**
 * Менеджер интеграции сервисов с чатом
 */

import {
    ChatContext,
    ChatHandler,
    ChatMessage,
    ChatResponse,
    ChatIntegrationManager as IChatIntegrationManager,
    ServiceChatButton,
    ServiceChatIntegration
} from './types';

export class ChatIntegrationManager implements IChatIntegrationManager {
  private serviceIntegrations: Map<string, ServiceChatIntegration> = new Map();
  private handlers: Map<string, ChatHandler> = new Map();
  private chatButtons: Map<string, ServiceChatButton> = new Map();
  private eventListeners: {
    onMessageReceived: ((message: ChatMessage) => void)[];
    onResponseGenerated: ((response: ChatResponse) => void)[];
    onHandlerExecuted: ((handler: ChatHandler, result: ChatResponse) => void)[];
  } = {
    onMessageReceived: [],
    onResponseGenerated: [],
    onHandlerExecuted: []
  };

  /**
   * Регистрирует интеграцию сервиса с чатом
   */
  registerServiceIntegration(integration: ServiceChatIntegration): void {
    this.serviceIntegrations.set(integration.serviceId, integration);

    // Регистрируем обработчики
    integration.handlers.forEach(handler => {
      this.handlers.set(handler.id, handler);
    });

    // Регистрируем кнопки
    integration.chatButtons.forEach(button => {
      this.chatButtons.set(button.id, button);
    });

    console.log(`[ChatIntegration] Сервис ${integration.serviceId} зарегистрирован`);
  }

  /**
   * Удаляет интеграцию сервиса
   */
  unregisterServiceIntegration(serviceId: string): void {
    const integration = this.serviceIntegrations.get(serviceId);
    if (!integration) return;

    // Удаляем обработчики
    integration.handlers.forEach(handler => {
      this.handlers.delete(handler.id);
    });

    // Удаляем кнопки
    integration.chatButtons.forEach(button => {
      this.chatButtons.delete(button.id);
    });

    this.serviceIntegrations.delete(serviceId);
    console.log(`[ChatIntegration] Сервис ${serviceId} удален`);
  }

  /**
   * Регистрирует обработчик
   */
  registerHandler(handler: ChatHandler): void {
    this.handlers.set(handler.id, handler);
    console.log(`[ChatIntegration] Обработчик ${handler.id} зарегистрирован`);
  }

  /**
   * Удаляет обработчик
   */
  unregisterHandler(handlerId: string): void {
    this.handlers.delete(handlerId);
    console.log(`[ChatIntegration] Обработчик ${handlerId} удален`);
  }

  /**
   * Получает обработчик
   */
  getHandler(handlerId: string): ChatHandler | null {
    return this.handlers.get(handlerId) || null;
  }

  /**
   * Получает все обработчики
   */
  getAllHandlers(): ChatHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Получает обработчики сервиса
   */
  getServiceHandlers(serviceId: string): ChatHandler[] {
    return Array.from(this.handlers.values())
      .filter(handler => handler.serviceId === serviceId);
  }

  /**
   * Обрабатывает сообщение
   */
  async processMessage(message: string, context: ChatContext): Promise<ChatResponse[]> {
    const responses: ChatResponse[] = [];
    const matchingHandlers = this.findMatchingHandlers(message);

    for (const handler of matchingHandlers) {
      try {
        const response = await this.executeHandler(handler.id, message, context);
        responses.push(response);
      } catch (error) {
        console.error(`[ChatIntegration] Ошибка выполнения обработчика ${handler.id}:`, error);
      }
    }

    return responses;
  }

  /**
   * Выполняет обработчик
   */
  async executeHandler(handlerId: string, message: string, context: ChatContext): Promise<ChatResponse> {
    const handler = this.handlers.get(handlerId);
    if (!handler) {
      throw new Error(`Обработчик ${handlerId} не найден`);
    }

    if (!handler.isEnabled) {
      throw new Error(`Обработчик ${handlerId} отключен`);
    }

    const startTime = Date.now();

    try {
      const result = await handler.handler(message, context);
      const processingTime = Date.now() - startTime;

      // Добавляем метаданные
      result.metadata.processingTime = processingTime;
      result.metadata.handlerId = handlerId;

      // Уведомляем слушателей
      this.eventListeners.onHandlerExecuted.forEach(callback => callback(handler, result));
      this.eventListeners.onResponseGenerated.forEach(callback => callback(result));

      console.log(`[ChatIntegration] Обработчик ${handlerId} выполнен за ${processingTime}ms`);
      return result;

    } catch (error) {
      console.error(`[ChatIntegration] Ошибка в обработчике ${handlerId}:`, error);
      throw error;
    }
  }

  /**
   * Регистрирует кнопку чата
   */
  registerChatButton(button: ServiceChatButton): void {
    this.chatButtons.set(button.id, button);
    console.log(`[ChatIntegration] Кнопка ${button.id} зарегистрирована`);
  }

  /**
   * Удаляет кнопку чата
   */
  unregisterChatButton(buttonId: string): void {
    this.chatButtons.delete(buttonId);
    console.log(`[ChatIntegration] Кнопка ${buttonId} удалена`);
  }

  /**
   * Получает кнопки чата
   */
  getChatButtons(serviceId?: string): ServiceChatButton[] {
    const buttons = Array.from(this.chatButtons.values());
    if (serviceId) {
      return buttons.filter(button => button.serviceId === serviceId);
    }
    return buttons;
  }

  /**
   * Подписывается на получение сообщений
   */
  onMessageReceived(callback: (message: ChatMessage) => void): void {
    this.eventListeners.onMessageReceived.push(callback);
  }

  /**
   * Подписывается на генерацию ответов
   */
  onResponseGenerated(callback: (response: ChatResponse) => void): void {
    this.eventListeners.onResponseGenerated.push(callback);
  }

  /**
   * Подписывается на выполнение обработчиков
   */
  onHandlerExecuted(callback: (handler: ChatHandler, result: ChatResponse) => void): void {
    this.eventListeners.onHandlerExecuted.push(callback);
  }

  /**
   * Синхронизируется с чатом
   */
  syncWithChat(): void {
    // TODO: Интеграция с основным Chat компонентом
    console.log('[ChatIntegration] Синхронизация с чатом');
  }

  /**
   * Экспортирует обработчики
   */
  exportHandlers(serviceId?: string): ChatHandler[] {
    if (serviceId) {
      return this.getServiceHandlers(serviceId);
    }
    return this.getAllHandlers();
  }

  /**
   * Импортирует обработчики
   */
  importHandlers(handlers: ChatHandler[]): void {
    handlers.forEach(handler => {
      this.handlers.set(handler.id, handler);
    });
    console.log(`[ChatIntegration] Импортировано ${handlers.length} обработчиков`);
  }

  /**
   * Находит подходящие обработчики для сообщения
   */
  private findMatchingHandlers(message: string): ChatHandler[] {
    const matchingHandlers: ChatHandler[] = [];

    for (const handler of this.handlers.values()) {
      if (!handler.isEnabled) continue;

      // Проверяем триггеры
      const hasTrigger = handler.triggers.some(trigger =>
        message.toLowerCase().includes(trigger.toLowerCase())
      );

      if (hasTrigger) {
        matchingHandlers.push(handler);
      }
    }

    // Сортируем по приоритету
    return matchingHandlers.sort((a, b) => b.priority - a.priority);
  }
}
