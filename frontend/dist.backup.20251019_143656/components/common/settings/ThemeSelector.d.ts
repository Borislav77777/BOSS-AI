import React from 'react';
interface ThemeSelectorProps {
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    className?: string;
}
/**
 * Простой селектор тем - только светлая и темная
 * Минималистичный дизайн без лишних функций
 */
export declare const ThemeSelector: React.FC<ThemeSelectorProps>;
export {};
//# sourceMappingURL=ThemeSelector.d.ts.map