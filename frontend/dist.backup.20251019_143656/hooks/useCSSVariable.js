import { useCallback } from 'react';
/**
 * Хук для управления CSS переменными без inline стилей
 * Решает проблему линтер-ошибок с inline styles
 */
export const useCSSVariable = () => {
    const setCSSVariable = useCallback((element, variable, value) => {
        if (element) {
            element.style.setProperty(variable, String(value));
        }
    }, []);
    const setCSSVariables = useCallback((element, variables) => {
        if (element) {
            Object.entries(variables).forEach(([key, value]) => {
                element.style.setProperty(key, String(value));
            });
        }
    }, []);
    return {
        setCSSVariable,
        setCSSVariables,
    };
};
//# sourceMappingURL=useCSSVariable.js.map