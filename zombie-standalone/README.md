# Zombie 3D Model - Standalone Version

Автономная версия 3D модели зомби с анимацией и эффектами для переноса в другие проекты.

## 📁 Структура проекта

```
zombie-standalone/
├── index.html              # Главный HTML файл
├── css/
│   └── styles.css         # Стили (без кнопок переключения)
├── js/
│   ├── config.js          # Конфигурация (только зомби)
│   ├── scene.js           # Логика 3D сцены
│   ├── animations.js      # Система анимаций
│   └── particles.js       # Система частиц
├── models/
│   └── zombie-horde-pack.glb  # 3D модель зомби
└── README.md              # Этот файл
```

## 🚀 Быстрый запуск

### 1. Запуск локального сервера

**Python (рекомендуется):**
```bash
cd zombie-standalone
python -m http.server 8000
```

**Node.js:**
```bash
cd zombie-standalone
npx http-server -p 8000
```

### 2. Открытие в браузере

Перейдите по адресу: `http://localhost:8000`

## 🎮 Управление

- **ЛКМ + перетаскивание** - вращение камеры вокруг модели
- **Колесо мыши** - приближение/отдаление
- **ПКМ + перетаскивание** - панорамирование (отключено по умолчанию)

## ⚙️ Настройка

Все настройки находятся в файле `js/config.js`:

### Основные параметры модели
```javascript
model: {
    path: 'models/zombie-horde-pack.glb',
    scale: 1.0,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: Math.PI, z: 0 }
}
```

### Настройки камеры
```javascript
camera: {
    alpha: 0,                // Угол по горизонтали
    beta: Math.PI / 2,       // Угол по вертикали
    radius: 25,              // Расстояние до модели
    minRadius: 15,
    maxRadius: 50
}
```

### Анимации
```javascript
animations: {
    rotation: { enabled: true, speed: 0.002 },
    pulse: { enabled: true, duration: 6000 },
    wave: { enabled: true, amplitude: 0.2 },
    scale: { enabled: true, duration: 4000 }
}
```

### Система частиц
```javascript
particles: {
    enabled: true,
    count: 500,
    emitRate: 150,
    minSize: 0.08,
    maxSize: 0.2
}
```

## 🔧 Интеграция в другой проект

### 1. Копирование файлов

Скопируйте всю папку `zombie-standalone/` в ваш проект.

### 2. Подключение в HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Мой проект с зомби</title>
    <script src="https://cdn.babylonjs.com/babylon.js"></script>
    <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
    <link rel="stylesheet" href="zombie-standalone/css/styles.css">
</head>
<body>
    <canvas id="renderCanvas"></canvas>

    <script src="zombie-standalone/js/config.js"></script>
    <script src="zombie-standalone/js/scene.js"></script>
    <script src="zombie-standalone/js/animations.js"></script>
    <script src="zombie-standalone/js/particles.js"></script>

    <script>
        // Инициализация
        const zombieScene = new BossAIScene('renderCanvas');
    </script>
</body>
</html>
```

### 3. Настройка под ваш проект

Измените параметры в `config.js`:
- Путь к модели
- Позицию и масштаб
- Цвета и эффекты
- Настройки анимаций

## 🎨 Кастомизация

### Изменение модели

Замените файл `models/zombie-horde-pack.glb` на свою модель и обновите путь в `config.js`:

```javascript
model: {
    path: 'models/your-model.glb',
    // ... остальные настройки
}
```

### Изменение цветов

```javascript
colors: {
    primary: '#your-color',
    secondary: '#your-secondary-color',
    glow: '#your-glow-color',
    background: '#your-background-color'
}
```

### Отключение анимаций

```javascript
animations: {
    rotation: { enabled: false },
    pulse: { enabled: false },
    wave: { enabled: false },
    scale: { enabled: false }
}
```

## 📱 Адаптивность

Проект автоматически адаптируется под размер экрана. На мобильных устройствах:
- Уменьшается размер UI элементов
- Оптимизируется производительность
- Адаптируются элементы управления

## 🐛 Отладка

### Консоль браузера

Откройте консоль разработчика (F12) для просмотра логов:
- `✓ Zombie 3D Scene initialized` - сцена инициализирована
- `✓ Zombie model loaded successfully` - модель загружена
- `✓ Animations initialized` - анимации запущены

### API для отладки

В консоли доступен объект `window.ZOMBIE_3D`:
```javascript
// Получить сцену
window.ZOMBIE_3D.scene()

// Получить анимации
window.ZOMBIE_3D.animations()

// Получить частицы
window.ZOMBIE_3D.particles()

// Получить конфигурацию
window.ZOMBIE_3D.config
```

## 📋 Требования

- Современный браузер с поддержкой WebGL2
- Локальный веб-сервер (из-за CORS политики)
- JavaScript включен

## 🔄 Обновления

Для обновления до новой версии:
1. Сделайте резервную копию ваших изменений
2. Замените файлы на новые версии
3. Проверьте совместимость настроек в `config.js`

## 📞 Поддержка

При возникновении проблем:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что сервер запущен
3. Проверьте пути к файлам
4. Убедитесь, что модель загружается корректно

## 📄 Лицензия

Этот проект создан для демонстрационных целей. Модель зомби может иметь собственные лицензионные ограничения.
