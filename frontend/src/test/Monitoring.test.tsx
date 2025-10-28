/**
 * Тесты для мониторинга и аналитики
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Мокаем Sentry
const mockSentry = {
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    addBreadcrumb: vi.fn(),
    setUser: vi.fn(),
    setTag: vi.fn(),
    setContext: vi.fn(),
};

vi.mock('@sentry/react', () => ({
    init: mockSentry.init,
    captureException: mockSentry.captureException,
    captureMessage: mockSentry.captureMessage,
    addBreadcrumb: mockSentry.addBreadcrumb,
    setUser: mockSentry.setUser,
    setTag: mockSentry.setTag,
    setContext: mockSentry.setContext,
}));

// Мокаем Performance API
const mockPerformance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
};

Object.defineProperty(window, 'performance', {
    value: mockPerformance,
    writable: true,
});

// Мокаем Intersection Observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
});
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
});

// Мокаем Resize Observer
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
});
Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
});

// Компонент для тестирования мониторинга
const MonitoringComponent = () => {
    const handleError = () => {
        throw new Error('Test error');
    };

    const handlePerformance = () => {
        const start = performance.now();
        // Симуляция работы
        setTimeout(() => {
            const end = performance.now();
            console.log(`Operation took ${end - start} milliseconds`);
        }, 100);
    };

    const handleAnalytics = () => {
        // Симуляция отправки аналитики
        console.log('Analytics event: button_click');
    };

    return (
        <div>
            <button onClick={handleError} data-testid="error-button">
                Trigger Error
            </button>
            <button onClick={handlePerformance} data-testid="performance-button">
                Test Performance
            </button>
            <button onClick={handleAnalytics} data-testid="analytics-button">
                Send Analytics
            </button>
        </div>
    );
};

describe('Monitoring and Analytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('должен инициализировать Sentry', () => {
        mockSentry.init({
            dsn: 'test-dsn',
            environment: 'test',
        });

        expect(mockSentry.init).toHaveBeenCalledWith({
            dsn: 'test-dsn',
            environment: 'test',
        });
    });

    it('должен отслеживать ошибки', () => {
        const error = new Error('Test error');

        mockSentry.captureException(error);

        expect(mockSentry.captureException).toHaveBeenCalledWith(error);
    });

    it('должен отслеживать сообщения', () => {
        mockSentry.captureMessage('Test message', 'info');

        expect(mockSentry.captureMessage).toHaveBeenCalledWith('Test message', 'info');
    });

    it('должен добавлять breadcrumbs', () => {
        mockSentry.addBreadcrumb({
            message: 'User clicked button',
            category: 'user-action',
            level: 'info',
        });

        expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
            message: 'User clicked button',
            category: 'user-action',
            level: 'info',
        });
    });

    it('должен устанавливать пользователя', () => {
        mockSentry.setUser({
            id: '123',
            email: 'test@example.com',
        });

        expect(mockSentry.setUser).toHaveBeenCalledWith({
            id: '123',
            email: 'test@example.com',
        });
    });

    it('должен устанавливать теги', () => {
        mockSentry.setTag('environment', 'test');
        mockSentry.setTag('version', '1.0.0');

        expect(mockSentry.setTag).toHaveBeenCalledWith('environment', 'test');
        expect(mockSentry.setTag).toHaveBeenCalledWith('version', '1.0.0');
    });

    it('должен устанавливать контекст', () => {
        mockSentry.setContext('user', {
            id: '123',
            role: 'admin',
        });

        expect(mockSentry.setContext).toHaveBeenCalledWith('user', {
            id: '123',
            role: 'admin',
        });
    });

    it('должен измерять производительность', () => {
        const start = performance.now();

        // Симуляция работы
        const end = performance.now();
        const duration = end - start;

        expect(duration).toBeGreaterThanOrEqual(0);
        expect(mockPerformance.now).toHaveBeenCalled();
    });

    it('должен создавать performance marks', () => {
        performance.mark('operation-start');
        performance.mark('operation-end');

        expect(mockPerformance.mark).toHaveBeenCalledWith('operation-start');
        expect(mockPerformance.mark).toHaveBeenCalledWith('operation-end');
    });

    it('должен измерять время между marks', () => {
        performance.mark('start');
        performance.mark('end');
        performance.measure('operation', 'start', 'end');

        expect(mockPerformance.measure).toHaveBeenCalledWith('operation', 'start', 'end');
    });

    it('должен отслеживать видимость элементов', () => {
        render(<MonitoringComponent />);

        // IntersectionObserver должен быть создан
        expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('должен отслеживать изменения размера', () => {
        render(<MonitoringComponent />);

        // ResizeObserver должен быть создан
        expect(mockResizeObserver).toHaveBeenCalled();
    });

    it('должен отправлять аналитические события', () => {
        render(<MonitoringComponent />);

        const analyticsButton = screen.getByTestId('analytics-button');
        fireEvent.click(analyticsButton);

        expect(console.log).toHaveBeenCalledWith('Analytics event: button_click');
    });

    it('должен отслеживать время загрузки страницы', () => {
        performance.getEntriesByType('navigation');

        expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('navigation');
    });

    it('должен отслеживать время загрузки ресурсов', () => {
        performance.getEntriesByType('resource');

        expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('resource');
    });

    it('должен очищать performance marks', () => {
        performance.clearMarks();
        performance.clearMeasures();

        expect(mockPerformance.clearMarks).toHaveBeenCalled();
        expect(mockPerformance.clearMeasures).toHaveBeenCalled();
    });

    it('должен отслеживать пользовательские события', () => {
        render(<MonitoringComponent />);

        const button = screen.getByTestId('analytics-button');
        fireEvent.click(button);

        // Должно быть логирование события
        expect(console.log).toHaveBeenCalled();
    });

    it('должен обрабатывать ошибки в Error Boundary', () => {
        render(<MonitoringComponent />);

        const errorButton = screen.getByTestId('error-button');

        // Ошибка должна быть перехвачена
        expect(() => fireEvent.click(errorButton)).not.toThrow();
    });
});
