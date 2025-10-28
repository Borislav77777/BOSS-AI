# 🎨 Руководство по стилям BARSUKOV OS

## 📋 Обзор

Это руководство описывает стандарты стилизации и архитектуру CSS в проекте BARSUKOV OS. Следуйте этим правилам для поддержания консистентности и производительности.

## 🏗️ Архитектура CSS

### Модульная структура (v3.1.0)

```text
src/styles/
├── platform.css           # Главный файл стилей (импортирует все модули)
├── globals.css            # Основные глобальные стили
├── base.css               # Базовые стили документа
├── components.css         # Стили компонентов (40 строк - оптимизирован)
├── animations.css         # Анимации и ключевые кадры
├── themes.css             # Система тем
├── utilities.css          # Утилитарные классы
├── layout.css             # Стили макета
├── loading.css            # Стили загрузочного экрана
├── color-system.css       # Единая система цветов (НОВОЕ)
├── buttons-unified.css    # Унифицированная система кнопок (НОВОЕ)
├── unified-components.css # Унифицированные компоненты (НОВОЕ)
└── components/            # Модульные CSS файлы
    ├── scrollbars.css      # Унифицированная система скроллбаров
    ├── animations.css     # Анимации и переходы
    ├── loading.css        # Стили загрузочного экрана
    ├── settings.css       # Стили настроек и форм
    ├── themes.css         # Стили тем и цветовых компонентов
    ├── sidebar.css        # Стили сайдбара
    ├── chat.css           # Стили чата
    ├── workspace.css      # Стили рабочего пространства
    └── utilities.css       # Утилитарные стили
```

### Принципы организации

1. **Разделение ответственности** - каждый файл отвечает за свою область
2. **Модульность** - стили легко найти и изменить
3. **Переиспользование** - утилитарные классы для частых паттернов
4. **Производительность** - минимизация дублирования

## 🎯 Утилитарные классы

### Базовые стили

```css
/* Фоны */
.bg-surface { background: var(--surface); }
.bg-input { background: var(--input-bg); }
.bg-card { background: var(--card-bg); }
.bg-primary { background: var(--primary); }
.bg-secondary { background: var(--secondary); }
.bg-accent { background: var(--accent); }
.bg-transparent { background: transparent; }

/* Цвета текста */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-muted { color: var(--text-muted); }
.text-input { color: var(--input-text); }
.text-button-primary { color: var(--background); }
.text-button-secondary { color: var(--button-text-secondary); }

/* Границы */
.border-default { border-color: var(--border); }
.border-input { border-color: var(--input-border); }
.border-primary { border-color: var(--primary); }
.border-card { border-color: var(--card-border); }
```

### Комбинированные стили

```css
/* Карточки */
.card-base {
    background: var(--card-bg);
    border-color: var(--card-border);
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

/* Поля ввода */
.input-base {
    background: var(--input-bg);
    border-color: var(--input-border);
    color: var(--input-text);
    --placeholder-color: var(--input-placeholder);
    --focus-ring: var(--focus-ring);
}

/* Кнопки */
.button-primary {
    background: var(--primary);
    color: var(--background);
    border-color: var(--primary);
}

.button-secondary {
    background: var(--button-secondary);
    color: var(--button-text-secondary);
    border-color: var(--border);
    --hover-bg: var(--button-secondary-hover);
}

/* Поверхности */
.surface-base {
    background: var(--surface);
    border-color: var(--border);
}
```

### Специализированные компоненты

```css
/* Чат */
.chat-header { background: var(--surface); }
.chat-messages { background: var(--surface); }
.chat-input-container { background: var(--surface); }
.chat-buttons-container { background: var(--surface); }
.chat-textarea {
    background: var(--input-bg);
    border-color: var(--input-border);
    color: var(--input-text);
    --placeholder-color: var(--input-placeholder);
    --focus-ring: var(--focus-ring);
}

/* Сообщения */
.message-system {
    background: linear-gradient(145deg, var(--primary), var(--secondary));
}
.message-user {
    background: linear-gradient(145deg, var(--primary), var(--secondary));
}

/* Индикаторы */
.typing-indicator {
    background: var(--surface);
    border-color: var(--border);
}
.typing-dot {
    background: var(--text-muted);
}
```

### 🎨 Градиентные разделители

Система градиентных разделителей обеспечивает современный и элегантный визуальный стиль для разделения контента.

#### Горизонтальные разделители

```css
/* Основной горизонтальный разделитель */
.gradient-divider {
    background: var(--gradient-divider);
}

/* Светлый горизонтальный разделитель */
.gradient-divider-light {
    background: var(--gradient-divider-light);
}
```

**Использование:**

```jsx
{/* Разделитель между секциями */}
<div className="h-px gradient-divider"></div>

{/* Светлый разделитель для тонких акцентов */}
<div className="h-px gradient-divider-light"></div>
```

#### Вертикальные разделители

```css
/* Вертикальный градиентный разделитель */
.gradient-divider-vertical {
    background: linear-gradient(
        180deg,
        transparent 0%,
        color-mix(in srgb, var(--primary) 30%, transparent) 50%,
        transparent 100%
    );
}
```

**Использование:**

```jsx
{/* Вертикальный разделитель для боковых панелей */}
<div className="absolute top-0 right-0 bottom-0 w-px gradient-divider-vertical"></div>

{/* Разделитель между колонками */}
<div className="h-full w-px gradient-divider-vertical"></div>
```

#### CSS переменные для разделителей

```css
/* В themes.css */
--gradient-divider: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--primary) 30%, transparent) 50%,
    transparent 100%
);

--gradient-divider-light: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--primary) 15%, transparent) 50%,
    transparent 100%
);
```

#### Принципы использования

1. **Горизонтальные разделители** - для разделения контента по вертикали (между секциями, блоками)
2. **Вертикальные разделители** - для разделения контента по горизонтали (между колонками, боковыми панелями)
3. **Адаптивность** - все разделители автоматически адаптируются к смене тем
4. **Производительность** - используются CSS переменные для быстрой смены цветов

#### Примеры применения

```jsx
{/* Разделитель в боковой панели */}
<div className="absolute top-0 right-0 bottom-0 w-px gradient-divider-vertical"></div>

{/* Разделитель между секциями чата */}
<div className="absolute top-0 left-0 right-0 h-px gradient-divider"></div>

{/* Разделитель в настройках */}
<div className="mx-4 h-px gradient-divider-light"></div>
```

## 🚫 Антипаттерны

### ❌ НЕ ДЕЛАЙТЕ

```css
/* Плохо: Inline стили */
<div style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>

/* Плохо: Дублирование */
<div className="bg-surface text-primary">
<div className="bg-surface text-primary">

/* Плохо: Хардкод цветов */
<div style={{ background: '#1a1a1a', color: '#e5e7eb' }}>
```

### ✅ ДЕЛАЙТЕ

```css
/* Хорошо: Утилитарные классы */
<div className="bg-surface text-primary">

/* Хорошо: Комбинированные классы */
<div className="card-base">

/* Хорошо: CSS переменные */
<div className="surface-base">
```

## 🎨 Система тем

### CSS переменные

```css
:root {
  /* 6 базовых переменных */
  --primary: #e5e7eb;
  --background: #0a0a0a;
  --surface: #1a1a1a;
  --text: #e5e7eb;
  --text-secondary: #9ca3af;
  --border: rgba(255,255,255,0.10);

  /* Дополнительные */
  --animation-accent: #8B4513;
}
```

### Автоматическая генерация

```css
[data-theme] {
  /* Производные цвета генерируются автоматически */
  --secondary: color-mix(in srgb, var(--primary) 80%, var(--background));
  --accent: color-mix(in srgb, var(--primary) 60%, var(--background));
  --text-muted: color-mix(in srgb, var(--text) 60%, var(--background));
}
```

## 🔧 Правила разработки

### 1. Приоритет стилей

1. **Утилитарные классы** - для частых паттернов
2. **Компонентные стили** - для специфичных элементов
3. **Inline стили** - только для динамических значений

### 2. Именование классов

```css
/* Структура: [компонент]-[элемент]-[модификатор] */
.chat-header { }
.chat-message-system { }
.chat-button-primary { }

/* Утилитарные: [свойство]-[значение] */
.bg-surface { }
.text-primary { }
.border-default { }
```

### 3. Организация файлов

- **globals.css** - только импорты и глобальные стили
- **utilities.css** - переиспользуемые утилитарные классы
- **components.css** - стили конкретных компонентов
- **themes.css** - система тем и цветов

### 4. Производительность

```css
/* Хорошо: Используйте CSS переменные */
.button {
    background: var(--primary);
    color: var(--background);
}

/* Плохо: Повторяющиеся значения */
.button {
    background: #e5e7eb;
    color: #0a0a0a;
}
```

## 📱 Адаптивность

### Breakpoints

```css
/* Tailwind CSS breakpoints */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Примеры

```css
/* Адаптивная сетка */
.workspace-grid {
    @apply grid gap-4;
    @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}

/* Адаптивные отступы */
.chat-container {
    @apply p-4 sm:p-6 lg:p-8;
}
```

## 🎭 Анимации

### Стандартные переходы

```css
/* Базовые переходы */
.transition-base {
    transition: all 0.2s ease;
}

.transition-colors {
    transition: color 0.2s ease, background-color 0.2s ease;
}

.transition-transform {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Ключевые кадры

```css
/* Определяются в animations.css */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
```

## 🧪 Тестирование стилей

### Проверка консистентности

```bash
# Проверка линтера
npm run lint

# Проверка типов
npm run type-check

# Сборка
npm run build
```

### Визуальное тестирование

1. Проверьте все темы (светлая/темная/авто)
2. Протестируйте адаптивность на разных экранах
3. Убедитесь в корректности анимаций
4. Проверьте доступность (контрастность, размеры)

## 📚 Ресурсы

### Документация

- [Tailwind CSS](https://tailwindcss.com/docs)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Инструменты

- **VS Code**: Tailwind CSS IntelliSense
- **Chrome DevTools**: CSS переменные в Computed
- **Figma**: Для дизайн-системы

## 🔄 Обновления

### Версия 3.1.0 (Финальная оптимизация)

- ✅ **Оптимизированный чат** - Уменьшена высота шапки чата, убран логотип
- ✅ **Улучшенный сайдбар** - Кликабельный логотип для сворачивания, градиентные разделители
- ✅ **Белые иконки в темной теме** - Все иконки настроек теперь белые в темной теме
- ✅ **Устранение inline стилей** - Все стили вынесены в CSS классы
- ✅ **Модульная архитектура CSS** - Разбит на специализированные модули
- ✅ **Унифицированная система кнопок** - Единая логика для всех кнопок
- ✅ **Единая система цветов** - Централизованное управление всеми цветами
- ✅ **Liquid Glass System** - Современная система стилизации с эффектом "жидкого стекла"
- ✅ **Градиентные разделители** - Центрированные и правильно сужающиеся
- ✅ **Унифицированные скроллбары** - Тонкие, ненавязчивые скроллбары

### Версия 2.1

- ✅ Добавлены утилитарные классы
- ✅ Модуляризация CSS
- ✅ Оптимизация производительности
- ✅ Руководство по стилям

### Планы

- [ ] Автоматическая генерация утилитарных классов
- [ ] Интеграция с дизайн-системой
- [ ] A11y улучшения
- [ ] Темная тема по умолчанию

## 🌈 RAINBOW SLIDER

### Описание

Интерактивный слайдер с радужными эффектами для выбора цветов и значений.

### Особенности

- Плавные переходы цветов
- Адаптивный дизайн
- Интеграция с темной/светлой темой
- Поддержка градиентов
- Анимации и эффекты

### Использование

```tsx
import { RainbowSlider } from '@/components/common/RainbowSlider';

<RainbowSlider
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  colors={['#ff0000', '#00ff00', '#0000ff']}
  className="w-full h-2"
/>
```

### CSS классы

```css
.rainbow-slider {
  background: linear-gradient(90deg,
    #ff0000 0%,
    #ff8000 16.66%,
    #ffff00 33.33%,
    #80ff00 50%,
    #00ff00 66.66%,
    #00ff80 83.33%,
    #0000ff 100%
  );
  border-radius: 8px;
  height: 8px;
  position: relative;
}

.rainbow-slider-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #333;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.rainbow-slider-thumb:hover {
  transform: scale(1.1);
}
```

---

**Следуйте этому руководству для поддержания высокого качества кода и консистентности дизайна!** 🚀
