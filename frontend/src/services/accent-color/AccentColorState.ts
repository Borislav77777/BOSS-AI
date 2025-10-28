/**
 * Интерфейс состояния акцентных цветов
 */

export interface AccentColorState {
  darkAccentHue: number;
  lightAccentHue: number;
  darkBrightness: number; // Яркость для темной темы
  lightBrightness: number; // Яркость для светлой темы
  isEnabled: boolean;
  brightnessOverlay: boolean; // Переключатель наложения яркости на индикаторы
}
