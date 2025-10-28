/**
 * BOSS AI - BARSUKOV OS SUPER AI
 * Центральный обработчик запросов
 *
 * Определяет какой сервис использовать и как обрабатывать запросы
 */
import { serviceManager } from './ServiceManager';
class BossAI {
    constructor() {
        this.activeModes = new Map();
        this.availableModes = [];
        this.initializeModes();
    }
    /**
     * Инициализация доступных режимов от всех сервисов
     */
    initializeModes() {
        this.availableModes = [
            // ChatGPT режимы
            {
                id: 'chatgpt-analysis',
                name: 'Глубокое исследование',
                description: 'Детальный анализ и исследование темы',
                icon: 'Search',
                serviceId: 'chatgpt-service',
                isActive: false,
                priority: 1,
                capabilities: ['analysis', 'research', 'explanation'],
                promptTemplate: 'Проведи глубокое исследование темы: {userInput}. Рассмотри все аспекты, приведи примеры и сделай выводы.',
                responseFormat: 'markdown'
            },
            {
                id: 'chatgpt-generation',
                name: 'Генерация контента',
                description: 'Создание текстов, идей и решений',
                icon: 'Wand2',
                serviceId: 'chatgpt-service',
                isActive: false,
                priority: 2,
                capabilities: ['generation', 'creativity', 'writing'],
                promptTemplate: 'Создай качественный контент на тему: {userInput}. Используй креативный подход и современные методы.',
                responseFormat: 'text'
            },
            {
                id: 'chatgpt-summary',
                name: 'Краткое изложение',
                description: 'Сжатие и структурирование информации',
                icon: 'FileText',
                serviceId: 'chatgpt-service',
                isActive: false,
                priority: 3,
                capabilities: ['summarization', 'structuring', 'clarity'],
                promptTemplate: 'Создай краткое и структурированное изложение: {userInput}. Выдели ключевые моменты.',
                responseFormat: 'markdown'
            },
            // AI Assistant режимы
            {
                id: 'ai-legal-consultation',
                name: 'Юридическая консультация',
                description: 'Правовые советы и анализ документов',
                icon: 'Scale',
                serviceId: 'ai-assistant',
                isActive: false,
                priority: 1,
                capabilities: ['legal', 'analysis', 'advice'],
                promptTemplate: 'Предоставь юридическую консультацию по вопросу: {userInput}. Укажи правовые нормы и рекомендации.',
                responseFormat: 'markdown'
            },
            {
                id: 'ai-contract-generation',
                name: 'Создание договора',
                description: 'Генерация правовых документов',
                icon: 'FileText',
                serviceId: 'ai-assistant',
                isActive: false,
                priority: 2,
                capabilities: ['legal', 'generation', 'documents'],
                promptTemplate: 'Создай договор на основе требований: {userInput}. Включи все необходимые пункты.',
                responseFormat: 'text'
            },
            {
                id: 'ai-task-creation',
                name: 'Создание задачи',
                description: 'Планирование и структурирование задач',
                icon: 'CheckSquare',
                serviceId: 'ai-assistant',
                isActive: false,
                priority: 3,
                capabilities: ['planning', 'organization', 'productivity'],
                promptTemplate: 'Создай структурированный план задач для: {userInput}. Разбей на этапы и приоритеты.',
                responseFormat: 'markdown'
            }
        ];
    }
    /**
     * Анализ пользовательского запроса и определение подходящих режимов
     */
    async analyzeUserIntent(userInput) {
        const input = userInput.toLowerCase();
        const matchedModes = [];
        // Ключевые слова для определения намерений
        const intentKeywords = {
            'analysis': ['анализ', 'исследование', 'изучить', 'разобрать', 'проанализировать'],
            'generation': ['создать', 'написать', 'сгенерировать', 'придумать', 'разработать'],
            'legal': ['юрист', 'право', 'договор', 'консультация', 'правовой', 'юридический'],
            'planning': ['план', 'задача', 'организовать', 'спланировать', 'структурировать'],
            'summary': ['кратко', 'суть', 'изложение', 'резюме', 'сжать']
        };
        // Поиск совпадений
        for (const [intent, keywords] of Object.entries(intentKeywords)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                const relevantModes = this.availableModes.filter(mode => mode.capabilities.some(cap => cap.includes(intent)));
                matchedModes.push(...relevantModes);
            }
        }
        // Если не найдено совпадений, предлагаем общие режимы
        if (matchedModes.length === 0) {
            matchedModes.push(this.availableModes.find(mode => mode.id === 'chatgpt-analysis'), this.availableModes.find(mode => mode.id === 'ai-legal-consultation'));
        }
        return matchedModes.slice(0, 3); // Максимум 3 режима
    }
    /**
     * Активация режима
     */
    async activateMode(modeId, userInput) {
        const mode = this.availableModes.find(m => m.id === modeId);
        if (!mode) {
            throw new Error(`Режим ${modeId} не найден`);
        }
        const activation = {
            modeId,
            serviceId: mode.serviceId,
            activatedAt: new Date(),
            context: { userInput },
            userIntent: userInput
        };
        this.activeModes.set(modeId, activation);
        mode.isActive = true;
        return activation;
    }
    /**
     * Обработка запроса через активированный режим
     */
    async processRequest(modeId, userInput) {
        const activation = this.activeModes.get(modeId);
        if (!activation) {
            throw new Error(`Режим ${modeId} не активирован`);
        }
        const mode = this.availableModes.find(m => m.id === modeId);
        if (!mode) {
            throw new Error(`Режим ${modeId} не найден`);
        }
        // Формируем промпт на основе шаблона режима (используется в serviceManager.executeChatButton)
        // const prompt = mode.promptTemplate?.replace('{userInput}', userInput) || userInput;
        // Выполняем запрос через соответствующий сервис
        const response = await serviceManager.executeChatButton(mode.serviceId, {
            id: modeId,
            name: mode.name,
            description: mode.description,
            icon: mode.icon,
            action: modeId,
            isEnabled: true,
            color: 'blue'
        });
        // Формируем ответ
        const aiResponse = {
            mode,
            response: typeof response === 'string' ? response : JSON.stringify(response),
            suggestions: this.generateSuggestions(mode, userInput),
            nextActions: this.generateNextActions(mode),
            confidence: 0.85
        };
        return aiResponse;
    }
    /**
     * Генерация предложений для пользователя
     */
    generateSuggestions(mode, _userInput) {
        const suggestions = [];
        if (mode.capabilities.includes('legal')) {
            suggestions.push('Нужна ли дополнительная правовая информация?');
            suggestions.push('Хотите создать документ на основе этого?');
        }
        if (mode.capabilities.includes('analysis')) {
            suggestions.push('Углубиться в детали?');
            suggestions.push('Рассмотреть альтернативные подходы?');
        }
        if (mode.capabilities.includes('generation')) {
            suggestions.push('Создать дополнительные варианты?');
            suggestions.push('Развить идею дальше?');
        }
        return suggestions;
    }
    /**
     * Генерация следующих действий
     */
    generateNextActions(mode) {
        const actions = [];
        if (mode.capabilities.includes('legal')) {
            actions.push('Создать договор');
            actions.push('Найти похожие случаи');
        }
        if (mode.capabilities.includes('analysis')) {
            actions.push('Создать диаграмму');
            actions.push('Экспортировать результаты');
        }
        return actions;
    }
    /**
     * Получение активных режимов
     */
    getActiveModes() {
        return Array.from(this.activeModes.values());
    }
    /**
     * Деактивация режима
     */
    deactivateMode(modeId) {
        this.activeModes.delete(modeId);
        const mode = this.availableModes.find(m => m.id === modeId);
        if (mode) {
            mode.isActive = false;
        }
    }
    /**
     * Получение всех доступных режимов
     */
    getAvailableModes() {
        return this.availableModes;
    }
}
export const bossAI = new BossAI();
//# sourceMappingURL=BarsukovAI.js.map