import { useCallback } from 'react';

/**
 * Хук для управления CSS переменными без inline стилей
 * Решает проблему линтер-ошибок с inline styles
 */
export const useCSSVariable = () => {
  const setCSSVariable = useCallback((element: HTMLElement | null, variable: string, value: string | number) => {
    if (element) {
      element.style.setProperty(variable, String(value));
    }
  }, []);

  const setCSSVariables = useCallback((element: HTMLElement | null, variables: Record<string, string | number>) => {
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
