/**
 * Валидатор сервисов для Service Registry
 */
export class ServiceValidator {
    constructor() {
        this.PLATFORM_VERSION = '1.0.0';
        this.REQUIRED_FIELDS = ['id', 'name', 'version', 'category'];
        this.VALID_CATEGORIES = [
            'ai', 'utility', 'communication', 'productivity', 'entertainment', 'system', 'settings',
            'file', 'time', 'transcription', 'chat', 'rewrite', 'summary', 'translation', 'commands',
            'create', 'upload', 'search', 'organize', 'analysis', 'generation', 'actions', 'business'
        ];
        this.VALID_ICONS = [
            'Bot', 'Settings', 'FileText', 'MessageCircle', 'Clock', 'Mic', 'Search', 'Download', 'Upload',
            'Edit', 'Trash', 'Save', 'Share', 'Copy', 'Paste', 'Cut', 'Undo', 'Redo', 'Play', 'Pause',
            'Stop', 'Volume', 'VolumeX', 'Volume1', 'Volume2', 'Volume3', 'Volume4', 'Volume5', 'Volume6',
            'Volume7', 'Volume8', 'Volume9', 'Volume10', 'Volume11', 'Volume12', 'Volume13', 'Volume14',
            'Volume15', 'Volume16', 'Volume17', 'Volume18', 'Volume19', 'Volume20', 'Volume21', 'Volume22',
            'Volume23', 'Volume24', 'Volume25', 'Volume26', 'Volume27', 'Volume28', 'Volume29', 'Volume30',
            'Grid', 'Cog', 'Monitor', 'Plus', 'Minus', 'Check', 'X', 'Alert', 'Info', 'Warning', 'Error',
            'Success', 'List', 'Layout', 'Palette', 'Zap', 'Lightning', 'Smile', 'BarChart3'
        ];
    }
    /**
     * Валидирует конфигурацию сервиса
     */
    validateService(service) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // Проверка обязательных полей
        this.validateRequiredFields(service, errors);
        // Проверка типов данных
        this.validateDataTypes(service, errors);
        // Проверка значений
        this.validateValues(service, errors, warnings);
        // Проверка инструментов
        this.validateTools(service, errors, warnings);
        // Проверка настроек
        this.validateSettings(service, errors, warnings);
        // Проверка чат кнопок
        this.validateChatButtons(service, errors, warnings);
        // Проверка темы
        this.validateTheme(service, errors, warnings);
        // Проверка зависимостей
        if (service.dependencies && Array.isArray(service.dependencies)) {
            service.dependencies.forEach(dep => {
                if (typeof dep !== 'string') {
                    errors.push(`Зависимость должна быть строкой: ${dep}`);
                }
                else if (dep.trim() === '') {
                    errors.push('Пустая зависимость недопустима');
                }
                else if (!this.isValidServiceId(dep)) {
                    warnings.push(`Некорректный ID зависимости: ${dep}`);
                }
            });
        }
        // Предложения по улучшению
        this.generateSuggestions(service, suggestions);
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }
    /**
     * Валидирует зависимости сервиса
     */
    validateDependencies(service) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        if (service.dependencies && Array.isArray(service.dependencies)) {
            service.dependencies.forEach(dep => {
                if (typeof dep !== 'string') {
                    errors.push(`Зависимость должна быть строкой: ${dep}`);
                }
                else if (dep.trim() === '') {
                    errors.push('Пустая зависимость недопустима');
                }
                else if (!this.isValidServiceId(dep)) {
                    warnings.push(`Некорректный ID зависимости: ${dep}`);
                }
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }
    /**
     * Проверяет конфликты между сервисами
     */
    checkConflicts(service, existingServices) {
        const conflicts = [];
        // Проверка дублирования ID
        const duplicateId = existingServices.find(s => s.id === service.id);
        if (duplicateId) {
            conflicts.push(`Сервис с ID '${service.id}' уже зарегистрирован`);
        }
        // Проверка конфликтов по приоритету
        const samePriority = existingServices.find(s => s.priority === service.priority);
        if (samePriority) {
            conflicts.push(`Сервис '${samePriority.name}' уже использует приоритет ${service.priority}`);
        }
        // Проверка конфликтов по иконкам
        const sameIcon = existingServices.find(s => s.icon === service.icon);
        if (sameIcon) {
            conflicts.push(`Сервис '${sameIcon.name}' уже использует иконку '${service.icon}'`);
        }
        return conflicts;
    }
    validateRequiredFields(service, errors) {
        this.REQUIRED_FIELDS.forEach(field => {
            if (!(field in service) || service[field] === undefined) {
                errors.push(`Отсутствует обязательное поле: ${field}`);
            }
        });
    }
    validateDataTypes(service, errors) {
        if (typeof service.id !== 'string') {
            errors.push('Поле id должно быть строкой');
        }
        if (typeof service.name !== 'string') {
            errors.push('Поле name должно быть строкой');
        }
        if (typeof service.version !== 'string') {
            errors.push('Поле version должно быть строкой');
        }
        if (typeof service.category !== 'string') {
            errors.push('Поле category должно быть строкой');
        }
        if (typeof service.isActive !== 'boolean') {
            errors.push('Поле isActive должно быть булевым');
        }
        if (typeof service.priority !== 'number') {
            errors.push('Поле priority должно быть числом');
        }
        if (!Array.isArray(service.tools)) {
            errors.push('Поле tools должно быть массивом');
        }
        if (!Array.isArray(service.dependencies)) {
            errors.push('Поле dependencies должно быть массивом');
        }
    }
    validateValues(service, errors, warnings) {
        // Проверка ID
        if (service.id && !this.isValidServiceId(service.id)) {
            errors.push('ID сервиса должен содержать только буквы, цифры, дефисы и подчеркивания');
        }
        // Проверка версии
        if (service.version && !this.isValidVersion(service.version)) {
            errors.push('Версия должна быть в формате semver (например, 1.0.0)');
        }
        // Проверка категории
        if (service.category && !this.VALID_CATEGORIES.includes(service.category)) {
            warnings.push(`Неизвестная категория: ${service.category}. Рекомендуемые: ${this.VALID_CATEGORIES.join(', ')}`);
        }
        // Проверка иконки
        if (service.icon && !this.VALID_ICONS.includes(service.icon)) {
            warnings.push(`Неизвестная иконка: ${service.icon}. Рекомендуемые: ${this.VALID_ICONS.slice(0, 10).join(', ')}...`);
        }
        // Проверка приоритета
        if (service.priority < 0 || service.priority > 1000) {
            warnings.push('Приоритет должен быть от 0 до 1000');
        }
    }
    validateTools(service, errors, warnings) {
        if (!Array.isArray(service.tools))
            return;
        service.tools.forEach((tool, index) => {
            if (!tool.id) {
                errors.push(`Инструмент ${index}: отсутствует ID`);
            }
            if (!tool.name) {
                errors.push(`Инструмент ${index}: отсутствует название`);
            }
            if (!tool.description) {
                warnings.push(`Инструмент ${index}: отсутствует описание`);
            }
            if (!tool.icon) {
                warnings.push(`Инструмент ${index}: отсутствует иконка`);
            }
            if (typeof tool.isEnabled !== 'boolean') {
                errors.push(`Инструмент ${index}: isEnabled должно быть булевым`);
            }
        });
    }
    validateSettings(service, errors, _warnings) {
        if (service.settings && typeof service.settings !== 'object') {
            errors.push('Настройки должны быть объектом');
        }
    }
    validateChatButtons(service, errors, _warnings) {
        if (!service.chatButtons)
            return;
        if (!Array.isArray(service.chatButtons)) {
            errors.push('chatButtons должно быть массивом');
            return;
        }
        service.chatButtons.forEach((button, index) => {
            if (!button.id) {
                errors.push(`Кнопка чата ${index}: отсутствует ID`);
            }
            if (!button.name) {
                errors.push(`Кнопка чата ${index}: отсутствует название`);
            }
            if (!button.action) {
                errors.push(`Кнопка чата ${index}: отсутствует действие`);
            }
            if (button.position && !['top', 'bottom'].includes(button.position)) {
                errors.push(`Кнопка чата ${index}: неверная позиция '${button.position}'`);
            }
        });
    }
    validateTheme(service, errors, warnings) {
        if (service.theme) {
            if (!service.theme.id) {
                errors.push('Тема сервиса: отсутствует ID');
            }
            if (!service.theme.name) {
                errors.push('Тема сервиса: отсутствует название');
            }
            if (!service.theme.colors) {
                warnings.push('Тема сервиса: отсутствуют цвета');
            }
        }
    }
    generateSuggestions(service, suggestions) {
        // Предложения по улучшению
        if (!service.description || service.description.length < 10) {
            suggestions.push('Добавьте более подробное описание сервиса');
        }
        if (!service.author) {
            suggestions.push('Укажите автора сервиса');
        }
        if (service.tools && service.tools.length === 0) {
            suggestions.push('Добавьте хотя бы один инструмент');
        }
        if (!service.chatButtons || service.chatButtons.length === 0) {
            suggestions.push('Добавьте кнопки для чата для лучшей интеграции');
        }
        if (!service.theme) {
            suggestions.push('Добавьте тему для улучшения внешнего вида');
        }
        if (service.priority === 0) {
            suggestions.push('Установите приоритет для правильной сортировки');
        }
    }
    isValidServiceId(id) {
        return /^[a-zA-Z0-9_-]+$/.test(id);
    }
    isValidVersion(version) {
        return /^\d+\.\d+\.\d+$/.test(version);
    }
}
//# sourceMappingURL=ServiceValidator.js.map