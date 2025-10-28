/**
 * Интеграционные тесты для Sidebar с новым функционалом подменю настроек
 * Проверяет взаимодействие между Sidebar и SettingsSubmenu
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { PlatformProvider } from '../context/PlatformContext';

// Мокаем usePlatform
const mockUsePlatform = {
    state: {
        layout: {
            activeSettingsCategory: 'all',
            sidebarCollapsed: false,
            activeSection: 'workspace',
        },
        services: [],
        workspaceItems: [],
        settings: {
            theme: 'dark',
        },
    },
    toggleSidebar: vi.fn(),
    switchSection: vi.fn((section) => {
        mockUsePlatform.state.layout.activeSection = section;
    }),
    executeServiceTool: vi.fn(),
    createWorkspaceItem: vi.fn(),
    setActiveSettingsCategory: vi.fn(),
};

vi.mock('../hooks/usePlatform', () => ({
    usePlatform: () => mockUsePlatform,
}));

// Мокаем settingsService (вся структура внутри factory для избежания hoisting-проблем)
vi.mock('../services/settings', () => ({
    settingsService: {
        getSettingsCategories: () => [
            { id: 'appearance', name: 'Внешний вид', description: 'Настройки темы и отображения' },
            { id: 'interface', name: 'Интерфейс', description: 'Настройки панелей' },
            { id: 'chat', name: 'Чат', description: 'Настройки чата' },
            { id: 'notifications', name: 'Уведомления', description: 'Настройки уведомлений' },
        ],
    },
    themeService: {
        applyTheme: vi.fn(),
    },
}));

describe('Sidebar Integration with SettingsSubmenu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен отображать кнопку настроек в дополнительной панели', () => {
        render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        const settingsButton = screen.getAllByTitle('Настройки')[0];
        expect(settingsButton).toBeInTheDocument();
    });

    it('должен показывать подменю при клике на кнопку настроек', async () => {
        render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        const settingsButton = screen.getAllByTitle('Настройки')[0];
        fireEvent.click(settingsButton);

        // Активируем секцию настроек вручную
        mockUsePlatform.state.layout.activeSection = 'settings';

        await waitFor(() => {
            expect(screen.getByText('Все настройки')).toBeInTheDocument();
            expect(screen.getByText('Внешний вид')).toBeInTheDocument();
        });
    });

    it('должен скрывать подменю при повторном клике на кнопку настроек', async () => {
        render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        const settingsButton = screen.getAllByTitle('Настройки')[0];

        // Первый клик - показываем меню
        fireEvent.click(settingsButton);
        mockUsePlatform.state.layout.activeSection = 'settings';
        await waitFor(() => {
            expect(screen.getByText('Все настройки')).toBeInTheDocument();
        });

        // Второй клик - скрываем меню
        fireEvent.click(settingsButton);
        mockUsePlatform.state.layout.activeSection = 'workspace';
        await waitFor(() => {
            expect(screen.queryByText('Все настройки')).not.toBeInTheDocument();
        });
    });

    it('должен переключать секцию на settings при выборе категории', async () => {
        render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        const settingsButton = screen.getAllByTitle('Настройки')[0];
        fireEvent.click(settingsButton);
        mockUsePlatform.state.layout.activeSection = 'settings';

        await waitFor(() => {
            const appearanceButton = screen.getByText('Внешний вид');
            fireEvent.click(appearanceButton);
        });

        await waitFor(() => {
            expect(mockUsePlatform.switchSection).toHaveBeenCalledWith('settings');
            expect(mockUsePlatform.setActiveSettingsCategory).toHaveBeenCalledWith('appearance');
        });
    });

    it('должен корректно работать в свернутом состоянии', async () => {
        const collapsedMock = {
            ...mockUsePlatform,
            state: {
                ...mockUsePlatform.state,
                layout: {
                    ...mockUsePlatform.state.layout,
                    sidebarCollapsed: true,
                },
            },
        };

        vi.mocked(mockUsePlatform).state = collapsedMock.state;

        render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        const settingsButton = screen.getAllByTitle('Настройки')[0];
        fireEvent.click(settingsButton);

        await waitFor(() => {
            expect(screen.getByText('Все настройки')).toBeInTheDocument();
            // Проверяем, что подменю позиционируется корректно для свернутого состояния
            const menu = screen.getByText('Настройки').closest('div');
            expect(menu).toHaveClass('right-16');
        });
    });

    it('должен подсвечивать активную категорию в подменю', async () => {
        const withActiveCategory = {
            ...mockUsePlatform,
            state: {
                ...mockUsePlatform.state,
                layout: {
                    ...mockUsePlatform.state.layout,
                    activeSettingsCategory: 'appearance',
                },
            },
        };

        vi.mocked(mockUsePlatform).state = withActiveCategory.state;

        render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        const settingsButton = screen.getAllByTitle('Настройки')[0];
        fireEvent.click(settingsButton);

        await waitFor(() => {
            const appearanceButton = screen.getByText('Внешний вид').closest('button');
            expect(appearanceButton).toHaveClass('bg-primary');
        });
    });

    it('должен закрывать подменю при выборе категории', async () => {
        render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        const settingsButton = screen.getAllByTitle('Настройки')[0];
        fireEvent.click(settingsButton);

        // Ждем, пока секция настроек активируется и подменю появится
        await waitFor(() => {
            expect(screen.getByText('Внешний вид')).toBeInTheDocument();
        }, { timeout: 3000 });

        const appearanceButton = screen.getByText('Внешний вид');
        fireEvent.click(appearanceButton);

        await waitFor(() => {
            // Подменю должно закрыться после выбора
            expect(screen.queryByText('Внешний вид')).not.toBeInTheDocument();
        });
    });

    it('должен показывать все категории настроек в подменю', async () => {
        render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        const settingsButton = screen.getAllByTitle('Настройки')[0];
        fireEvent.click(settingsButton);

        // Ждем, пока секция настроек активируется и подменю появится
        await waitFor(() => {
            expect(screen.getByText('Внешний вид')).toBeInTheDocument();
            expect(screen.getByText('Интерфейс')).toBeInTheDocument();
            expect(screen.getByText('Чат')).toBeInTheDocument();
            expect(screen.getByText('Уведомления')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
