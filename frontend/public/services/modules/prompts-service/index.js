export default {
  async initialize() {
    // init storage namespace
    try {
      const ns = 'promptsService';
      if (!localStorage.getItem(`${ns}:initialized`)) {
        const defaultCategories = [
          { id: 'ai', title: 'AI', order: 1, system: true },
          { id: 'code', title: 'Код', order: 2, system: true },
          { id: 'design', title: 'Дизайн', order: 3, system: true }
        ];
        const defaultQuick = [];
        localStorage.setItem(`${ns}:categories`, JSON.stringify(defaultCategories));
        localStorage.setItem(`${ns}:folders`, JSON.stringify([]));
        localStorage.setItem(`${ns}:prompts`, JSON.stringify([]));
        localStorage.setItem(`${ns}:quick`, JSON.stringify(defaultQuick));
        localStorage.setItem(`${ns}:initialized`, '1');
      }
    } catch (error) {
      console.warn('Failed to initialize prompts service storage:', error);
    }
  },

  async execute(toolId, params) {
    switch (toolId) {
      case 'openLibrary':
        return { success: true, message: 'Открыта библиотека промптов' };
      case 'insertPrompt': {
        const promptBody = params && params.promptBody ? params.promptBody : '{promptBody}';
        return {
          success: true,
          message: 'Готово к вставке промпта',
          data: { prompt: promptBody },
          isChatResponse: true
        };
      }
      case 'improvePrompt': {
        // Получаем текст промпта из параметров или используем заглушку
        const userInput = params && params.userInput ? params.userInput : 'Введите промпт для улучшения';
        return {
          success: true,
          message: `Улучшение промпта: "${userInput.substring(0, 50)}${userInput.length > 50 ? '...' : ''}"`,
          data: {
            originalPrompt: userInput,
            improvedPrompt: `${userInput}\n\nДополнительные инструкции:\n- Будь максимально точным и конкретным\n- Предоставь пошаговое решение\n- Включи примеры если необходимо`,
            suggestions: [
              'Добавить конкретные примеры',
              'Уточнить формат ответа',
              'Включить критерии качества',
              'Добавить контекстные ограничения'
            ],
            explanation: 'Промпт был улучшен для большей точности и структурированности.'
          },
          isChatResponse: true
        };
      }
      default:
        throw new Error(`Unknown tool: ${toolId}`);
    }
  },

  async cleanup() {
    // Cleanup logic can be added here if needed
  }
};
