# 🎨 Градиентные разделители BARSUKOV OS

## 📋 Обзор

Градиентные разделители - это современная система визуального разделения контента, которая обеспечивает элегантный и адаптивный дизайн интерфейса.

## 🎯 Назначение

- **Визуальное разделение** контента без резких границ
- **Современный дизайн** с плавными переходами
- **Адаптивность** к смене тем
- **Производительность** через CSS переменные

## 🔧 Типы разделителей

### 1. Горизонтальные разделители

Используются для разделения контента по вертикали (между секциями, блоками).

#### Основной горизонтальный разделитель

```css
.gradient-divider {
    background: var(--gradient-divider);
}
```

**CSS переменная:**

```css
--gradient-divider: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--primary) 30%, transparent) 50%,
    transparent 100%
);
```

**Использование:**

```jsx
{/* Разделитель между секциями чата */}
<div className="absolute top-0 left-0 right-0 h-px gradient-divider"></div>

{/* Разделитель в настройках */}
<div className="mx-4 h-px gradient-divider"></div>
```

#### Светлый горизонтальный разделитель

```css
.gradient-divider-light {
    background: var(--gradient-divider-light);
}
```

**CSS переменная:**

```css
--gradient-divider-light: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--primary) 15%, transparent) 50%,
    transparent 100%
);
```

**Использование:**

```jsx
{/* Тонкий разделитель для акцентов */}
<div className="h-px gradient-divider-light"></div>
```

### 2. Вертикальные разделители

Используются для разделения контента по горизонтали (между колонками, боковыми панелями).

```css
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

## 📍 Расположение в проекте

### CSS файлы

- **`src/styles/utilities.css`** - классы разделителей
- **`src/styles/themes.css`** - CSS переменные для разделителей

### Компоненты

- **`src/components/Sidebar/Sidebar.tsx`** - вертикальный разделитель боковой панели
- **`src/components/Chat/Chat.tsx`** - горизонтальные разделители в чате

## 🎨 Принципы дизайна

### 1. Направление градиентов

- **Горизонтальные**: `90deg` (слева направо)
- **Вертикальные**: `180deg` (сверху вниз)

### 2. Интенсивность цвета

- **Основной**: 30% от `var(--primary)`
- **Светлый**: 15% от `var(--primary)`

### 3. Форма градиента

```css
transparent 0% → color 50% → transparent 100%
```

Создает плавный переход от прозрачного к цветному и обратно.

## 🔄 Адаптивность к темам

Все разделители автоматически адаптируются к смене тем через CSS переменные:

```css
/* Темная тема */
[data-theme="dark"] {
    --primary: #e5e7eb;
}

/* Светлая тема */
[data-theme="light"] {
    --primary: #111827;
}

/* Кастомная тема */
[data-theme="custom"] {
    --primary: var(--custom-primary-color);
}
```

## 💡 Примеры использования

### Боковая панель

```jsx
<div className="sidebar-main-container relative">
    {/* Вертикальный градиентный разделитель */}
    <div className="absolute top-0 right-0 bottom-0 w-px gradient-divider-vertical"></div>

    {/* Контент панели */}
    <div className="sidebar-content">
        {/* ... */}
    </div>
</div>
```

### Разделение секций

```jsx
<div className="chat-section">
    {/* Контент */}
</div>

{/* Разделитель */}
<div className="h-px gradient-divider"></div>

<div className="chat-section">
    {/* Другой контент */}
</div>
```

### Тонкие акценты

```jsx
<div className="settings-item">
    {/* Настройка */}
</div>

{/* Светлый разделитель */}
<div className="mx-4 h-px gradient-divider-light"></div>

<div className="settings-item">
    {/* Следующая настройка */}
</div>
```

## 🚀 Производительность

### Оптимизации

1. **CSS переменные** - быстрая смена цветов без перерисовки
2. **Псевдоэлементы** - минимальное влияние на DOM
3. **Hardware acceleration** - использование `transform` и `opacity`

### Рекомендации

- Используйте `absolute` позиционирование для вертикальных разделителей
- Применяйте `w-px` и `h-px` для минимальной ширины/высоты
- Избегайте создания множественных разделителей в одном контейнере

## 🔧 Настройка

### Изменение интенсивности

```css
/* Более интенсивный */
.gradient-divider-intense {
    background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--primary) 50%, transparent) 50%,
        transparent 100%
    );
}

/* Более тонкий */
.gradient-divider-subtle {
    background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--primary) 10%, transparent) 50%,
        transparent 100%
    );
}
```

### Кастомные направления

```css
/* Диагональный разделитель */
.gradient-divider-diagonal {
    background: linear-gradient(
        45deg,
        transparent 0%,
        color-mix(in srgb, var(--primary) 30%, transparent) 50%,
        transparent 100%
    );
}
```

## 📚 Связанная документация

- [STYLE_GUIDE.md](../STYLE_GUIDE.md) - Общее руководство по стилям
- [README.md](../README.md) - Основная документация проекта
- [THEME_SYSTEM.md](./THEME_SYSTEM.md) - Система тем (если существует)

## 🐛 Известные ограничения

1. **Браузерная поддержка**: `color-mix()` требует современные браузеры
2. **Fallback**: Для старых браузеров используются статичные цвета
3. **Производительность**: Множественные градиенты могут влиять на производительность

## 🔄 История изменений

### v2.1.0 (Текущая версия)

- ✅ Добавлен вертикальный градиентный разделитель
- ✅ Интеграция с системой тем
- ✅ Документация и примеры использования

### v2.0.0

- ✅ Рефакторинг горизонтальных разделителей
- ✅ Убраны повторяющиеся градиенты
- ✅ Оптимизация производительности

---

**Автор**: BARSUKOV OS Team
**Дата создания**: 2025-01-27
**Последнее обновление**: 2025-01-27
