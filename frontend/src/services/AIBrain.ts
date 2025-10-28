/**
 * 🧠 AI BRAIN - Центральный мозг платформы для маршрутизации сообщений
 *
 * Этот сервис отвечает за:
 * - Анализ намерений пользователя
 * - Маршрутизацию сообщений к соответствующим сервисам
 * - Обработку системных команд
 * - Управление контекстом разговора
 */

import { Message } from '@/types';
import { chatContextService } from './ChatContextService';
import { serviceManager } from './ServiceManager';

export interface ChatContext {
  activeService: string | null;
  activeSection: string;
  conversationHistory: Message[];
  userPreferences: Record<string, unknown>;
  lastActivity: Date;
}

export interface ChatContextForAI {
  attachedItems: Array<{
    type: string;
    title: string;
    content?: string;
  }>;
  activeProject?: {
    title: string;
  };
  contextSummary?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data?: unknown;
  serviceId?: string;
  toolId?: string;
  isSystemResponse?: boolean;
  shouldRouteToService?: boolean;
}

export interface AIBrainConfig {
  enableSystemCommands: boolean;
  enableServiceRouting: boolean;
  enableContextAnalysis: boolean;
  maxHistoryLength: number;
  responseTimeout: number;
}

class AIBrainService {
  private config: AIBrainConfig = {
    enableSystemCommands: true,
    enableServiceRouting: true,
    enableContextAnalysis: true,
    maxHistoryLength: 50,
    responseTimeout: 30000
  };

  private context: ChatContext = {
    activeService: null,
    activeSection: 'workspace',
    conversationHistory: [],
    userPreferences: {},
    lastActivity: new Date()
  };

  /**
   * Основной метод обработки сообщений
   */
  async processMessage(
    message: string,
    currentService: string | null = null,
    currentSection: string = 'workspace'
  ): Promise<ChatResponse> {
    try {
      // Обновляем контекст
      this.updateContext(currentService, currentSection);

      // Получаем контекст чата для анализа
      const chatContext = chatContextService.getContextForAI();

      // Анализируем намерения пользователя с учетом контекста
      const intent = await this.analyzeIntentWithContext(message, chatContext);

      // Обрабатываем системные команды
      if (this.config.enableSystemCommands && intent.isSystemCommand) {
        return await this.handleSystemCommand(message, intent);
      }

      // Маршрутизируем к сервису
      if (this.config.enableServiceRouting && intent.shouldRouteToService && intent.serviceId) {
        return await this.routeToService(message, {
          serviceId: intent.serviceId,
          toolId: intent.toolId,
          shouldRouteToService: intent.shouldRouteToService
        });
      }

      // Обрабатываем как общий запрос с контекстом
      return await this.handleGeneralQueryWithContext(message, intent, chatContext);

    } catch (error) {
      console.error('AI Brain error:', error);
      return {
        success: false,
        message: 'Произошла ошибка при обработке сообщения',
        isSystemResponse: true
      };
    }
  }

  /**
   * Анализ намерений пользователя с учетом контекста
   */
  private async analyzeIntentWithContext(message: string, chatContext: ChatContextForAI): Promise<{
    isSystemCommand: boolean;
    shouldRouteToService: boolean;
    serviceId?: string;
    toolId?: string;
    confidence: number;
    keywords: string[];
  }> {
    // Сначала анализируем базовые намерения
    const baseIntent = await this.analyzeIntent(message);

    // Учитываем контекст для улучшения анализа
    if (chatContext.attachedItems.length > 0) {
      // Если есть прикрепленные элементы, повышаем приоритет сервисов
      baseIntent.confidence = Math.min(baseIntent.confidence + 0.2, 1.0);

      // Если есть прикрепленные документы, маршрутизируем к AI Assistant
      if (chatContext.attachedItems.some((item) => item.type === 'document')) {
        if (!baseIntent.serviceId) {
          baseIntent.serviceId = 'ai-assistant';
          baseIntent.shouldRouteToService = true;
        }
      }
    }

    // Если пользователь находится в проекте, учитываем это
    if (chatContext.activeProject) {
      baseIntent.keywords.push(`проект:${chatContext.activeProject.title}`);
    }

    return baseIntent;
  }

  /**
   * Анализ намерений пользователя
   */
  private async analyzeIntent(message: string): Promise<{
    isSystemCommand: boolean;
    shouldRouteToService: boolean;
    serviceId?: string;
    toolId?: string;
    confidence: number;
    keywords: string[];
  }> {
    const lowerMessage = message.toLowerCase();
    const keywords = this.extractKeywords(lowerMessage);

    // Проверяем системные команды
    const systemCommands = [
      'настройки', 'settings', 'конфигурация', 'config',
      'помощь', 'help', 'справка', 'команды',
      'выход', 'exit', 'закрыть', 'close',
      'очистить', 'clear', 'сброс', 'reset'
    ];

    const isSystemCommand = systemCommands.some(cmd => lowerMessage.includes(cmd));

    // Проверяем команды для сервисов
    const serviceCommands = [
      { service: 'chatgpt-service', keywords: ['chatgpt', 'gpt', 'openai', 'ии', 'ai', 'чат', 'переписать', 'rewrite', 'кратко', 'summary', 'перевести', 'translate'] },
      { service: 'settings', keywords: ['настройки', 'settings', 'конфигурация', 'config', 'тема', 'theme', 'цвет', 'color', 'интерфейс', 'interface', 'уведомления', 'notifications'] },
      { service: 'whisper-service', keywords: ['голос', 'voice', 'микрофон', 'mic', 'говорить', 'speak', 'транскрипция', 'transcription', 'записать', 'record'] },
      { service: 'ai-assistant', keywords: ['помощь', 'help', 'ассистент', 'assistant'] }
    ];

    let shouldRouteToService = false;
    let serviceId: string | undefined;
    let toolId: string | undefined;
    let confidence = 0;

    for (const service of serviceCommands) {
      const matchCount = service.keywords.filter(keyword =>
        lowerMessage.includes(keyword)
      ).length;

      if (matchCount > 0) {
        const serviceConfidence = matchCount / service.keywords.length;
        if (serviceConfidence > confidence) {
          confidence = serviceConfidence;
          serviceId = service.service;
          shouldRouteToService = true;

          // Определяем конкретный инструмент
          if (service.service === 'chatgpt-service') {
            if (lowerMessage.includes('переписать') || lowerMessage.includes('rewrite')) {
              toolId = 'text-rewrite';
            } else if (lowerMessage.includes('кратко') || lowerMessage.includes('summary')) {
              toolId = 'summarize-text';
            } else if (lowerMessage.includes('перевести') || lowerMessage.includes('translate')) {
              toolId = 'translate-chatgpt';
            } else {
              toolId = 'chat-completion';
            }
          } else if (service.service === 'settings') {
            if (lowerMessage.includes('тема') || lowerMessage.includes('theme')) {
              toolId = 'toggle-theme';
            } else if (lowerMessage.includes('интерфейс') || lowerMessage.includes('interface')) {
              toolId = 'interface';
            } else if (lowerMessage.includes('уведомления') || lowerMessage.includes('notifications')) {
              toolId = 'notifications';
            } else if (lowerMessage.includes('чат') || lowerMessage.includes('chat')) {
              toolId = 'chat';
            } else if (lowerMessage.includes('внешний вид') || lowerMessage.includes('appearance')) {
              toolId = 'appearance';
            } else {
              toolId = 'open-preferences';
            }
          } else if (service.service === 'whisper-service') {
            if (lowerMessage.includes('голос') || lowerMessage.includes('voice') || lowerMessage.includes('микрофон') || lowerMessage.includes('mic')) {
              toolId = 'realtime-transcription';
            } else if (lowerMessage.includes('транскрипция') || lowerMessage.includes('transcription')) {
              toolId = 'audio-transcription';
            } else if (lowerMessage.includes('команда') || lowerMessage.includes('command')) {
              toolId = 'voice-commands';
            } else {
              toolId = 'realtime-transcription';
            }
          }
        }
      }
    }

    return {
      isSystemCommand,
      shouldRouteToService,
      serviceId,
      toolId,
      confidence,
      keywords
    };
  }

  /**
   * Обработка системных команд
   */
  private async handleSystemCommand(
    message: string,
    _intent: { isSystemCommand: boolean; shouldRouteToService: boolean; serviceId?: string; toolId?: string; confidence: number; keywords: string[] }
  ): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('помощь') || lowerMessage.includes('help')) {
      return {
        success: true,
        message: this.getHelpMessage(),
        isSystemResponse: true
      };
    }

    if (lowerMessage.includes('очистить') || lowerMessage.includes('clear')) {
      this.context.conversationHistory = [];
      return {
        success: true,
        message: 'История разговора очищена',
        isSystemResponse: true
      };
    }

    if (lowerMessage.includes('настройки') || lowerMessage.includes('settings')) {
      // Перенаправляем к сервису настроек
      return await this.routeToService(message, {
        serviceId: 'settings',
        toolId: 'open-preferences',
        shouldRouteToService: true
      });
    }

    return {
      success: true,
      message: 'Системная команда обработана',
      isSystemResponse: true
    };
  }

  /**
   * Маршрутизация к сервису
   */
  private async routeToService(
    message: string,
    intent: { serviceId: string; toolId?: string; shouldRouteToService: boolean }
  ): Promise<ChatResponse> {
    if (!intent.serviceId) {
      return {
        success: false,
        message: 'Не удалось определить сервис для обработки',
        isSystemResponse: true
      };
    }

    try {
      // Получаем сервис
      const service = serviceManager.getService(intent.serviceId);
      if (!service) {
        return {
          success: false,
          message: `Сервис ${intent.serviceId} не найден`,
          isSystemResponse: true
        };
      }

      // Загружаем сервис если не загружен
      if (!service.isLoaded) {
        await serviceManager.loadService(intent.serviceId);
      }

      // Выполняем инструмент сервиса
      if (intent.toolId) {
        const result = await serviceManager.executeTool(intent.serviceId, intent.toolId);
        return {
          success: true,
          message: `Сообщение обработано сервисом ${service.config.name}`,
          data: result,
          serviceId: intent.serviceId,
          toolId: intent.toolId,
          shouldRouteToService: true
        };
      }

      // Если нет конкретного инструмента, используем чат функцию
      const chatFunctions = serviceManager.getChatFunctions();
      const chatFunction = chatFunctions.find(f => f.isChatFunction);

      if (chatFunction) {
        const result = await serviceManager.executeTool(intent.serviceId, chatFunction.id);
        return {
          success: true,
          message: `Сообщение обработано сервисом ${service.config.name}`,
          data: result,
          serviceId: intent.serviceId,
          toolId: chatFunction.id,
          shouldRouteToService: true
        };
      }

      return {
        success: true,
        message: `Сообщение получено сервисом ${service.config.name}`,
        serviceId: intent.serviceId,
        shouldRouteToService: true
      };

    } catch (error) {
      console.error('Service routing error:', error);
      return {
        success: false,
        message: `Ошибка при обращении к сервису: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isSystemResponse: true
      };
    }
  }

  /**
   * Обработка общих запросов с контекстом
   */
  private async handleGeneralQueryWithContext(
    message: string,
    intent: { isSystemCommand: boolean; shouldRouteToService: boolean; serviceId?: string; toolId?: string; confidence: number; keywords: string[] },
    chatContext: ChatContextForAI
  ): Promise<ChatResponse> {
    // Если есть контекст, формируем расширенное сообщение
    if (chatContext.attachedItems.length > 0 || chatContext.activeProject) {
      const contextInfo = this.buildContextInfo(chatContext);
      const enhancedMessage = `${message}\n\nКонтекст:\n${contextInfo}`;

      // Пытаемся маршрутизировать к AI Assistant с контекстом
      try {
        const service = serviceManager.getService('ai-assistant');
        if (service && service.isLoaded) {
          return {
            success: true,
            message: `Запрос обработан с учетом контекста: ${chatContext.contextSummary}`,
            serviceId: 'ai-assistant',
            shouldRouteToService: true,
            data: { enhancedMessage, contextInfo }
          };
        }
      } catch (error) {
        console.error('Ошибка маршрутизации к AI Assistant:', error);
      }
    }

    // Если нет контекста или ошибка, используем стандартную обработку
    return await this.handleGeneralQuery(message, intent);
  }

  /**
   * Построение информации о контексте
   */
  private buildContextInfo(chatContext: ChatContextForAI): string {
    const parts: string[] = [];

    if (chatContext.activeProject) {
      parts.push(`Активный проект: ${chatContext.activeProject.title}`);
    }

    if (chatContext.attachedItems.length > 0) {
      const items = chatContext.attachedItems.map((item) =>
        `${item.type}: ${item.title}${item.content ? `\nСодержимое: ${item.content.substring(0, 200)}...` : ''}`
      ).join('\n\n');
      parts.push(`Прикрепленные элементы:\n${items}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Обработка общих запросов
   */
  private async handleGeneralQuery(
    _message: string,
    _intent: { isSystemCommand: boolean; shouldRouteToService: boolean; serviceId?: string; toolId?: string; confidence: number; keywords: string[] }
  ): Promise<ChatResponse> {
    // Если мы в рабочем пространстве, обрабатываем как общий запрос
    if (this.context.activeSection === 'workspace') {
      return {
        success: true,
        message: 'Сообщение получено центральным мозгом платформы',
        isSystemResponse: true
      };
    }

    // Если мы в конкретном сервисе, но не определили инструмент
    if (this.context.activeService) {
      return {
        success: true,
        message: `Сообщение получено сервисом ${this.context.activeService}`,
        serviceId: this.context.activeService,
        shouldRouteToService: true
      };
    }

    return {
      success: true,
      message: 'Сообщение получено платформой',
      isSystemResponse: true
    };
  }

  /**
   * Обновление контекста
   */
  private updateContext(activeService: string | null, activeSection: string): void {
    this.context.activeService = activeService;
    this.context.activeSection = activeSection;
    this.context.lastActivity = new Date();
  }

  /**
   * Извлечение ключевых слов
   */
  private extractKeywords(message: string): string[] {
    // Простое извлечение ключевых слов
    const words = message.split(/\s+/).filter(word => word.length > 2);
    return words;
  }

  /**
   * Получение сообщения помощи
   */
  private getHelpMessage(): string {
    return `🧠 **BARSUKOV PLATFORM - AI BRAIN**

Доступные команды:

🤖 **ChatGPT сервис**
- "ChatGPT, помоги с..." - обращение к ChatGPT
- "Переписать текст" - переписать с помощью GPT
- "Краткое изложение" - создать краткое изложение
- "Перевести текст" - перевод с помощью GPT

🎤 **Whisper AI (Голосовой ввод)**
- "Голосовой ввод" - начать голосовой ввод
- "Транскрипция" - преобразовать речь в текст
- "Голосовые команды" - обработать голосовые команды
- Нажмите микрофон для живого голосового ввода

⚙️ **Настройки**
- "Настройки" - открыть настройки
- "Сменить тему" - изменить тему оформления
- "Настройки интерфейса" - настройки интерфейса
- "Настройки уведомлений" - настройки уведомлений

📁 **Рабочее пространство**
- Общие вопросы обрабатываются центральным мозгом
- Умное хранение всех данных
- Автоматическая маршрутизация к сервисам

🔧 **Системные команды**
- "Помощь" - показать это сообщение
- "Очистить" - очистить историю разговора

💡 **Как это работает:**
1. Отправляете сообщение в чат
2. AI-мозг анализирует намерения
3. Сообщение маршрутизируется к нужному сервису
4. Получаете ответ от соответствующего сервиса

🎯 **Советы:**
- Будьте конкретны в запросах
- Система понимает контекст и намерения
- Команды работают на русском и английском языках`;
  }

  /**
   * Добавление сообщения в историю
   */
  addMessageToHistory(message: Message): void {
    this.context.conversationHistory.push(message);

    // Ограничиваем размер истории
    if (this.context.conversationHistory.length > this.config.maxHistoryLength) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-this.config.maxHistoryLength);
    }
  }

  /**
   * Получение контекста
   */
  getContext(): ChatContext {
    return { ...this.context };
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newConfig: Partial<AIBrainConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Очистка контекста
   */
  clearContext(): void {
    this.context = {
      activeService: null,
      activeSection: 'workspace',
      conversationHistory: [],
      userPreferences: {},
      lastActivity: new Date()
    };
  }
}

// Создаем единственный экземпляр AI Brain
export const aiBrain = new AIBrainService();
