/**
 * ГЕНЕРАТОР АНИМИРОВАННЫХ ПОЛОСОК
 *
 * Революционная система создания анимированных полосок с:
 * - Отклонениями от прямой траектории
 * - Синхронным движением параллельных полосок
 * - Задержками запуска для каждой полоски
 * - Коннекторами (кружочками) на концах
 * - Динамической генерацией паттернов
 */

export { default as AnimatedStripesDemo } from './AnimatedStripesDemo';
export { default as AnimatedStripesGenerator } from './AnimatedStripesGenerator';

// Типы для TypeScript
export interface StripeConfig {
  id: string;
  delay: number;
  duration: number;
  amplitude: number;
  frequency: number;
  color: string;
  width: number;
  height: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface AnimatedStripesGeneratorProps {
  count?: number;
  containerWidth?: number;
  containerHeight?: number;
  autoGenerate?: boolean;
  generationInterval?: number;
  onStripeGenerated?: (stripe: StripeConfig) => void;
}
