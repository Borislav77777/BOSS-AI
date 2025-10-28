# 📚 ДОКУМЕНТАЦИЯ СЕРВИСОВ Boss Ai

## 🎯 ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА ДОКУМЕНТИРОВАНИЯ

### ⚠️ КРИТИЧЕСКИ ВАЖНО

- **КАЖДЫЙ сервис ДОЛЖЕН иметь подробную документацию**
- **ВСЕ изменения в сервисах ДОЛЖНЫ отражаться в документации**
- **Документация ДОЛЖНА быть актуальной на 100%**
- **При добавлении нового сервиса - СРАЗУ создавать документацию**

### 📋 СТРУКТУРА ДОКУМЕНТАЦИИ КАЖДОГО СЕРВИСА

1. **Общая информация**
   - Название и описание
   - Назначение и функции
   - Позиция в интерфейсе
   - Иконка и визуальное представление

2. **Техническая реализация**
   - Файлы конфигурации (JSON)
   - Модули (JS/TS)
   - Компоненты React
   - Стили CSS

3. **API и интеграция**
   - Эндпоинты
   - Параметры запросов/ответов
   - Интеграция с AI Brain
   - Обработка ошибок

4. **Пользовательский интерфейс**
   - Основной интерфейс
   - Выпадающие меню
   - Состояния (активное/неактивное)
   - Адаптивность

5. **Состояния и данные**
   - Управление состоянием
   - Локальное хранение
   - Синхронизация с платформой

6. **Тестирование**
   - Unit тесты
   - Integration тесты
   - E2E тесты
   - Тестовые сценарии

---

## 🗂 СЕРВИС: ПРОМПТЫ

### 📝 Общая информация - Промпты

- **Название**: Библиотека промптов
- **ID**: `prompts-service`
- **Описание**: Библиотека промптов с категориями, папками пользователя и быстрым доступом
- **Позиция**: Левая панель — отдельная кнопка; кнопка быстрого доступа в чате (top)
- **Иконка**: `LayoutGrid` (lucide-react)

### 🔧 Техническая реализация - Промпты

- **Конфигурация**: `public/services/prompts-service.json`
- **Модуль**: `public/services/modules/prompts-service/index.js`
- **Компонент**: `src/components/Services/Prompts/PromptsService.tsx`
- **Стили**: общие унифицированные классы проекта

### 🎨 Пользовательский интерфейс - Промпты

- Слева вкладки категорий
- В центре: Быстрый доступ (перетаскивание промптов для закрепления), карточки промптов и папки
- CRUD: создание/редактирование/удаление промптов и папок
- Drag & Drop: перемещение промптов в папки и в быстрый доступ

### 📊 Состояния и данные - Промпты

Хранение в `localStorage` под неймспейсом `promptsService:*`:

```ts
type PromptCategory = { id: string; title: string; order: number; system?: boolean };
type PromptFolder   = { id: string; title: string; categoryId: string | null; order: number; userOwned: boolean };
type PromptItem     = { id: string; title: string; body: string; tags: string[]; categoryId?: string | null; folderId?: string | null; updatedAt: string };
```

### 🔌 Интеграция с чатом - Промпты

- Кнопка в чате (`chatButtons`): `prompts-quick` (position: `top`, action: `insertPrompt`)
- Вставка выбранного промпта: событие `window.dispatchEvent(new CustomEvent('chat:insert-prompt', { detail: { id, body } }))`
- Обработчик вставки находится в `ChatInput.tsx`

---

## 🏠 СЕРВИС: РАБОЧЕЕ ПРОСТРАНСТВО

### 📝 Общая информация - Рабочее пространство

- **Название**: Рабочее пространство
- **ID**: `workspace`
- **Описание**: Основная область для работы с файлами и проектами
- **Позиция**: Левая панель, первая кнопка
- **Иконка**: `Layout` (lucide-react)

### 🔧 Техническая реализация - Рабочее пространство

- **Компонент**: `src/components/Workspace/Workspace.tsx`
- **Типы**: `src/types/workspace.ts`
- **Стили**: `src/styles/modules/workspace.css`
- **Контекст**: `PlatformContext` - `workspaceItems`

### 🎨 Пользовательский интерфейс - Рабочее пространство

- **Основной вид**: Сетка/список файлов и папок
- **Макеты**: grid, list, compact
- **Действия**: создание, удаление, переименование файлов
- **Drag & Drop**: поддержка перетаскивания

### 📊 Состояния и данные - Рабочее пространство

```typescript
interface WorkspaceItem {
  id: string;
  title: string;
  type: 'file' | 'folder';
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🤖 СЕРВИС: CHATGPT

### 📝 Общая информация - ChatGPT

- **Название**: ChatGPT
- **ID**: `chatgpt-service`
- **Описание**: ИИ-ассистент OpenAI для обработки запросов
- **Позиция**: Левая панель, отдельная кнопка
- **Иконка**: `OpenAIIcon` (кастомная)

### 🔧 Техническая реализация - ChatGPT

- **Конфигурация**: `public/services/chatgpt-service.json`
- **Модуль**: `public/services/modules/chatgpt-service/index.js`
- **Компонент**: `src/components/Chat/ChatGPTChat.tsx`
- **Стили**: `src/styles/modules/chat.css`

### 🎨 Пользовательский интерфейс - ChatGPT

- **Основной вид**: Чат-интерфейс с сообщениями
- **Функции**: отправка сообщений, выбор модели, загрузка файлов
- **Состояния**: подключение, обработка, ошибка

### 📊 Состояния и данные - ChatGPT

```typescript
interface ChatSession {
  id: string;
  messages: Message[];
  model: string;
  timestamp: Date;
}
```

### 🔌 API и интеграция - ChatGPT

- **Эндпоинт**: `/api/chatgpt/chat`
- **Методы**: POST для отправки сообщений
- **Параметры**: message, model, history
- **Ответ**: response, usage, timestamp

---

## 📱 СЕРВИС: ВИДЖЕТЫ

### 📝 Общая информация - Виджеты

- **Название**: Виджеты
- **ID**: `widgets-service`
- **Описание**: Управление виджетами на рабочем столе
- **Позиция**: Левая панель, отдельная кнопка с выпадающим меню
- **Иконка**: `LayoutGrid` (lucide-react)

### 🔧 Техническая реализация - Виджеты

- **Конфигурация**: `public/services/widgets-service.json`
- **Модуль**: `public/services/modules/widgets-service/index.js`
- **Компонент**: `src/components/Widgets/WidgetsServiceTabs.tsx`
- **Стили**: `src/styles/modules/sidebar.css` (widgets-collapsed-icons)

### 🎨 Пользовательский интерфейс - Виджеты

- **Основной вид**: Выпадающее меню с вкладками виджетов
- **Вкладки**:
  - 🕐 Часы - отображение времени и даты
  - 🎤 Голосовой ввод - быстрый доступ к голосовому вводу
- **Состояния**: свернутое/развернутое меню
- **Адаптивность**: работает в обоих режимах панели

### 📊 Состояния и данные - Виджеты

```typescript
interface WidgetsState {
  activeWidgetsCategory: string;
  activeWidgets: WidgetInstance[];
}

interface WidgetInstance {
  id: string;
  type: 'time-widget' | 'voice-widget';
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: WidgetSettings;
}
```

### 🔌 API и интеграция - Виджеты

- **Эндпоинт**: `/api/widgets/open`
- **Методы**: POST для создания виджета
- **Параметры**: widgetType, settings
- **Ответ**: status, widgetId

---

## ⚙️ СЕРВИС: НАСТРОЙКИ

### 📝 Общая информация - Настройки

- **Название**: Настройки
- **ID**: `settings-service`
- **Описание**: Системные настройки платформы
- **Позиция**: Левая панель, отдельная кнопка с выпадающим меню
- **Иконка**: `Cog` (lucide-react)

### 🔧 Техническая реализация - Настройки

- **Конфигурация**: `public/services/settings.json`
- **Модуль**: `src/services/settings/`
- **Компонент**: `src/components/Settings/Settings.tsx`
- **Стили**: `src/styles/modules/sidebar.css` (settings-collapsed-icons)

### 🎨 Пользовательский интерфейс - Настройки

- **Основной вид**: Выпадающее меню с категориями настроек
- **Категории**:
  - 🎨 Внешний вид - темы, шрифты, отображение
  - 🖥️ Интерфейс - панели и макет
  - 💬 Чат - настройки чата и сообщений
  - 🔔 Уведомления - настройки уведомлений и звуков
- **Состояния**: свернутое/развернутое меню
- **Адаптивность**: работает в обоих режимах панели

### 📊 Состояния и данные - Настройки

```typescript
interface SettingsState {
  activeSettingsCategory: string;
  settings: PlatformSettings;
}

interface PlatformSettings {
  theme: 'light' | 'dark' | 'custom';
  customColor?: string;
  accentsEnabled: boolean;
  accentColor?: string;
  useColoredText: boolean;
  textColor?: string;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  sidebarCollapsed: boolean;
}
```

### 🔌 API и интеграция - Настройки

- **Эндпоинт**: `/api/settings/update`
- **Методы**: POST для обновления настроек
- **Параметры**: category, settings
- **Ответ**: status, updatedSettings

---

## 🎯 ПРАВИЛА РАЗРАБОТКИ СЕРВИСОВ

### ✅ ОБЯЗАТЕЛЬНО

1. **Создавать документацию ПЕРЕД началом разработки**
2. **Обновлять документацию при каждом изменении**
3. **Тестировать все функции сервиса**
4. **Следовать единому стилю интерфейса**
5. **Обрабатывать все ошибки**

### ❌ ЗАПРЕЩЕНО

1. **Создавать сервисы без документации**
2. **Изменять API без обновления документации**
3. **Игнорировать существующие паттерны**
4. **Создавать дублирующий функционал**
5. **Нарушать архитектуру платформы**

### 🔄 ПРОЦЕСС ДОБАВЛЕНИЯ НОВОГО СЕРВИСА

1. **Планирование**
   - Определить назначение сервиса
   - Создать техническое задание
   - Спроектировать интерфейс

2. **Документация**
   - Создать раздел в `SERVICES_DOCUMENTATION.md`
   - Описать все аспекты сервиса
   - Указать все файлы и зависимости

3. **Реализация**
   - Создать JSON конфигурацию
   - Реализовать JS модуль
   - Создать React компоненты
   - Добавить стили

4. **Интеграция**
   - Добавить в ServiceManager
   - Интегрировать с AI Brain
   - Добавить в Sidebar (если нужно)

5. **Тестирование**
   - Unit тесты
   - Integration тесты
   - E2E тесты
   - Тестирование пользователем

6. **Документирование**
   - Обновить документацию
   - Добавить примеры использования
   - Описать известные ограничения

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [SERVICE_CONSTRUCTOR_GUIDE.md](./SERVICE_CONSTRUCTOR_GUIDE.md) - Подробное руководство по созданию сервисов
- [COMPLETE_PLATFORM_GUIDE.md](./COMPLETE_PLATFORM_GUIDE.md) - Полное руководство по платформе
- [API_STANDARDS.md](./API_STANDARDS.md) - Стандарты API для сервисов
- [QUICK_INTEGRATION_README.md](./QUICK_INTEGRATION_README.md) - Быстрая интеграция сервисов

---

**⚠️ ВАЖНО: Эта документация должна обновляться при каждом изменении в сервисах!**
