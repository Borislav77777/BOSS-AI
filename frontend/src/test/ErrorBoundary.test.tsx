/**
 * Тесты для Error Boundaries
 */

import { ChatErrorBoundary } from '@/components/common/ChatErrorBoundary';
import { EnhancedErrorBoundary } from '@/components/common/EnhancedErrorBoundary';
import { ServiceErrorBoundary } from '@/components/common/ServiceErrorBoundary';
import { SettingsErrorBoundary } from '@/components/common/SettingsErrorBoundary';
import { WorkspaceErrorBoundary } from '@/components/common/WorkspaceErrorBoundary';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Компонент, который выбрасывает ошибку для тестирования
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('EnhancedErrorBoundary', () => {
    beforeEach(() => {
        // Подавляем console.error в тестах
        vi.spyOn(console, 'error').mockImplementation(() => { });
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('отображает fallback UI при ошибке', () => {
        render(
            <EnhancedErrorBoundary>
                <ThrowError shouldThrow={true} />
            </EnhancedErrorBoundary>
        );

        expect(screen.getByText('Произошла ошибка')).toBeInTheDocument();
        expect(screen.getByText('Попробовать снова')).toBeInTheDocument();
        expect(screen.getByText('Перезагрузить страницу')).toBeInTheDocument();
    });

    it('отображает children когда нет ошибки', () => {
        render(
            <EnhancedErrorBoundary>
                <ThrowError shouldThrow={false} />
            </EnhancedErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('показывает детали ошибки в development режиме', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        render(
            <EnhancedErrorBoundary>
                <ThrowError shouldThrow={true} />
            </EnhancedErrorBoundary>
        );

        expect(screen.getByText('Детали ошибки (только для разработки)')).toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });

    it('вызывает onError callback при ошибке', () => {
        const onError = vi.fn();

        render(
            <EnhancedErrorBoundary onError={onError}>
                <ThrowError shouldThrow={true} />
            </EnhancedErrorBoundary>
        );

        expect(onError).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                componentStack: expect.any(String),
            })
        );
    });

    it('восстанавливается после нажатия кнопки retry', async () => {
        // Создаем новый экземпляр ErrorBoundary для каждого теста
        const TestComponent = ({ shouldThrow, key }: { shouldThrow: boolean; key?: string }) => (
            <EnhancedErrorBoundary key={key}>
                <ThrowError shouldThrow={shouldThrow} />
            </EnhancedErrorBoundary>
        );

        const { rerender } = render(<TestComponent shouldThrow={true} key="error" />);

        expect(screen.getByText('Произошла ошибка')).toBeInTheDocument();

        // Нажимаем кнопку retry
        fireEvent.click(screen.getByText('Попробовать снова'));

        // Создаем полностью новый экземпляр с другим ключом
        rerender(<TestComponent shouldThrow={false} key="recovered" />);

        // Ждем пока компонент восстановится
        await waitFor(() => {
            expect(screen.getByText('No error')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});

describe('ServiceErrorBoundary', () => {
    it('отображает контекстную информацию о сервисе', () => {
        render(
            <ServiceErrorBoundary serviceName="test-service">
                <ThrowError shouldThrow={true} />
            </ServiceErrorBoundary>
        );

        expect(screen.getByText('Ошибка сервиса: test-service')).toBeInTheDocument();
    });
});

describe('SettingsErrorBoundary', () => {
    it('отображает контекстную информацию о настройке', () => {
        render(
            <SettingsErrorBoundary settingName="test-setting">
                <ThrowError shouldThrow={true} />
            </SettingsErrorBoundary>
        );

        expect(screen.getByText('Ошибка настройки: test-setting')).toBeInTheDocument();
    });
});

describe('ChatErrorBoundary', () => {
    it('отображает контекстную информацию о чате', () => {
        render(
            <ChatErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ChatErrorBoundary>
        );

        expect(screen.getByText('Ошибка чата')).toBeInTheDocument();
    });
});

describe('WorkspaceErrorBoundary', () => {
    it('отображает контекстную информацию о рабочем пространстве', () => {
        render(
            <WorkspaceErrorBoundary>
                <ThrowError shouldThrow={true} />
            </WorkspaceErrorBoundary>
        );

        expect(screen.getByText('Ошибка рабочего пространства')).toBeInTheDocument();
    });
});
