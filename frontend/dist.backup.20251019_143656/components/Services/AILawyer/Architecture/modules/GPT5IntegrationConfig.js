/**
 * Модуль GPT-5 Integration
 * Интеллектуальная маршрутизация и адаптивные модели
 */
export const GPT5Integration = {
    id: 'gpt5-integration',
    name: 'GPT-5 Integration',
    description: 'Интеллектуальная маршрутизация и адаптивные модели GPT-5',
    position: { x: 1, y: 1 },
    dependencies: ['raptor-engine'],
    isVisible: true,
    isExpanded: true,
    mermaidCode: `
    %% ================ GPT-5 INTEGRATION ================ %%
    subgraph GPT5_SYSTEM["🚀 GPT-5 SYSTEM"]
        ENHANCED_QPROC --> INTELLIGENT_ROUTER["🚀 Intelligent Router<br>• Анализ сложности запросов<br>• Выбор оптимальной модели<br>• Управление бюджетом<br>• Адаптивная маршрутизация"]

        INTELLIGENT_ROUTER --> GPT5_NANO["⚡ GPT-5 Nano<br>• 80% запросов<br>• Простые вопросы<br>• Быстрые ответы<br>• Время: 1-2 сек"]

        INTELLIGENT_ROUTER --> GPT5_MINI["🚀 GPT-5 Mini<br>• 15% запросов<br>• Средние задачи<br>• Баланс скорости/качества<br>• Время: 2-3 сек"]

        INTELLIGENT_ROUTER --> GPT5_STANDARD["🎯 GPT-5 Standard<br>• 5% запросов<br>• Сложные рассуждения<br>• Максимальное качество<br>• Время: 3-5 сек"]

        GPT5_NANO --> RESPONSE_GENERATOR["📝 Генератор ответов<br>• Форматирование ответов<br>• Структурированный вывод<br>• Контекстная адаптация"]

        GPT5_MINI --> RESPONSE_GENERATOR
        GPT5_STANDARD --> RESPONSE_GENERATOR

        RESPONSE_GENERATOR --> RESULT_CACHE["💾 Result Cache<br>• Кэш ответов GPT-5<br>• TTL настройки<br>• Инвалидация<br>• Статистика попаданий"]
    end

    %% Стилизация
    classDef gpt5 fill:#a78bfa,stroke:#8b5cf6,stroke-width:2px
    class GPT5_NANO,GPT5_MINI,GPT5_STANDARD,INTELLIGENT_ROUTER gpt5
  `
};
//# sourceMappingURL=GPT5IntegrationConfig.js.map