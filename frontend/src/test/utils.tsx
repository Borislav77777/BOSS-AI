/**
 * Утилиты для тестирования React компонентов
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { expect, vi } from 'vitest';
import { PlatformProvider } from '../context/PlatformContext';

// Моки для внешних зависимостей
export const mockServices = {
    notificationService: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
    },
    errorLoggingService: {
        logError: vi.fn(),
        getErrors: vi.fn(() => []),
        exportErrors: vi.fn(() => []),
    },
    settingsService: {
        getSettings: vi.fn(() => ({})),
        saveSettings: vi.fn(),
        resetSettings: vi.fn(),
    },
};

// Моки для CSS переменных
export const mockCSSVariables = {
    '--primary': '#e5e7eb',
    '--background': '#0a0a0a',
    '--surface': '#1a1a1a',
    '--text': '#e5e7eb',
    '--text-secondary': '#9ca3af',
    '--border': 'rgba(255,255,255,0.10)',
};

// Моки для localStorage
export const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

// Моки для clipboard API
export const mockClipboard = {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
};

// Моки для MediaRecorder API
export const mockMediaRecorder = {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    ondataavailable: null,
    onstop: null,
    mimeType: 'audio/webm',
    state: 'inactive',
};

// Моки для navigator.mediaDevices
export const mockMediaDevices = {
    getUserMedia: vi.fn(() => Promise.resolve({
        getTracks: vi.fn(() => [
            { stop: vi.fn() }
        ]),
    })),
};

// Утилита для рендеринга компонентов с провайдерами
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <PlatformProvider>
            {children}
        </PlatformProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> => render(ui, { wrapper: AllTheProviders, ...options });

// Утилита для создания моков файлов
export const createMockFile = (
    name: string,
    type: string,
    size: number = 1024,
    content: string = 'test content'
) => {
    const file = new File([content], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
};

// Утилита для создания моков Blob
export const createMockBlob = (
    content: string = 'test content',
    type: string = 'audio/webm'
) => {
    return new Blob([content], { type });
};

// Утилита для ожидания асинхронных операций
export const waitForAsync = (ms: number = 0) =>
    new Promise(resolve => setTimeout(resolve, ms));

// Утилита для проверки CSS переменных
export const checkCSSVariable = (element: HTMLElement, variable: string, expectedValue?: string) => {
    const value = getComputedStyle(element).getPropertyValue(variable);
    if (expectedValue) {
        expect(value).toBe(expectedValue);
    }
    return value;
};

// Утилита для симуляции событий клавиатуры
export const simulateKeyPress = (element: HTMLElement, key: string, keyCode?: number) => {
    const event = new KeyboardEvent('keydown', {
        key,
        keyCode: keyCode || key.charCodeAt(0),
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(event);
};

// Утилита для симуляции событий мыши
export const simulateMouseEvent = (
    element: HTMLElement,
    eventType: 'click' | 'mousedown' | 'mouseup' | 'mousemove',
    clientX: number = 0,
    clientY: number = 0
) => {
    const event = new MouseEvent(eventType, {
        clientX,
        clientY,
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(event);
};

// Утилита для симуляции событий touch
export const simulateTouchEvent = (
    element: HTMLElement,
    eventType: 'touchstart' | 'touchmove' | 'touchend',
    clientX: number = 0,
    clientY: number = 0
) => {
    const touch = new Touch({
        identifier: 1,
        target: element,
        clientX,
        clientY,
    });

    const event = new TouchEvent(eventType, {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
        bubbles: true,
        cancelable: true,
    });

    element.dispatchEvent(event);
};

// Утилита для проверки анимаций
export const waitForAnimation = async (element: HTMLElement, timeout: number = 1000) => {
    return new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Animation timeout'));
        }, timeout);

        const handleAnimationEnd = () => {
            clearTimeout(timeoutId);
            element.removeEventListener('animationend', handleAnimationEnd);
            element.removeEventListener('transitionend', handleAnimationEnd);
            resolve();
        };

        element.addEventListener('animationend', handleAnimationEnd);
        element.addEventListener('transitionend', handleAnimationEnd);
    });
};

// Утилита для проверки доступности
export const checkAccessibility = (element: HTMLElement) => {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const role = element.getAttribute('role');
    const tabIndex = element.getAttribute('tabindex');

    return {
        hasAriaLabel: !!ariaLabel,
        hasAriaLabelledBy: !!ariaLabelledBy,
        hasRole: !!role,
        isFocusable: tabIndex !== null && parseInt(tabIndex) >= 0,
    };
};

// Утилита для проверки темы
export const checkTheme = (element: HTMLElement, expectedTheme: string) => {
    const themeAttribute = element.getAttribute('data-theme');
    expect(themeAttribute).toBe(expectedTheme);
};

// Утилита для проверки CSS классов
export const checkCSSClasses = (element: HTMLElement, expectedClasses: string[]) => {
    expectedClasses.forEach(className => {
        expect(element.classList.contains(className)).toBe(true);
    });
};

// Экспортируем кастомный рендер
export { customRender as render };

// Экспортируем все из testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
