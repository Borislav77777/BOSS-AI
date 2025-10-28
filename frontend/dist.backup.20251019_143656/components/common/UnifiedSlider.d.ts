/**
 * Унифицированный ползунок платформы
 * Объединяет все типы ползунков: default, rainbow, hue, brightness, fontSize
 * Использует платформенные CSS переменные для единообразия
 */
import React from 'react';
export interface UnifiedSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
    variant?: 'default' | 'rainbow' | 'hue' | 'brightness' | 'fontSize';
    size?: 'sm' | 'md' | 'lg';
    orientation?: 'horizontal' | 'vertical';
    showValue?: boolean;
    showLabels?: boolean;
    labels?: string[];
    value?: number;
    onChange?: (value: number) => void;
    onValueChange?: (value: number) => void;
    className?: string;
}
export declare const UnifiedSlider: React.FC<UnifiedSliderProps>;
export declare const FontSizeSlider: (props: Omit<UnifiedSliderProps, "variant">) => any;
export declare const RainbowSlider: (props: Omit<UnifiedSliderProps, "variant">) => any;
export declare const HueSlider: (props: Omit<UnifiedSliderProps, "variant">) => any;
export declare const BrightnessSlider: (props: Omit<UnifiedSliderProps, "variant">) => any;
//# sourceMappingURL=UnifiedSlider.d.ts.map