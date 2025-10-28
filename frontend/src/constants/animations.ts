/**
 * Константы для анимаций и переходов
 */

export const ANIMATIONS = {
  // Длительности анимаций (в миллисекундах)
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 800,
  },

  // Троттлинг для производительности
  THROTTLE: {
    UPDATE_THROTTLE: 16, // ~60fps
    RESIZE_THROTTLE: 100,
    SCROLL_THROTTLE: 16,
  },

  // Кривые Безье для плавности
  EASING: {
    EASE_OUT: [0.25, 0.46, 0.45, 0.94],
    EASE_IN: [0.55, 0.055, 0.675, 0.19],
    EASE_IN_OUT: [0.645, 0.045, 0.355, 1],
    BOUNCE: [0.68, -0.55, 0.265, 1.55],
  },

  // Задержки для последовательных анимаций
  DELAY: {
    STAGGER: 100,
    SEQUENTIAL: 200,
    CASCADE: 50,
  },

  // Настройки анимации загрузки
  LOADING: {
    SPINNER_DURATION: 1000,
    PULSE_DURATION: 1500,
    FADE_DURATION: 300,
  },

  // Настройки анимации появления/исчезновения
  TRANSITIONS: {
    FADE_IN: {
      duration: 300,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
    SLIDE_UP: {
      duration: 400,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
    SCALE_IN: {
      duration: 250,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
} as const;

export type AnimationConstants = typeof ANIMATIONS;
