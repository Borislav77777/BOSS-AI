/**
 * Тест для проверки цветов виджетов
 */

import { TimeWidget } from '@/components/Widgets/TimeWidget';
import { PlatformProvider } from '@/context/PlatformContext';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Мокаем инициализацию виджетов
vi.mock('@/services/initializeWidgets', () => ({
    initializeWidgets: vi.fn(),
}));

// Мокаем ServiceManager
vi.mock('@/services/ServiceManager', () => ({
    serviceManager: {
        loadAllServices: vi.fn().mockResolvedValue([]),
        getSortedServices: vi.fn().mockReturnValue([]),
    },
}));

describe('Widget Colors', () => {
    beforeEach(() => {
        // Очищаем document перед каждым тестом
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.style.cssText = '';
    });

    it('should apply dark theme colors to widgets', () => {
        // Устанавливаем темную тему
        document.documentElement.setAttribute('data-theme', 'dark');

        const mockWidget = {
            id: 'test-widget',
            settings: {
                'show-seconds': true,
                'show-date': true,
                'format24h': true,
            },
        };

        render(
            <PlatformProvider>
                <TimeWidget
                    widget={mockWidget}
                    onMinimize={vi.fn()}
                    onClose={vi.fn()}
                    onSettings={vi.fn()}
                    isMinimized={false}
                />
            </PlatformProvider>
        );

        const widgetContainer = screen.getAllByTestId('widget-container')[0];
        expect(widgetContainer).toBeInTheDocument();

        // Проверяем, что CSS переменные применяются
        const computedStyle = getComputedStyle(widgetContainer!);
        expect(computedStyle.background).not.toBe('transparent');
    });

    it('should apply light theme colors to widgets', () => {
        // Устанавливаем светлую тему
        document.documentElement.setAttribute('data-theme', 'light');

        const mockWidget = {
            id: 'test-widget',
            settings: {
                'show-seconds': true,
                'show-date': true,
                'format24h': true,
            },
        };

        render(
            <PlatformProvider>
                <TimeWidget
                    widget={mockWidget}
                    onMinimize={vi.fn()}
                    onClose={vi.fn()}
                    onSettings={vi.fn()}
                    isMinimized={false}
                />
            </PlatformProvider>
        );

        const widgetContainer = screen.getAllByTestId('widget-container')[0];
        expect(widgetContainer).toBeInTheDocument();

        // Проверяем, что CSS переменные применяются
        const computedStyle = getComputedStyle(widgetContainer!);
        expect(computedStyle.background).not.toBe('transparent');
    });

    it('should apply custom theme colors to widgets', () => {
        // Устанавливаем кастомную тему
        document.documentElement.setAttribute('data-theme', 'custom');

        const mockWidget = {
            id: 'test-widget',
            settings: {
                'show-seconds': true,
                'show-date': true,
                'format24h': true,
            },
        };

        render(
            <PlatformProvider>
                <TimeWidget
                    widget={mockWidget}
                    onMinimize={vi.fn()}
                    onClose={vi.fn()}
                    onSettings={vi.fn()}
                    isMinimized={false}
                />
            </PlatformProvider>
        );

        const widgetContainer = screen.getAllByTestId('widget-container')[0];
        expect(widgetContainer).toBeInTheDocument();

        // Проверяем, что CSS переменные применяются
        const computedStyle = getComputedStyle(widgetContainer!);
        expect(computedStyle.background).not.toBe('transparent');
    });
});
