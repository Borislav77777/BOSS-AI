/**
 * Сервис для управления генерацией в чате
 */

import { ChatMessage, GenerationState, PromptImprovementData } from '../types/chat';

class ChatGenerationService {
  private generationState: GenerationState = {
    isGenerating: false
  };

  private messageUpdateCallbacks: Map<string, (content: string) => void> = new Map();
  private stopCallbacks: Map<string, () => void> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Слушаем события улучшения промптов
    window.addEventListener('chat:improve-prompt', (event: Event) => {
      const customEvent = event as CustomEvent<PromptImprovementData>;
      this.handlePromptImprovement(customEvent.detail);
    });

    // Слушаем события остановки генерации
    window.addEventListener('chat:stop-generation', (event: Event) => {
      const customEvent = event as CustomEvent<{ messageId: string }>;
      this.stopGeneration(customEvent.detail.messageId);
    });
  }

  // Обработка улучшения промпта
  private async handlePromptImprovement(data: PromptImprovementData) {
    try {
      // Создаем сообщение с улучшенным промптом
      const messageId = this.generateMessageId();

      // Отправляем начальное сообщение
      this.sendMessage({
        id: messageId,
        content: `✨ **Улучшение промпта**\n\n**Исходный промпт:**\n${data.originalPrompt}\n\n**Улучшенный промпт:**\n${data.improvedPrompt}\n\n**Объяснение улучшений:**\n${data.explanation}\n\n**Предложения для дальнейшего улучшения:**\n${data.suggestions.map(s => `• ${s}`).join('\n')}\n\n---\n\n**Хотите что-то дополнить или изменить в промпте?** Если да, напишите ваши дополнения, и я обновлю промпт. Если нет, промпт готов к использованию!`,
        role: 'assistant',
        timestamp: new Date(),
        isGenerating: false,
        metadata: {
          originalPrompt: data.originalPrompt,
          improvedPrompt: data.improvedPrompt,
          suggestions: data.suggestions,
          explanation: data.explanation
        }
      });

      // Ждем ответа пользователя
      this.waitForUserFeedback(messageId, data);

    } catch (error) {
      console.error('Failed to handle prompt improvement:', error);
    }
  }

  // Ожидание обратной связи от пользователя
  private waitForUserFeedback(messageId: string, improvementData: PromptImprovementData) {
    const handleUserMessage = (event: CustomEvent<{ content: string; messageId: string }>) => {
      if (event.detail.messageId === messageId) {
        const userContent = event.detail.content.toLowerCase().trim();

        // Если пользователь дал обратную связь
        if (userContent && !userContent.includes('нет') && !userContent.includes('не нужно')) {
          this.processUserFeedback(messageId, event.detail.content, improvementData);
        } else {
          // Промпт готов к использованию
          this.finalizePrompt(messageId, improvementData.improvedPrompt);
        }

        // Убираем слушатель
        window.removeEventListener('chat:user-message', handleUserMessage as unknown as EventListener);
      }
    };

    window.addEventListener('chat:user-message', handleUserMessage as EventListener);
  }

  // Обработка обратной связи пользователя
  private async processUserFeedback(messageId: string, feedback: string, improvementData: PromptImprovementData) {
    try {
      // Обновляем сообщение с обратной связью
      this.updateMessage(messageId, `✨ **Обновление промпта**\n\n**Ваши дополнения:**\n${feedback}\n\n**Обновленный промпт:**\n${improvementData.improvedPrompt}\n\n**Дополнительные требования:**\n${feedback}\n\nУчтите эти требования при выполнении задачи.\n\n---\n\n**Промпт готов к использованию!** Начинаю выполнение...`, false);

      // Запускаем генерацию с обновленным промптом
      const finalPrompt = `${improvementData.improvedPrompt}\n\nДополнительные требования пользователя:\n${feedback}\n\nУчти эти требования при выполнении задачи.`;

      await this.startGeneration(messageId, finalPrompt);

    } catch (error) {
      console.error('Failed to process user feedback:', error);
    }
  }

  // Финализация промпта без дополнительной обратной связи
  private async finalizePrompt(messageId: string, prompt: string) {
    try {
      this.updateMessage(messageId, `✅ **Промпт готов к использованию!**\n\nНачинаю выполнение...`, false);
      await this.startGeneration(messageId, prompt);
    } catch (error) {
      console.error('Failed to finalize prompt:', error);
    }
  }

  // Запуск генерации
  private async startGeneration(messageId: string, prompt: string) {
    try {
      this.generationState.isGenerating = true;
      this.generationState.currentMessageId = messageId;

      // Создаем новое сообщение для генерации
      const generationMessageId = this.generateMessageId();

      this.sendMessage({
        id: generationMessageId,
        content: '🔄 **Генерирую ответ...**\n\n',
        role: 'assistant',
        timestamp: new Date(),
        isGenerating: true
      });

      // Симулируем генерацию (здесь должен быть реальный вызов к AI)
      await this.simulateGeneration(generationMessageId, prompt);

    } catch (error) {
      console.error('Failed to start generation:', error);
      this.stopGeneration(messageId);
    }
  }

  // Симуляция генерации (заглушка)
  private async simulateGeneration(messageId: string, prompt: string) {
    const steps = [
      'Анализирую запрос...',
      'Формирую структуру ответа...',
      'Генерирую контент...',
      'Проверяю качество...',
      'Финализирую ответ...'
    ];

    let currentContent = '🔄 **Генерирую ответ...**\n\n';

    for (let i = 0; i < steps.length; i++) {
      if (!this.generationState.isGenerating || this.generationState.currentMessageId !== messageId) {
        // Генерация остановлена
        this.updateMessage(messageId, currentContent + '\n\n⏹️ **Генерация остановлена пользователем**', false);
        return;
      }

      currentContent += `• ${steps[i]}\n`;
      this.updateMessage(messageId, currentContent, true);

      // Имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    // Финальный результат
    const finalContent = currentContent + '\n\n✅ **Готово!**\n\n' + this.generateMockResponse(prompt);
    this.updateMessage(messageId, finalContent, false);

    this.generationState.isGenerating = false;
    this.generationState.currentMessageId = undefined;
  }

  // Генерация мокового ответа
  private generateMockResponse(prompt: string): string {
    return `**Результат выполнения промпта:**\n\n${prompt}\n\n**Ответ:**\n\nЭто демонстрационный ответ, сгенерированный на основе вашего промпта. В реальной реализации здесь будет ответ от AI-модели.\n\n**Ключевые моменты:**\n• Задача выполнена согласно требованиям\n• Учтены все дополнительные пожелания\n• Результат готов к использованию\n\n*Для остановки генерации нажмите кнопку "Стоп"*`;
  }

  // Остановка генерации
  public stopGeneration(messageId: string) {
    if (this.generationState.isGenerating && this.generationState.currentMessageId === messageId) {
      this.generationState.isGenerating = false;
      this.generationState.currentMessageId = undefined;

      // Обновляем сообщение
      this.updateMessage(messageId, '⏹️ **Генерация остановлена пользователем**', false);

      console.log('Generation stopped by user');
    }
  }

  // Отправка сообщения в чат
  private sendMessage(message: ChatMessage) {
    window.dispatchEvent(new CustomEvent('chat:new-message', { detail: message }));
  }

  // Обновление сообщения
  private updateMessage(messageId: string, content: string, isGenerating: boolean) {
    window.dispatchEvent(new CustomEvent('chat:update-message', {
      detail: { messageId, content, isGenerating }
    }));
  }

  // Генерация ID сообщения
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // Получение состояния генерации
  public getGenerationState(): GenerationState {
    return { ...this.generationState };
  }

  // Проверка, идет ли генерация
  public isGenerating(): boolean {
    return this.generationState.isGenerating;
  }
}

// Экспортируем синглтон
export const chatGenerationService = new ChatGenerationService();
export default chatGenerationService;
