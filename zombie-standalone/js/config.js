/**
 * Zombie 3D Model - Конфигурация автономной версии
 * Все настройки для модели зомби без переключения
 */

const BOSS_AI_CONFIG = {
    // Путь к 3D модели зомби
    model: {
        path: 'models/zombie-horde-pack.glb',
        scale: 1.0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 }  // Поворот на 180° чтобы смотрела на нас
    },

    // Цветовая схема
    colors: {
        primary: '#0088cc',      // Более приглушенный голубой
        secondary: '#0066aa',    // Темно-голубой
        glow: '#00aadd',         // Умеренное свечение
        background: '#000000',   // Чисто черный фон
        particles: {
            start: '#00aadd',    // Начальный цвет частиц
            end: '#0066aa'       // Конечный цвет частиц
        }
    },

    // Настройки камеры
    camera: {
        alpha: 0,                // Угол по горизонтали (фронтальный вид)
        beta: Math.PI / 2,       // Угол по вертикали (горизонт)
        radius: 25,              // Увеличить для лучшего обзора модели
        minRadius: 15,
        maxRadius: 50,
        wheelPrecision: 50,
        panningSensibility: 0    // Отключено панорамирование
    },

    // Настройки освещения
    lighting: {
        ambient: {
            intensity: 0.6,
            color: '#ffffff'
        },
        directional: {
            intensity: 0.8,
            color: '#0088cc',
            position: { x: 10, y: 20, z: 10 }
        }
    },

    // Анимации
    animations: {
        // Вращение модели
        rotation: {
            enabled: true,       // Включить вращение
            speed: 0.002,        // Медленное вращение
            axis: 'y'            // Вращение вокруг оси Y
        },

        // Пульсация свечения (эффект "дыхания")
        pulse: {
            enabled: true,
            minIntensity: 1.0,
            maxIntensity: 2.0,   // Уменьшить амплитуду
            duration: 6000,      // Увеличить длительность (медленнее)
            easing: 'sine'       // Плавная синусоида
        },

        // Волновой эффект
        wave: {
            enabled: true,
            amplitude: 0.2,      // Амплитуда волны
            frequency: 2.0,      // Частота волны
            speed: 1.5,          // Скорость распространения
            direction: 'horizontal'
        },

        // Плавное появление при загрузке
        fadeIn: {
            enabled: true,
            duration: 2000       // Миллисекунды
        },

        // Пульсация размера (дыхание)
        scale: {
            enabled: true,       // Анимация масштаба
            minScale: 0.95,
            maxScale: 1.05,
            duration: 4000       // 4 секунды цикл
        }
    },

    // Система частиц
    particles: {
        enabled: true,
        count: 500,              // Больше частиц для эффекта
        emitRate: 150,           // Частиц в секунду
        minSize: 0.08,           // Крупнее
        maxSize: 0.2,
        minLifeTime: 2,          // Секунды
        maxLifeTime: 4,
        gravity: { x: 0, y: 0.5, z: 0 },  // Легкий подъем вверх
        velocity: {
            min: { x: -1, y: -1, z: -1 },
            max: { x: 1, y: 1, z: 1 }
        },
        emitBox: {
            min: { x: -0.2, y: -0.2, z: -0.2 },
            max: { x: 0.2, y: 0.2, z: 0.2 }
        },
        blendMode: BABYLON.ParticleSystem.BLENDMODE_ADD,
        updateSpeed: 0.01
    },

    // Эффекты постобработки
    effects: {
        // Bloom (свечение)
        bloom: {
            enabled: true,
            intensity: 1.0,      // Еще меньше для быстрой загрузки
            threshold: 0.95,     // Выше порог (меньше bloom)
            weight: 0.3,         // Меньше вес
            kernel: 32           // Меньше kernel для производительности
        },

        // Glow layer
        glow: {
            enabled: true,
            intensity: 0.5,      // Меньше интенсивность свечения
            blurKernelSize: 32
        },

        // Цветокоррекция
        colorGrading: {
            enabled: false,
            exposure: 1.0,
            contrast: 1.1,
            saturation: 1.2
        }
    },

    // Производительность
    performance: {
        targetFPS: 60,
        adaptiveQuality: true,
        hardwareScaling: 1.0
    },

    // UI элементы
    ui: {
        showFPS: false,
        showControls: false,
        preloader: {
            enabled: true,
            minDisplayTime: 1000  // Минимальное время показа прелоадера
        }
    }
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BOSS_AI_CONFIG;
}
