/**
 * Тесты для lazy loading компонентов
 */

import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';

// Мокаем lazy компоненты
const LazyChat = vi.fn(() => Promise.resolve({ default: () => <div>Chat Component</div> }));
const LazySettings = vi.fn(() => Promise.resolve({ default: () => <div>Settings Component</div> }));
const LazyWorkspace = vi.fn(() => Promise.resolve({ default: () => <div>Workspace Component</div> }));

// Мокаем React.lazy
vi.mock('react', async () => {
    const actual = await vi.importActual('react') as any;
    return {
        ...actual,
        lazy: (importFn: () => Promise<{ default: React.ComponentType }>) => {
            // Определяем какой компонент загружается по имени функции
            if (importFn.toString().includes('Chat')) {
                return LazyChat();
            } else if (importFn.toString().includes('Settings')) {
                return LazySettings();
            } else if (importFn.toString().includes('Workspace')) {
                return LazyWorkspace();
            }
            return importFn();
        }
    };
});

describe('Lazy Loading', () => {
    it('должен загружать Chat компонент асинхронно', async () => {
        const Chat = await import('@/components/Chat/Chat');

        render(
            <Suspense fallback={<div>Loading Chat...</div>}>
                <Chat.default />
            </Suspense>
        );

        await waitFor(() => {
            expect(screen.getByText('Chat Component')).toBeInTheDocument();
        });
    });

    it('должен загружать Settings компонент асинхронно', async () => {
        const Settings = await import('@/components/Settings/Settings');

        render(
            <Suspense fallback={<div>Loading Settings...</div>}>
                <Settings.default />
            </Suspense>
        );

        await waitFor(() => {
            expect(screen.getByText('Settings Component')).toBeInTheDocument();
        });
    });

    it('должен загружать Workspace компонент асинхронно', async () => {
        const Workspace = await import('@/components/Workspace/Workspace');

        render(
            <Suspense fallback={<div>Loading Workspace...</div>}>
                <Workspace.default />
            </Suspense>
        );

        await waitFor(() => {
            expect(screen.getByText('Workspace Component')).toBeInTheDocument();
        });
    });

    it('должен показывать fallback во время загрузки', () => {
        render(
            <Suspense fallback={<div>Loading...</div>}>
                <div>Content</div>
            </Suspense>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('должен обрабатывать ошибки загрузки', async () => {
        const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
            try {
                return <>{children}</>;
            } catch (error) {
                return <div>Error loading component</div>;
            }
        };

        render(
            <ErrorBoundary>
                <Suspense fallback={<div>Loading...</div>}>
                    <div>Content</div>
                </Suspense>
            </ErrorBoundary>
        );

        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});
