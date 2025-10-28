# 🚀 РУКОВОДСТВО ПО ИНТЕГРАЦИИ СЕРВИСОВ BARSUKOV OS

## 📋 ОГЛАВЛЕНИЕ

1. [Быстрый старт](#-быстрый-старт)
2. [Структура сервиса](#-структура-сервиса)
3. [Создание JSON конфигурации](#-создание-json-конфигурации)
4. [Создание модуля сервиса](#-создание-модуля-сервиса)
5. [Регистрация в ServiceManager](#-регистрация-в-servicemanager)
6. [Создание React компонента](#-создание-react-компонента)
7. [Интеграция в App.tsx](#-интеграция-в-apptsx)
8. [Стилизация сервиса](#-стилизация-сервиса)
9. [Тестирование](#-тестирование)
10. [Лучшие практики](#-лучшие-практики)

## ⚡ БЫСТРЫЙ СТАРТ (Drop‑in)

### Минимальный сервис за 5 минут

1. **Создайте JSON конфигурацию** в `public/services/`
2. **Создайте модуль** в `public/services/modules/`
3. **(Опционально)** Создайте React компонент в `src/components/`
4. Перезапустите dev‑сервер — сервис появится автоматически
5. В консоли выполните `serviceManager.validateAllServices()` для быстрой валидации

## 🏗️ СТРУКТУРА СЕРВИСА

```
public/services/
├── my-service.json              # Конфигурация сервиса
└── modules/
    └── my-service/
        └── index.js             # Модуль сервиса

src/components/
└── MyService/
    ├── index.ts                 # Экспорт компонента
    └── MyService.tsx            # React компонент
```

## 📄 СОЗДАНИЕ JSON КОНФИГУРАЦИИ

### Базовый шаблон `my-service.json` (идеальные поля)

```json
{
  "id": "my-service",
  "name": "Мой сервис",
  "description": "Описание функционала сервиса",
  "icon": "Zap",
  "version": "1.0.0",
  "isActive": true,
  "category": "utility",
  "priority": 100,
  "author": "Ваше имя",
  "tools": [
    {
      "id": "my-tool",
      "name": "Мой инструмент",
      "description": "Описание инструмента",
      "icon": "Wand2",
      "action": "my-tool",
      "isEnabled": true,
      "category": "main"
    }
  ],
  "settings": {},
  "dependencies": [],
  "chatFunctions": [
    {
      "id": "my-tool",
      "name": "Чат‑инструмент",
      "description": "Использование в чате",
      "isChatFunction": true,
      "chatPrompt": "Выполни действие: {userInput}"
    }
  ],
  "chatButtons": [
    {
      "id": "run-my-tool",
      "name": "Запустить",
      "description": "Выполнить действие",
      "icon": "Zap",
      "action": "my-tool",
      "isEnabled": true,
      "position": "top"
    }
  ]
}
```

### Обязательные поля

- `id` — уникальный идентификатор
- `name` — отображаемое имя
- `description` — описание
- `icon` — иконка из lucide-react
- `version` — версия сервиса
- `isActive` — активен ли сервис
- `category` — категория сервиса
- `priority` — порядок сортировки (меньше = выше)

### Опциональные поля

- `tools[]` — инструменты сервиса (рекомендуется `action = id`)
- `settings` — настройки по умолчанию
- `dependencies` — зависимости
- `chatFunctions[]` — функции чата (`id`, `action = id`)
- `chatButtons[]` — кнопки чата (`position` ∈ {`top`,`bottom`}, `action` указывает на существующий tool)
- `theme` — тема сервиса

## 🔧 СОЗДАНИЕ МОДУЛЯ СЕРВИСА

### Базовый шаблон `public/services/modules/my-service/index.js`

```javascript
/**
 * Модуль сервиса "Мой сервис"
 */

class MyServiceModule {
  async initialize() {
    return true;
  }

  async myTool(params = {}) {
    try {
      // Ваша логика
      return { success: true, message: 'Действие выполнено успешно', data: params };
    } catch (error) {
      return { success: false, message: 'Ошибка выполнения действия', error: String(error) };
    }
  }

  async cleanup() {}
}

export default new MyServiceModule();
```

## 🔄 РЕГИСТРАЦИЯ В SERVICEMANAGER

Drop‑in: ServiceManager автоматически загрузит `public/services/*.json` и, при необходимости, подключит модуль. Дополнительно можно вызвать `serviceManager.validateAllServices()` для валидации/нормализации.

## ⚛️ СОЗДАНИЕ REACT КОМПОНЕНТА

(Опционально) Создайте UI‑компонент для вашего сервиса и подключите его на соответствующем экране.

## 🎨 СТИЛИЗАЦИЯ СЕРВИСА

Используйте существующие утилитарные классы и Liquid Glass систему.

## 🧪 ТЕСТИРОВАНИЕ

1. `console.log(serviceManager.services)` — проверка загрузки
2. `serviceManager.executeTool('<serviceId>','<toolId>')` — проверка вызова
3. Кнопки чата — проверьте `top/bottom` и выполнение `action`

## 🔌 ИНТЕГРАЦИЯ С ЧАТ‑ПАНЕЛЬЮ (КНОПКИ И МОДЕЛИ)

Чат по умолчанию — «чистый»: без кнопок и выбора моделей. Сервисы могут надстраивать функционал, добавляя свои кнопки и, при необходимости, управление моделями.

### Добавление кнопок в чат

1) В `public/services/<serviceId>.json` добавьте `chatButtons`.

Пример (кнопка в верхнем блоке):

```json
{
  "id": "my-service",
  "chatButtons": [
    {
      "id": "run-my-tool",
      "name": "Запустить",
      "description": "Выполнить действие",
      "icon": "Zap",
      "action": "my-tool",
      "isEnabled": true,
      "position": "top"
    }
  ]
}
```

2) `action` должен ссылаться на существующий `tools[].id` сервиса. Вызов проходит через `serviceManager.executeChatButton(serviceId, button)`.

3) Для нижней панели используйте `position: "bottom"`. Нижняя панель отображается ТОЛЬКО если есть хотя бы одна bottom‑группа.

### Где появятся кнопки

- Верхняя область (над сообщениями) — `top` группы.
- Нижняя панель (над полем ввода) — `bottom` группы (рендерится только при наличии).

### Выбор модели (ModelSelector)

- Показывается ТОЛЬКО когда сервисы добавили хотя бы одну группу кнопок (top или bottom). Чистый чат — без ModelSelector.
- Если нужен кастомный выбор моделей, добавляйте соответствующие кнопки и обрабатывайте логику на стороне сервиса (через `chatFunctions`/`tools`).

### Локальная проверка при разработке

- После изменения JSON: перезапустите dev‑сервер или вызовите `serviceManager.validateAllServices()`.
- Проверьте, что:
  - Кнопки видны в правильной зоне (`top`/`bottom`).
  - Клик вызывает ваш `tool` и возвращает человекочитаемый результат.
  - Чтобы чат добавил ответ как сообщение, верните контракт:

```json
{ "isChatResponse": true, "message": "Ваш результат обработки" }
```

Если контракт не соблюдён, чат добавит fallback‑сообщение из `button.description` или `button.name`.

## 📚 ЛУЧШИЕ ПРАКТИКИ

- `action = id` для инструментов и чат‑функций
- Для кнопок чата `action` должен ссылаться на существующий `tool.id`
- Не храните секреты в JSON; используйте прокси/ENV
- Добавляйте краткий `chatPrompt` для понятных ответов чата

---

**Создано для BARSUKOV OS v2.5**
*Последнее обновление: 2025*
