/**
 * Унифицированные компоненты платформы
 * Экспорт всех переиспользуемых компонентов
 */

// Унифицированные компоненты
export { UnifiedCard } from './UnifiedCard';
export type { UnifiedCardProps } from './UnifiedCard';

export { UnifiedButton } from './UnifiedButton';
export type { UnifiedButtonProps } from './UnifiedButton';

export {
    BrightnessSlider, FontSizeSlider, HueSlider, RainbowSlider, UnifiedSlider
} from './UnifiedSlider';
export type { UnifiedSliderProps } from './UnifiedSlider';

export { UnifiedService } from './UnifiedService';
export type { UnifiedServiceProps } from './UnifiedService';

// Существующие компоненты
export { AnimatedCard } from './AnimatedCard';
export type { AnimatedCardProps } from './AnimatedCard';

// Алиасы для совместимости (теперь UnifiedButton включает AnimatedButton)
export { UnifiedButton as AnimatedButton } from './UnifiedButton';
export type { UnifiedButtonProps as AnimatedButtonProps } from './UnifiedButton';

export { AnimatedContainer } from './AnimatedContainer';
export type { AnimatedContainerProps } from './AnimatedContainer';

export { MicroInteraction } from './MicroInteraction';
export type { MicroInteractionProps } from './MicroInteraction';

export { SettingItem } from './SettingItem';

// OpenAI компоненты перемещены в ChatGPT сервис
// export { OpenAIIcon } from './OpenAIIcon';
// export type { OpenAIIconProps } from './OpenAIIcon';

export { AccentColorDemo } from './AccentColorDemo';

// Новые компоненты
export { ProgressIndicator } from './ProgressIndicator';

// Утилиты
export { cn } from '@/utils/cn';
