/**
 * Настройки GPT-5 Nano для промптов
 * Основано на официальных параметрах OpenAI API
 */
// Предустановленные настройки для разных типов задач
export const PRESET_SETTINGS = {
    creative: {
        temperature: 1.2,
        top_p: 0.9,
        max_tokens: 2000,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        model: 'gpt-5-nano'
    },
    analytical: {
        temperature: 0.3,
        top_p: 0.8,
        max_tokens: 1500,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        model: 'gpt-5-nano'
    },
    balanced: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        model: 'gpt-5-nano'
    },
    precise: {
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: 800,
        frequency_penalty: -0.1,
        presence_penalty: 0.0,
        model: 'gpt-5-nano'
    }
};
// Валидация настроек
export function validateGPTSettings(settings) {
    const errors = [];
    if (settings.temperature !== undefined && (settings.temperature < 0 || settings.temperature > 2)) {
        errors.push('Temperature должен быть от 0.0 до 2.0');
    }
    if (settings.top_p !== undefined && (settings.top_p < 0 || settings.top_p > 1)) {
        errors.push('Top_p должен быть от 0.0 до 1.0');
    }
    if (settings.max_tokens !== undefined && settings.max_tokens < 1) {
        errors.push('Max_tokens должен быть больше 0');
    }
    if (settings.frequency_penalty !== undefined && (settings.frequency_penalty < -2 || settings.frequency_penalty > 2)) {
        errors.push('Frequency_penalty должен быть от -2.0 до 2.0');
    }
    if (settings.presence_penalty !== undefined && (settings.presence_penalty < -2 || settings.presence_penalty > 2)) {
        errors.push('Presence_penalty должен быть от -2.0 до 2.0');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
// Форматирование настроек для отображения
export function formatGPTSettings(settings) {
    const parts = [];
    if (settings.temperature !== undefined) {
        parts.push(`T: ${settings.temperature}`);
    }
    if (settings.top_p !== undefined) {
        parts.push(`P: ${settings.top_p}`);
    }
    if (settings.max_tokens !== undefined) {
        parts.push(`Max: ${settings.max_tokens}`);
    }
    if (settings.frequency_penalty !== undefined && settings.frequency_penalty !== 0) {
        parts.push(`Freq: ${settings.frequency_penalty}`);
    }
    if (settings.presence_penalty !== undefined && settings.presence_penalty !== 0) {
        parts.push(`Pres: ${settings.presence_penalty}`);
    }
    return parts.join(', ');
}
//# sourceMappingURL=gpt-settings.js.map