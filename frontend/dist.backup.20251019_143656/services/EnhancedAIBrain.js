/**
 * 🧠 ENHANCED AI BRAIN - Улучшенный мозг платформы
 *
 * Улучшения:
 * - Более точный анализ намерений
 * - Контекстная маршрутизация
 * - Приоритизация сервисов
 * - Умное кэширование решений
 */
import { serviceManager } from './ServiceManager';
class EnhancedAIBrainService {
    constructor() {
        this.config = {
            enableSystemCommands: true,
            enableServiceRouting: true,
            enableContextAnalysis: true,
            enableLearning: true,
            maxHistoryLength: 50,
            responseTimeout: 30000,
            confidenceThreshold: 0.7,
            learningRate: 0.1
        };
        this.context = {
            activeService: null,
            activeSection: 'workspace',
            conversationHistory: [],
            userPreferences: {},
            lastActivity: new Date(),
            serviceCapabilities: new Map(),
            userIntentHistory: []
        };
        // Кэш для быстрого доступа к решениям
        this.decisionCache = new Map();
        // Матрица обучения для улучшения решений
        this.learningMatrix = new Map();
        this.initializeServiceCapabilities();
        this.loadLearningData();
    }
    /**
     * Инициализация возможностей сервисов
     */
    initializeServiceCapabilities() {
        const capabilities = [
            // ChatGPT сервис
            {
                serviceId: 'chatgpt-service',
                capability: 'text-generation',
                confidence: 0.9,
                keywords: ['напиши', 'создай', 'сгенерируй', 'сочини', 'переведи', 'перефразируй', 'кратко', 'подведи итог'],
                examples: ['Напиши письмо', 'Переведи на английский', 'Создай план проекта']
            },
            {
                serviceId: 'chatgpt-service',
                capability: 'code-generation',
                confidence: 0.8,
                keywords: ['код', 'функция', 'программа', 'алгоритм', 'debug', 'исправь ошибку'],
                examples: ['Напиши функцию на Python', 'Исправь ошибку в коде', 'Создай алгоритм сортировки']
            },
            // Settings сервис
            {
                serviceId: 'settings',
                capability: 'theme-management',
                confidence: 0.95,
                keywords: ['тема', 'цвет', 'настройки', 'внешний вид', 'темная', 'светлая'],
                examples: ['Измени тему', 'Настрой цвета', 'Переключи на темную тему']
            },
            {
                serviceId: 'settings',
                capability: 'preferences',
                confidence: 0.9,
                keywords: ['настройки', 'предпочтения', 'конфигурация', 'параметры'],
                examples: ['Открой настройки', 'Измени параметры', 'Настрой интерфейс']
            },
            // File Manager сервис
            {
                serviceId: 'file-manager',
                capability: 'file-operations',
                confidence: 0.9,
                keywords: ['файл', 'папка', 'загрузить', 'скачать', 'удалить', 'переместить'],
                examples: ['Загрузи файл', 'Создай папку', 'Удали файл']
            }
        ];
        // Группируем по сервисам
        capabilities.forEach(cap => {
            if (!this.context.serviceCapabilities.has(cap.serviceId)) {
                this.context.serviceCapabilities.set(cap.serviceId, []);
            }
            this.context.serviceCapabilities.get(cap.serviceId).push(cap);
        });
    }
    /**
     * Улучшенный анализ намерений с контекстом
     */
    async analyzeIntentEnhanced(message) {
        const lowerMessage = message.toLowerCase();
        // Проверяем системные команды
        const systemCommands = ['/help', '/settings', '/clear', '/reset', '/status'];
        const isSystemCommand = systemCommands.some(cmd => lowerMessage.startsWith(cmd));
        if (isSystemCommand) {
            return {
                isSystemCommand: true,
                shouldRouteToService: false,
                confidence: 1.0,
                keywords: [],
                reasoning: 'Системная команда',
                alternatives: []
            };
        }
        // Анализируем намерения с учетом контекста
        const intentAnalysis = await this.performContextualAnalysis(message);
        // Применяем обучение для улучшения решений
        const learnedDecision = this.applyLearning(intentAnalysis);
        return learnedDecision;
    }
    /**
     * Контекстный анализ сообщения
     */
    async performContextualAnalysis(message) {
        const lowerMessage = message.toLowerCase();
        const candidates = [];
        // Анализируем все сервисы
        for (const [serviceId, capabilities] of this.context.serviceCapabilities) {
            for (const capability of capabilities) {
                const matchedKeywords = capability.keywords.filter(keyword => lowerMessage.includes(keyword));
                if (matchedKeywords.length > 0) {
                    const score = (matchedKeywords.length / capability.keywords.length) * capability.confidence;
                    candidates.push({
                        serviceId,
                        capability,
                        score,
                        matchedKeywords
                    });
                }
            }
        }
        // Сортируем по релевантности
        candidates.sort((a, b) => b.score - a.score);
        if (candidates.length === 0) {
            return {
                isSystemCommand: false,
                shouldRouteToService: false,
                confidence: 0,
                keywords: [],
                reasoning: 'Не найдено подходящих сервисов',
                alternatives: []
            };
        }
        const bestMatch = candidates[0];
        const alternatives = candidates.slice(1, 3).map(c => ({
            serviceId: c.serviceId,
            confidence: c.score,
            reason: `Совпадение: ${c.matchedKeywords.join(', ')}`
        }));
        // Определяем конкретный инструмент
        let toolId;
        if (bestMatch.serviceId === 'chatgpt-service') {
            toolId = this.determineChatGPTTool(lowerMessage);
        }
        else if (bestMatch.serviceId === 'settings') {
            toolId = this.determineSettingsTool(lowerMessage);
        }
        return {
            isSystemCommand: false,
            shouldRouteToService: bestMatch.score >= this.config.confidenceThreshold,
            serviceId: bestMatch.serviceId,
            toolId,
            confidence: bestMatch.score,
            keywords: bestMatch.matchedKeywords,
            reasoning: `Найдено совпадение с ${bestMatch.serviceId}: ${bestMatch.matchedKeywords.join(', ')}`,
            alternatives
        };
    }
    /**
     * Определение инструмента ChatGPT
     */
    determineChatGPTTool(message) {
        if (message.includes('переведи') || message.includes('translate')) {
            return 'translate-chatgpt';
        }
        else if (message.includes('кратко') || message.includes('summary')) {
            return 'summarize-text';
        }
        else if (message.includes('переписать') || message.includes('rewrite')) {
            return 'text-rewrite';
        }
        else if (message.includes('код') || message.includes('программа')) {
            return 'code-generation';
        }
        else {
            return 'chat-completion';
        }
    }
    /**
     * Определение инструмента настроек
     */
    determineSettingsTool(message) {
        if (message.includes('тема') || message.includes('цвет')) {
            return 'theme-settings';
        }
        else if (message.includes('язык') || message.includes('language')) {
            return 'language-settings';
        }
        else {
            return 'general-settings';
        }
    }
    /**
     * Применение обучения для улучшения решений
     */
    applyLearning(analysis) {
        const messageKey = this.generateMessageKey(analysis.keywords);
        // Проверяем кэш
        if (this.decisionCache.has(messageKey)) {
            const cached = this.decisionCache.get(messageKey);
            cached.reasoning += ' (из кэша)';
            return cached;
        }
        // Применяем матрицу обучения
        if (this.learningMatrix.has(messageKey)) {
            const learningData = this.learningMatrix.get(messageKey);
            const bestService = Array.from(learningData.entries())
                .sort(([, a], [, b]) => b - a)[0];
            if (bestService && bestService[1] > analysis.confidence) {
                analysis.serviceId = bestService[0];
                analysis.confidence = bestService[1];
                analysis.reasoning += ' (улучшено обучением)';
            }
        }
        return analysis;
    }
    /**
     * Генерация ключа для кэширования
     */
    generateMessageKey(keywords) {
        return keywords.sort().join('|');
    }
    /**
     * Загрузка данных обучения
     */
    loadLearningData() {
        // В реальной реализации здесь будет загрузка из localStorage или API
        const savedData = localStorage.getItem('ai-brain-learning');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.learningMatrix = new Map(data);
            }
            catch (error) {
                console.warn('Ошибка загрузки данных обучения:', error);
            }
        }
    }
    /**
     * Сохранение данных обучения
     */
    saveLearningData() {
        try {
            const data = Array.from(this.learningMatrix.entries());
            localStorage.setItem('ai-brain-learning', JSON.stringify(data));
        }
        catch (error) {
            console.warn('Ошибка сохранения данных обучения:', error);
        }
    }
    /**
     * Основной метод обработки сообщений
     */
    async processMessage(message, currentService = null, currentSection = 'workspace') {
        try {
            // Обновляем контекст
            this.updateContext(currentService, currentSection);
            // Анализируем намерения
            const intent = await this.analyzeIntentEnhanced(message);
            // Обрабатываем системные команды
            if (intent.isSystemCommand) {
                return await this.handleSystemCommand(message, intent);
            }
            // Маршрутизируем к сервису
            if (intent.shouldRouteToService && intent.serviceId) {
                const response = await this.routeToService(message, {
                    serviceId: intent.serviceId,
                    toolId: intent.toolId,
                    shouldRouteToService: intent.shouldRouteToService
                });
                // Сохраняем в кэш для будущего использования
                const messageKey = this.generateMessageKey(intent.keywords);
                this.decisionCache.set(messageKey, {
                    isSystemCommand: intent.isSystemCommand,
                    shouldRouteToService: intent.shouldRouteToService,
                    serviceId: intent.serviceId,
                    toolId: intent.toolId,
                    confidence: intent.confidence,
                    keywords: intent.keywords,
                    reasoning: intent.reasoning,
                    alternatives: intent.alternatives
                });
                // Обновляем матрицу обучения
                this.updateLearningMatrix(messageKey, intent.serviceId, response.success);
                return response;
            }
            // Обрабатываем как общий запрос
            return await this.handleGeneralQuery(message, intent);
        }
        catch (error) {
            console.error('Enhanced AI Brain error:', error);
            return {
                success: false,
                message: 'Произошла ошибка при обработке сообщения',
                isSystemResponse: true,
                confidence: 0,
                reasoning: 'Ошибка обработки',
                alternatives: []
            };
        }
    }
    /**
     * Обновление матрицы обучения
     */
    updateLearningMatrix(messageKey, serviceId, success) {
        if (!this.learningMatrix.has(messageKey)) {
            this.learningMatrix.set(messageKey, new Map());
        }
        const serviceMap = this.learningMatrix.get(messageKey);
        const currentScore = serviceMap.get(serviceId) || 0;
        const adjustment = success ? this.config.learningRate : -this.config.learningRate;
        const newScore = Math.max(0, Math.min(1, currentScore + adjustment));
        serviceMap.set(serviceId, newScore);
        // Сохраняем данные
        this.saveLearningData();
    }
    /**
     * Обновление контекста
     */
    updateContext(currentService, currentSection) {
        this.context.activeService = currentService;
        this.context.activeSection = currentSection;
        this.context.lastActivity = new Date();
    }
    /**
     * Обработка системных команд
     */
    async handleSystemCommand(_message, _intent) {
        // Реализация системных команд
        return {
            success: true,
            message: 'Системная команда обработана',
            isSystemResponse: true,
            confidence: 1.0,
            reasoning: 'Системная команда',
            alternatives: []
        };
    }
    /**
     * Маршрутизация к сервису
     */
    async routeToService(message, intent) {
        try {
            const result = await serviceManager.executeChatButton(intent.serviceId, {
                id: intent.toolId || 'default',
                name: 'AI Request',
                icon: 'Brain',
                description: message,
                action: intent.toolId || 'default',
                isEnabled: true
            });
            return {
                success: true,
                message: typeof result === 'string' ? result : 'Запрос обработан',
                serviceId: intent.serviceId,
                toolId: intent.toolId,
                shouldRouteToService: true,
                confidence: intent.confidence || 0.8,
                reasoning: intent.reasoning || 'Запрос обработан сервисом',
                alternatives: intent.alternatives || []
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Ошибка выполнения запроса',
                confidence: 0,
                reasoning: 'Ошибка маршрутизации',
                alternatives: []
            };
        }
    }
    /**
     * Обработка общих запросов
     */
    async handleGeneralQuery(message, intent) {
        return {
            success: true,
            message: 'Общий запрос обработан',
            confidence: 0.5,
            reasoning: 'Общий запрос без специфической маршрутизации',
            alternatives: intent.alternatives || []
        };
    }
    /**
     * Получение статистики обучения
     */
    getLearningStats() {
        const totalDecisions = this.decisionCache.size;
        let totalConfidence = 0;
        const serviceDistribution = {};
        for (const response of this.decisionCache.values()) {
            totalConfidence += response.confidence;
            if (response.serviceId) {
                serviceDistribution[response.serviceId] = (serviceDistribution[response.serviceId] || 0) + 1;
            }
        }
        return {
            totalDecisions,
            averageConfidence: totalDecisions > 0 ? totalConfidence / totalDecisions : 0,
            serviceDistribution
        };
    }
}
// Экспорт единственного экземпляра
export const enhancedAIBrain = new EnhancedAIBrainService();
//# sourceMappingURL=EnhancedAIBrain.js.map