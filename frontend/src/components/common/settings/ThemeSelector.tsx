import React, { memo, useCallback } from 'react';
import { cn } from '../../../utils/cn';

interface ThemeSelectorProps {
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    className?: string;
}

/**
 * Простой селектор тем - только светлая и темная
 * Минималистичный дизайн без лишних функций
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = memo(({
    theme,
    onThemeChange,
    className = ''
}) => {
    const handleThemeSelect = useCallback((selectedTheme: 'light' | 'dark') => {
        onThemeChange(selectedTheme);
    }, [onThemeChange]);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Заголовок */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-text mb-1">
                    Тема
                </h3>
                <p className="text-sm text-text-secondary">
                    Выберите светлую или темную тему
                </p>
            </div>

            {/* Кнопки выбора темы */}
            <div className="flex space-x-2">
                {/* Светлая тема */}
                <button
                    onClick={() => handleThemeSelect('light')}
                    className={cn(
                        "flex-1 p-3 rounded-lg border-2 transition-all duration-200",
                        "bg-card text-text border-primary",
                        theme === 'light'
                            ? "ring-2 ring-primary shadow-lg"
                            : "hover:bg-surface"
                    )}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-black rounded"></div>
                        <span className="font-medium">Светлая</span>
                    </div>
                </button>

                {/* Темная тема */}
                <button
                    onClick={() => handleThemeSelect('dark')}
                    className={cn(
                        "flex-1 p-3 rounded-lg border-2 transition-all duration-200",
                        "bg-black text-white border-black",
                        theme === 'dark'
                            ? "ring-2 ring-white shadow-lg"
                            : "hover:bg-gray-800"
                    )}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-white rounded"></div>
                        <span className="font-medium">Темная</span>
                    </div>
                </button>
            </div>

            {/* Информация о текущей теме */}
            <div className="text-center text-xs text-text-secondary">
                {theme === 'light' ? 'Белый фон, черный текст' : 'Черный фон, белый текст'}
            </div>
        </div>
    );
});

ThemeSelector.displayName = 'ThemeSelector';
