# 🏗️ КОНСТРУКТОР СЕРВИСОВ BARSUKOV OS

## 📋 ОБЗОР СИСТЕМЫ

BARSUKOV OS использует модульную архитектуру сервисов, где каждый сервис состоит из:

- **JSON конфигурации** - метаданные и настройки
- **JavaScript модуля** - логика выполнения
- **React компонента** - пользовательский интерфейс (опционально)

## 🎯 ТИПЫ СЕРВИСОВ

### 1. **СИСТЕМНЫЕ СЕРВИСЫ** (System Services)

- **Назначение**: Основная функциональность платформы
- **Примеры**: Settings, Workspace, Notifications
- **Особенности**: Встроены в платформу, не удаляются

### 2. **ИНТЕГРИРОВАННЫЕ СЕРВИСЫ** (Integrated Services)

- **Назначение**: Внешние API и сервисы
- **Примеры**: ChatGPT, AI Assistant, File Manager
- **Особенности**: Подключаются через API, могут быть отключены

### 3. **ВИДЖЕТ-СЕРВИСЫ** (Widget Services)

- **Назначение**: Управление виджетами и компонентами
- **Примеры**: Widgets Service, Theme Service
- **Особенности**: Создают и управляют UI компонентами

### 4. **МИКРОСЕРВИСЫ** (Microservices)

- **Назначение**: Специализированные функции
- **Примеры**: Time Service, Whisper Service, Hotkeys Service
- **Особенности**: Легковесные, выполняют одну задачу

## 🛠️ КОНСТРУКТОР СЕРВИСОВ

### ШАГ 1: СОЗДАНИЕ JSON КОНФИГУРАЦИИ

Создайте файл `public/services/your-service.json`:

```json
{
  "id": "your-service-id",
  "name": "Название сервиса",
  "description": "Описание функциональности",
  "icon": "IconName",
  "version": "1.0.0",
  "isActive": true,
  "category": "System|Integrated|Widget|Microservice",
  "priority": 50,
  "author": "Ваше имя",
  "tools": [
    {
      "id": "tool-id",
      "name": "Название инструмента",
      "description": "Описание инструмента",
      "isChatFunction": true,
      "chatPrompt": "Промпт для чата: {parameter}",
      "chatApiEndpoint": "/api/your-service/endpoint",
      "inputSchema": {
        "type": "object",
        "properties": {
          "parameter": {
            "type": "string",
            "description": "Описание параметра"
          }
        },
        "required": ["parameter"]
      },
      "outputSchema": {
        "type": "object",
        "properties": {
          "result": {
            "type": "string",
            "description": "Результат выполнения"
          }
        }
      }
    }
  ],
  "settings": [
    {
      "id": "setting-id",
      "name": "Название настройки",
      "type": "boolean|string|number|select",
      "options": [
        { "label": "Опция 1", "value": "value1" }
      ],
      "defaultValue": "default",
      "description": "Описание настройки"
    }
  ],
  "theme": {
    "accentColor": "#3b82f6",
    "backgroundColor": "#1e1b4b",
    "textColor": "#e0e7ff"
  }
}
```

### ШАГ 2: СОЗДАНИЕ JAVASCRIPT МОДУЛЯ

Создайте файл `public/services/modules/your-service/index.js`:

```javascript
/**
 * Your Service Module
 *
 * Описание функциональности сервиса
 */

export default {
  /**
   * Инициализация сервиса
   */
  async initialize() {
    console.log('Your service initialized');
  },

  /**
   * Выполнение инструмента сервиса
   */
  async execute(toolId, params) {
    console.log(`Executing tool: ${toolId}`, params);

    switch (toolId) {
      case 'tool-id':
        return await this.handleTool(params);

      default:
        throw new Error(`Unknown tool: ${toolId}`);
    }
  },

  /**
   * Обработка конкретного инструмента
   */
  async handleTool(params) {
    try {
      // Ваша логика здесь
      const result = await this.processData(params);

      return {
        success: true,
        message: 'Операция выполнена успешно',
        data: result,
        isChatResponse: true
      };
    } catch (error) {
      console.error('Tool execution error:', error);
      return {
        success: false,
        message: 'Ошибка выполнения операции',
        error: error.message
      };
    }
  },

  /**
   * Обработка данных
   */
  async processData(params) {
    // Ваша бизнес-логика
    return { processed: true, input: params };
  },

  /**
   * Очистка ресурсов
   */
  async cleanup() {
    console.log('Your service cleaned up');
  }
};
```

### ШАГ 3: РЕГИСТРАЦИЯ СЕРВИСА

Добавьте сервис в `src/services/ServiceManager.ts`:

```typescript
const serviceFiles = [
  'ai-assistant.json',
  'example-service.json',
  'file-manager.json',
  'settings.json',
  'chatgpt-service.json',
  'widgets-service.json',
  'your-service.json' // ← ДОБАВЬТЕ ЗДЕСЬ
];
```

### ШАГ 4: ДОБАВЛЕНИЕ ИКОНКИ (если нужно)

В `src/components/Sidebar/Sidebar.tsx`:

```typescript
const iconMap = useMemo(() => ({
  // ... существующие иконки
  'Название сервиса': YourIcon, // ← ДОБАВЬТЕ ЗДЕСЬ
}), []);
```

### ШАГ 5: СОЗДАНИЕ UI КОМПОНЕНТА (опционально)

Если сервис нуждается в собственном интерфейсе, создайте компонент:

```typescript
// src/components/Services/YourServiceComponent.tsx
import React from 'react';

interface YourServiceComponentProps {
  // Ваши пропсы
}

export const YourServiceComponent: React.FC<YourServiceComponentProps> = ({
  // Ваши пропсы
}) => {
  return (
    <div className="your-service-component">
      {/* Ваш UI */}
    </div>
  );
};
```

И добавьте в `src/App.tsx`:

```typescript
{state.layout.activeService === 'your-service-id' && (
  <div className="h-full p-6">
    <YourServiceComponent />
  </div>
)}
```

## 🔧 СПЕЦИАЛЬНЫЕ ТИПЫ СЕРВИСОВ

### ВИДЖЕТ-СЕРВИСЫ

Для сервисов, управляющих виджетами:

```json
{
  "id": "widgets-service",
  "name": "Виджеты",
  "category": "Widget",
  "tools": [
    {
      "id": "create-widget",
      "name": "Создать виджет",
      "isChatFunction": true,
      "chatPrompt": "Создай виджет {widgetType}",
      "inputSchema": {
        "type": "object",
        "properties": {
          "widgetType": {
            "type": "string",
            "enum": ["voice-widget", "time-widget"]
          }
        }
      }
    }
  ]
}
```

### МИКРОСЕРВИСЫ

Для легковесных сервисов:

```json
{
  "id": "time-service",
  "name": "Time Service",
  "category": "Microservice",
  "priority": 90,
  "tools": [
    {
      "id": "get-current-time",
      "name": "Получить текущее время",
      "isChatFunction": true,
      "chatPrompt": "Какое сейчас время?"
    }
  ]
}
```

## 🎨 ТЕМАТИЗАЦИЯ СЕРВИСОВ

### ЦВЕТОВАЯ СХЕМА

```json
{
  "theme": {
    "accentColor": "#3b82f6",      // Основной цвет
    "backgroundColor": "#1e1b4b",  // Фон
    "textColor": "#e0e7ff"         // Текст
  }
}
```

### CSS ПЕРЕМЕННЫЕ

```css
.your-service {
  --service-accent: #3b82f6;
  --service-background: #1e1b4b;
  --service-text: #e0e7ff;
}
```

## 🔄 ИНТЕГРАЦИЯ С AI BRAIN

### ОБРАБОТКА КОМАНД

В `src/services/AIBrain.ts`:

```typescript
private serviceCommands = {
  'your-service': {
    keywords: ['ключевое', 'слово', 'команда'],
    tools: {
      'tool-id': ['параметр1', 'параметр2']
    }
  }
};
```

### МАРШРУТИЗАЦИЯ

```typescript
private analyzeIntent(message: string): IntentAnalysis {
  // Анализ намерений для вашего сервиса
  if (this.containsKeywords(message, this.serviceCommands['your-service'].keywords)) {
    return {
      isSystemCommand: false,
      shouldRouteToService: true,
      serviceId: 'your-service',
      toolId: 'tool-id',
      confidence: 0.8,
      keywords: ['найденные', 'ключевые', 'слова']
    };
  }
}
```

## 📊 МОНИТОРИНГ И ЛОГИРОВАНИЕ

### ЛОГИРОВАНИЕ

```javascript
// В модуле сервиса
console.log(`[${this.constructor.name}] Operation started`);
console.error(`[${this.constructor.name}] Error:`, error);
```

### МЕТРИКИ

```javascript
// Отправка метрик
this.sendMetrics({
  service: 'your-service',
  operation: 'tool-execution',
  duration: Date.now() - startTime,
  success: true
});
```

## 🧪 ТЕСТИРОВАНИЕ

### UNIT ТЕСТЫ

```typescript
// src/test/YourService.test.ts
import { YourServiceModule } from '../services/modules/your-service';

describe('YourService', () => {
  test('should execute tool correctly', async () => {
    const service = new YourServiceModule();
    const result = await service.execute('tool-id', { param: 'value' });
    expect(result.success).toBe(true);
  });
});
```

### ИНТЕГРАЦИОННЫЕ ТЕСТЫ

```typescript
// src/test/ServiceIntegration.test.ts
describe('Service Integration', () => {
  test('should load service from config', async () => {
    const serviceManager = new ServiceManager();
    await serviceManager.loadAllServices();
    const service = serviceManager.getService('your-service');
    expect(service).toBeDefined();
  });
});
```

## 🚀 РАЗВЕРТЫВАНИЕ

### АВТОМАТИЧЕСКОЕ РАЗВЕРТЫВАНИЕ

1. Поместите файлы в правильные директории
2. Добавьте сервис в `ServiceManager.ts`
3. Перезапустите приложение
4. Сервис автоматически загрузится

### ПРОВЕРКА РАБОТОСПОСОБНОСТИ

```bash
# Проверка конфигурации
npm run validate-services

# Тестирование сервиса
npm run test-service your-service

# Запуск в режиме разработки
npm run dev
```

## 📚 ЛУЧШИЕ ПРАКТИКИ

### 1. **ИМЕНОВАНИЕ**

- Используйте kebab-case для ID: `my-awesome-service`
- Описательные имена: `file-manager`, `ai-assistant`
- Версионирование: `v1.0.0`, `v2.1.3`

### 2. **СТРУКТУРА КОДА**

- Разделяйте логику по функциям
- Используйте async/await
- Обрабатывайте ошибки
- Логируйте важные операции

### 3. **ПРОИЗВОДИТЕЛЬНОСТЬ**

- Кэшируйте результаты
- Используйте debouncing для частых операций
- Минимизируйте DOM манипуляции
- Оптимизируйте bundle size

### 4. **БЕЗОПАСНОСТЬ**

- Валидируйте входные данные
- Санитизируйте пользовательский ввод
- Используйте HTTPS для API
- Ограничивайте права доступа

### 5. **ДОКУМЕНТАЦИЯ**

- Комментируйте сложную логику
- Описывайте API endpoints
- Создавайте примеры использования
- Ведите changelog

## 🔍 ОТЛАДКА

### ОБЩИЕ ПРОБЛЕМЫ

1. **Сервис не загружается**
   - Проверьте JSON синтаксис
   - Убедитесь, что файл в правильной директории
   - Проверьте консоль на ошибки

2. **Инструмент не выполняется**
   - Проверьте toolId в switch case
   - Убедитесь в правильности параметров
   - Проверьте логи в консоли

3. **UI не отображается**
   - Проверьте импорты компонентов
   - Убедитесь в правильности роутинга
   - Проверьте CSS классы

### ИНСТРУМЕНТЫ ОТЛАДКИ

```javascript
// Включение debug режима
localStorage.setItem('debug', 'your-service:*');

// Логирование всех операций
console.log('Service state:', serviceManager.getService('your-service'));

// Проверка конфигурации
console.log('Service config:', service.config);
```

## 📈 МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ

### МЕТРИКИ СЕРВИСОВ

```javascript
// Время выполнения
const startTime = performance.now();
await service.execute(toolId, params);
const duration = performance.now() - startTime;

// Использование памяти
const memoryUsage = process.memoryUsage();

// Количество вызовов
this.callCount++;
```

### DASHBOARD

```typescript
// src/components/Monitoring/ServiceDashboard.tsx
export const ServiceDashboard = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(serviceManager.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="service-dashboard">
      {/* Отображение метрик */}
    </div>
  );
};
```

---

## 🎯 ЗАКЛЮЧЕНИЕ

Конструктор сервисов BARSUKOV OS предоставляет мощный и гибкий способ создания и интеграции новых сервисов. Следуя этому руководству, вы сможете:

- ✅ Создавать сервисы любого типа
- ✅ Интегрировать их с AI Brain
- ✅ Настраивать темы и стили
- ✅ Тестировать и отлаживать
- ✅ Мониторить производительность

**Удачной разработки!** 🚀
