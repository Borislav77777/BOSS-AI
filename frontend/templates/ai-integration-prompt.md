# 🤖 AI ПРОМПТ ДЛЯ ИНТЕГРАЦИИ СЕРВИСОВ

## 📋 Описание

Этот промпт предназначен для автоматической интеграции новых сервисов в BARSUKOV OS с помощью AI-ассистентов (ChatGPT, Claude, Gemini и др.).

## 🎯 Цель

Создать полную интеграцию сервиса в платформу BARSUKOV OS, включая:
- JSON конфигурацию сервиса
- JavaScript модуль с логикой
- Интеграцию в интерфейс
- Настройку тем и стилей

## 📝 Промпт

```
Ты - эксперт по интеграции сервисов в BARSUKOV OS. Мне нужно интегрировать новый сервис в платформу.

ОПИСАНИЕ СЕРВИСА:
[Опиши функционал сервиса, его назначение, основные возможности]

ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ:
- API endpoints: [укажи если есть]
- Аутентификация: [укажи тип]
- Зависимости: [укажи если есть]
- Особые требования: [укажи если есть]

СОЗДАЙ ДЛЯ МЕНЯ:

1. JSON конфигурацию сервиса (public/services/[service-name].json)
2. JavaScript модуль сервиса (public/services/modules/[service-name]/index.js)
3. Инструкции по интеграции в ServiceManager
4. Примеры использования в интерфейсе

ТРЕБОВАНИЯ К КОНФИГУРАЦИИ:
- id: уникальный идентификатор
- name: понятное название
- description: описание функционала
- icon: иконка из Lucide React
- category: категория (ai, utility, analytics, communication)
- priority: приоритет (0-1000)
- tools: массив инструментов
- chatButtons: кнопки для чата
- chatFunctions: функции для чата
- theme: настройки темы

ТРЕБОВАНИЯ К МОДУЛЮ:
- Класс с методами initialize(), execute(), cleanup()
- Обработка всех инструментов из конфигурации
- Обработка ошибок
- Логирование
- Поддержка API интеграций

СТАНДАРТЫ ПЛАТФОРМЫ:
- TypeScript типизация
- Модульная архитектура
- Liquid Glass дизайн
- Адаптивный интерфейс
- Обработка ошибок
- Логирование

ПРИМЕРЫ СУЩЕСТВУЮЩИХ СЕРВИСОВ:
- Settings: системные настройки
- ChatGPT: AI-ассистент
- Widgets: управление виджетами
- FileManager: управление файлами

СОЗДАЙ ПОЛНУЮ ИНТЕГРАЦИЮ С УЧЕТОМ ВСЕХ ТРЕБОВАНИЙ ПЛАТФОРМЫ.
```

## 🔧 Примеры использования

### 1. Интеграция переводчика

```
ОПИСАНИЕ СЕРВИСА:
Сервис для перевода текста между различными языками с поддержкой множественных языков и контекстного перевода.

ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ:
- API endpoints: /translate, /detect-language, /supported-languages
- Аутентификация: API ключ
- Зависимости: fetch API
- Особые требования: поддержка контекста, определение языка
```

### 2. Интеграция калькулятора

```
ОПИСАНИЕ СЕРВИСА:
Математический калькулятор с поддержкой базовых операций, научных функций и истории вычислений.

ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ:
- API endpoints: нет (локальные вычисления)
- Аутентификация: не требуется
- Зависимости: math.js
- Особые требования: валидация выражений, обработка ошибок
```

### 3. Интеграция аналитики

```
ОПИСАНИЕ СЕРВИСА:
Сервис для анализа данных с возможностью создания графиков, статистики и отчетов.

ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ:
- API endpoints: /analyze, /generate-chart, /export-report
- Аутентификация: JWT токен
- Зависимости: Chart.js, moment.js
- Особые требования: поддержка различных форматов данных
```

## 📚 Шаблоны ответов

### JSON конфигурация

```json
{
  "id": "service-id",
  "name": "Название сервиса",
  "description": "Описание функционала",
  "icon": "IconName",
  "version": "1.0.0",
  "isActive": true,
  "category": "category",
  "priority": 100,
  "author": "BARSUKOV OS",
  "tools": [
    {
      "id": "tool-id",
      "name": "Название инструмента",
      "description": "Описание инструмента",
      "icon": "ToolIcon",
      "action": "actionName",
      "isEnabled": true,
      "category": "tool-category"
    }
  ],
  "chatButtons": [
    {
      "id": "button-id",
      "name": "Название кнопки",
      "description": "Описание кнопки",
      "icon": "ButtonIcon",
      "color": "primary",
      "isEnabled": true
    }
  ],
  "chatFunctions": [
    {
      "id": "function-id",
      "name": "Название функции",
      "description": "Описание функции",
      "icon": "FunctionIcon",
      "isEnabled": true,
      "isChatFunction": true,
      "chatApiEndpoint": "/api/endpoint",
      "chatPrompt": "Промпт для AI: {message}"
    }
  ],
  "settings": {
    "apiKey": "",
    "baseUrl": "https://api.example.com"
  },
  "theme": {
    "id": "service-theme",
    "name": "Service Theme",
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#1d4ed8",
      "accent": "#60a5fa"
    }
  },
  "dependencies": []
}
```

### JavaScript модуль

```javascript
class ServiceModule {
  constructor() {
    this.name = 'ServiceName';
    this.version = '1.0.0';
    this.apiKey = '';
    this.baseUrl = 'https://api.example.com';
  }

  async initialize() {
    console.log(`${this.name} initialized`);
    // Инициализация сервиса
  }

  async execute(toolId, params) {
    try {
      switch (toolId) {
        case 'tool-id':
          return await this.toolMethod(params);
        default:
          throw new Error(`Unknown tool: ${toolId}`);
      }
    } catch (error) {
      console.error(`Error executing tool ${toolId}:`, error);
      throw error;
    }
  }

  async toolMethod(params) {
    // Логика инструмента
    return {
      success: true,
      data: result
    };
  }

  async cleanup() {
    console.log(`${this.name} cleaned up`);
  }
}

export default ServiceModule;
```

## 🎯 Результат интеграции

После использования промпта вы получите:

1. **Готовую конфигурацию** - JSON файл с настройками сервиса
2. **Рабочий модуль** - JavaScript код с логикой сервиса
3. **Инструкции по интеграции** - пошаговое руководство
4. **Примеры использования** - код для тестирования

## 🚀 Следующие шаги

1. Скопируйте созданные файлы в соответствующие папки
2. Добавьте сервис в ServiceManager
3. Протестируйте функционал
4. Настройте тему и стили
5. Добавьте в интерфейс

## 📖 Дополнительные ресурсы

- [Конструктор сервисов](SERVICE_CONSTRUCTOR_GUIDE.md)
- [Полное руководство](COMPLETE_PLATFORM_GUIDE.md)
- [API Стандарты](API_STANDARDS.md)
- [Примеры сервисов](templates/)

---

**AI Промпт** - ваш инструмент для быстрой интеграции сервисов в BARSUKOV OS! 🤖
