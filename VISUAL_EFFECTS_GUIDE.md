# Руководство по визуальным эффектам BOSS AI v2.0

## Обзор

Данное руководство описывает все визуальные эффекты, используемые в орбитальной навигации BOSS AI Platform v2.0.

## Saber-эффект (Неоновое свечение)

### Описание
Saber-эффект создает неоновое свечение вокруг иконок, имитируя световой меч из Star Wars.

### Техническая реализация
```css
.saber-glow-cyan {
    filter: drop-shadow(0 0 2px #00FFFF)
            drop-shadow(0 0 5px #00FFFF)
            drop-shadow(0 0 10px #00FFFF)
            drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
    animation: saber-pulse-cyan 2s ease-in-out infinite;
}
```

### Анимация пульсации
```css
@keyframes saber-pulse-cyan {
    0%, 100% {
        filter: drop-shadow(0 0 2px #00FFFF)
                drop-shadow(0 0 5px #00FFFF)
                drop-shadow(0 0 10px #00FFFF);
    }
    50% {
        filter: drop-shadow(0 0 5px #00FFFF)
                drop-shadow(0 0 10px #00FFFF)
                drop-shadow(0 0 20px #00FFFF)
                drop-shadow(0 0 30px rgba(0,255,255,0.8));
    }
}
```

### Применение
- **Центральный логотип:** `saber-glow-cyan center-pulse`
- **Агенты уровня 1:** `saber-glow-cyan saber-hover`
- **Подсервисы уровня 2:** `saber-glow-cyan saber-hover`

## Эффект парения (Levitation)

### Описание
Иконки "парят" в воздухе с плавным вертикальным движением и динамической тенью.

### Техническая реализация
```css
.levitation-float {
    animation: levitation 4s ease-in-out infinite;
}

@keyframes levitation {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
}
```

### Динамическая тень
```css
.levitation-shadow {
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 4px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0, 255, 255, 0.6), transparent);
    filter: blur(8px);
    animation: shadow-pulse 4s ease-in-out infinite;
}
```

### Анимация тени
```css
@keyframes shadow-pulse {
    0%, 100% {
        opacity: 0.4;
        transform: translateX(-50%) scaleX(1);
    }
    50% {
        opacity: 0.8;
        transform: translateX(-50%) scaleX(1.2);
    }
}
```

## Эффект печатной машинки (Typewriter)

### Описание
Слоганы появляются с эффектом печатной машинки, создавая ощущение "живого" текста.

### Техническая реализация
```css
.typewriter {
    overflow: hidden;
    border-right: 2px solid #00FFFF;
    white-space: nowrap;
    animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
}
```

### Анимация печати
```css
@keyframes typing {
    from { width: 0; }
    to { width: 100%; }
}

@keyframes blink-caret {
    from, to { border-color: transparent; }
    50% { border-color: #00FFFF; }
}
```

## Чередование часов и слоганов

### Описание
Часы обратного отсчета и слоганы чередуются каждые 10 секунд с плавными переходами.

### Техническая реализация
```javascript
// Состояние чередования
const [showCountdown, setShowCountdown] = useState<boolean>(true);

// Логика чередования
useEffect(() => {
    const alternationInterval = setInterval(() => {
        setShowCountdown(prev => !prev);
        if (!showCountdown) {
            setCurrentSlogan(getRandomSlogan());
        }
    }, 10000);

    return () => clearInterval(alternationInterval);
}, [showCountdown]);
```

### Плавные переходы
```css
.fade-in-out {
    animation: fadeInOut 0.5s ease-in-out;
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
}
```

## Эффект свечения текста (Glow Text)

### Описание
Текст светится неоновым свечением, создавая технологичный эффект.

### Техническая реализация
```css
.glow-text {
    color: #00FFFF;
    text-shadow:
        0 0 5px #00FFFF,
        0 0 10px #00FFFF,
        0 0 15px #00FFFF,
        0 0 20px #00FFFF;
    animation: text-glow 2s ease-in-out infinite alternate;
}
```

### Анимация свечения
```css
@keyframes text-glow {
    0% {
        text-shadow:
            0 0 5px #00FFFF,
            0 0 10px #00FFFF,
            0 0 15px #00FFFF;
    }
    100% {
        text-shadow:
            0 0 10px #00FFFF,
            0 0 20px #00FFFF,
            0 0 30px #00FFFF,
            0 0 40px #00FFFF;
    }
}
```

## Эффект электрического разряда

### Описание
Создает эффект электрического разряда вокруг элементов.

### Техническая реализация
```css
.electric-discharge {
    position: relative;
}

.electric-discharge::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #00FFFF, #FFFFFF, #00FFFF);
    border-radius: inherit;
    z-index: -1;
    animation: electric-pulse 1.5s ease-in-out infinite;
}
```

### Анимация разряда
```css
@keyframes electric-pulse {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.3; }
}
```

## Эффект неоновой рамки

### Описание
Создает неоновую рамку с эффектом мерцания.

### Техническая реализация
```css
.neon-border {
    border: 2px solid #00FFFF;
    box-shadow:
        0 0 5px #00FFFF,
        inset 0 0 5px #00FFFF,
        0 0 10px #00FFFF,
        inset 0 0 10px #00FFFF;
    animation: neon-flicker 2s ease-in-out infinite alternate;
}
```

### Анимация мерцания
```css
@keyframes neon-flicker {
    0%, 18%, 22%, 25%, 53%, 57%, 100% {
        box-shadow:
            0 0 5px #00FFFF,
            inset 0 0 5px #00FFFF,
            0 0 10px #00FFFF,
            inset 0 0 10px #00FFFF;
    }
    20%, 24%, 55% {
        box-shadow:
            0 0 2px #00FFFF,
            inset 0 0 2px #00FFFF,
            0 0 5px #00FFFF,
            inset 0 0 5px #00FFFF;
    }
}
```

## Эффект частиц

### Описание
Создает фоновые частицы для дополнительной атмосферы.

### Техническая реализация
```css
.particles {
    position: relative;
    overflow: hidden;
}

.particles::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        radial-gradient(2px 2px at 20px 30px, #00FFFF, transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(0,255,255,0.8), transparent),
        radial-gradient(1px 1px at 90px 40px, #00FFFF, transparent),
        radial-gradient(1px 1px at 130px 80px, rgba(0,255,255,0.6), transparent),
        radial-gradient(2px 2px at 160px 30px, #00FFFF, transparent);
    background-repeat: repeat;
    background-size: 200px 100px;
    animation: particles-float 20s linear infinite;
    opacity: 0.3;
}
```

### Анимация частиц
```css
@keyframes particles-float {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-100px); }
}
```

## Удаление черного фона

### Описание
Автоматическое удаление черного фона с иконок для идеальной интеграции.

### CSS обработка
```css
img {
    mix-blend-mode: screen; /* Убирает черный фон */
    filter: contrast(1.2) brightness(1.1); /* Улучшает контраст */
}
```

### Микросервис обработки
- **Сервис:** Image Processing Service (порт 3005)
- **Технология:** rembg (AI) + sharp (fallback)
- **API:** `POST /api/remove-bg`

## Адаптивность эффектов

### Desktop (1920x1080)
- **Saber-эффект:** Полная интенсивность
- **Парение:** Амплитуда 8px
- **Тени:** Размытие 8px
- **Частицы:** Полная плотность

### Mobile (375x667)
- **Saber-эффект:** Уменьшенная интенсивность
- **Парение:** Амплитуда 4px
- **Тени:** Размытие 4px
- **Частицы:** Уменьшенная плотность

## Производительность

### Оптимизация
- **CSS анимации:** Используют GPU ускорение
- **Частицы:** Ограниченное количество
- **Тени:** Оптимизированные blur значения
- **Переходы:** Плавные, без рывков

### Рекомендации
- **Минимальная частота кадров:** 60 FPS
- **Использование will-change:** Для анимируемых элементов
- **transform:** Вместо изменения позиции
- **opacity:** Для fade эффектов

## Отладка эффектов

### Инструменты разработчика
1. **Chrome DevTools:** Performance tab
2. **FPS мониторинг:** Встроенные инструменты
3. **CSS анимации:** Animation inspector
4. **Производительность:** Lighthouse

### Частые проблемы
- **Низкий FPS:** Уменьшить количество анимаций
- **Мерцание:** Проверить z-index и overflow
- **Задержки:** Оптимизировать CSS селекторы
- **Память:** Очистить неиспользуемые анимации

## Кастомизация

### Изменение цветов
```css
:root {
    --saber-color: #00FFFF;
    --glow-intensity: 0.8;
    --animation-speed: 2s;
}
```

### Настройка интенсивности
```css
.saber-glow-cyan {
    filter: drop-shadow(0 0 2px var(--saber-color))
            drop-shadow(0 0 5px var(--saber-color))
            drop-shadow(0 0 10px var(--saber-color))
            drop-shadow(0 0 20px rgba(0, 255, 255, var(--glow-intensity)));
    animation: saber-pulse-cyan var(--animation-speed) ease-in-out infinite;
}
```

## Заключение

Все визуальные эффекты BOSS AI v2.0 созданы для создания технологичной, премиальной атмосферы платформы. Они оптимизированы для производительности и адаптивности, обеспечивая отличный пользовательский опыт на всех устройствах.
