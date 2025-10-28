/**
 * Real Speech Service Module
 *
 * Сервис реального распознавания речи с использованием Web Speech API
 * Заменяет тестовые данные на реальное распознавание речи
 */

export default {
  /**
   * Инициализация сервиса
   */
  async initialize() {
    console.log('Real Speech service initialized');

    // Проверяем поддержку Web Speech API
    if (!this.isSpeechRecognitionSupported()) {
      console.warn('Web Speech API не поддерживается в этом браузере');
      return false;
    }

    return true;
  },

  /**
   * Выполнение инструмента сервиса
   */
  async execute(toolId, params) {
    console.log(`Executing Real Speech tool: ${toolId}`, params);

    switch (toolId) {
      case 'realtime-speech-recognition':
        return await this.startRealtimeRecognition(params);

      case 'continuous-speech-recognition':
        return await this.startContinuousRecognition(params);

      case 'voice-commands-recognition':
        return await this.processVoiceCommands(params);

      default:
        throw new Error(`Unknown Real Speech tool: ${toolId}`);
    }
  },

  /**
   * Проверка поддержки Web Speech API
   */
  isSpeechRecognitionSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  },

  /**
   * Создание экземпляра SpeechRecognition
   */
  createSpeechRecognition(options = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('SpeechRecognition не поддерживается');
    }

    const recognition = new SpeechRecognition();

    // Настройки по умолчанию
    recognition.continuous = options.continuous || true;
    recognition.interimResults = options.interimResults || true;
    recognition.lang = options.language || 'ru-RU';
    recognition.maxAlternatives = options.maxAlternatives || 1;

    return recognition;
  },

  /**
   * Распознавание речи в реальном времени
   */
  async startRealtimeRecognition(params) {
    const {
      onResult,
      onError,
      onStart,
      onEnd,
      language = 'ru-RU',
      continuous = true,
      interimResults = true
    } = params;

    try {
      if (!this.isSpeechRecognitionSupported()) {
        throw new Error('Web Speech API не поддерживается в этом браузере');
      }

      const recognition = this.createSpeechRecognition({
        language,
        continuous,
        interimResults
      });

      // Обработчики событий
      recognition.onstart = () => {
        console.log('Распознавание речи началось');
        if (onStart) onStart();
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (onResult) {
          onResult({
            finalTranscript,
            interimTranscript,
            confidence: event.results[event.resultIndex]?.[0]?.confidence || 0
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Ошибка распознавания речи:', event.error);
        if (onError) onError(event.error);
      };

      recognition.onend = () => {
        console.log('Распознавание речи завершено');
        if (onEnd) onEnd();
      };

      // Начинаем распознавание
      recognition.start();

      return {
        success: true,
        message: 'Распознавание речи запущено',
        data: {
          recognition,
          language,
          continuous,
          interimResults,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Real Speech recognition error:', error);
      return {
        success: false,
        message: 'Ошибка запуска распознавания речи',
        error: error.message
      };
    }
  },

  /**
   * Непрерывное распознавание речи
   */
  async startContinuousRecognition(params) {
    const {
      onResult,
      onError,
      onStart,
      onEnd,
      language = 'ru-RU',
      autoRestart = true
    } = params;

    try {
      const result = await this.startRealtimeRecognition({
        ...params,
        continuous: true,
        interimResults: true
      });

      if (result.success && autoRestart) {
        // Автоматически перезапускаем при завершении
        result.data.recognition.onend = () => {
          if (onEnd) onEnd();

          // Небольшая задержка перед перезапуском
          setTimeout(() => {
            try {
              result.data.recognition.start();
            } catch (error) {
              console.error('Ошибка перезапуска распознавания:', error);
            }
          }, 100);
        };
      }

      return result;

    } catch (error) {
      console.error('Continuous speech recognition error:', error);
      return {
        success: false,
        message: 'Ошибка непрерывного распознавания речи',
        error: error.message
      };
    }
  },

  /**
   * Обработка голосовых команд
   */
  async processVoiceCommands(params) {
    const {
      onCommand,
      onError,
      language = 'ru-RU',
      commandKeywords = ['открой', 'создай', 'помоги', 'найди', 'переведи']
    } = params;

    try {
      const result = await this.startRealtimeRecognition({
        ...params,
        language,
        continuous: false,
        interimResults: false
      });

      if (result.success) {
        result.data.recognition.onresult = (event) => {
          const command = event.results[0][0].transcript.toLowerCase();
          const confidence = event.results[0][0].confidence;

          // Анализируем команду
          const commandAnalysis = this.analyzeVoiceCommand(command, commandKeywords);

          if (onCommand) {
            onCommand({
              command,
              confidence,
              analysis: commandAnalysis
            });
          }
        };
      }

      return result;

    } catch (error) {
      console.error('Voice commands processing error:', error);
      return {
        success: false,
        message: 'Ошибка обработки голосовых команд',
        error: error.message
      };
    }
  },

  /**
   * Анализ голосовой команды
   */
  analyzeVoiceCommand(command, keywords) {
    const lowerCommand = command.toLowerCase();

    // Определяем намерение
    let intent = 'unknown';
    let action = null;
    const entities = {};
    let confidence = 0.5;

    // Поиск ключевых слов
    for (const keyword of keywords) {
      if (lowerCommand.includes(keyword)) {
        intent = this.getIntentFromKeyword(keyword);
        action = this.getActionFromIntent(intent);
        confidence = 0.8;
        break;
      }
    }

    // Извлечение сущностей
    if (lowerCommand.includes('настройки') || lowerCommand.includes('settings')) {
      entities.application = 'settings';
    } else if (lowerCommand.includes('чат') || lowerCommand.includes('chat')) {
      entities.application = 'chat';
    } else if (lowerCommand.includes('документ') || lowerCommand.includes('document')) {
      entities.type = 'document';
    } else if (lowerCommand.includes('заметка') || lowerCommand.includes('note')) {
      entities.type = 'note';
    }

    return {
      intent,
      action,
      entities,
      confidence,
      originalCommand: command
    };
  },

  /**
   * Получение намерения по ключевому слову
   */
  getIntentFromKeyword(keyword) {
    const intentMap = {
      'открой': 'open',
      'создай': 'create',
      'помоги': 'help',
      'найди': 'search',
      'переведи': 'translate'
    };

    return intentMap[keyword] || 'unknown';
  },

  /**
   * Получение действия по намерению
   */
  getActionFromIntent(intent) {
    const actionMap = {
      'open': 'open_application',
      'create': 'create_document',
      'help': 'show_help',
      'search': 'search_information',
      'translate': 'translate_text'
    };

    return actionMap[intent] || null;
  },

  /**
   * Остановка распознавания речи
   */
  stopRecognition(recognition) {
    if (recognition) {
      recognition.stop();
    }
  },

  /**
   * Очистка ресурсов
   */
  async cleanup() {
    console.log('Real Speech service cleaned up');
  }
};
