/**
 * Интеграционные тесты для Settings компонента с новой логикой
 * Проверяет работу с глобальным состоянием activeSettingsCategory
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Settings } from '../components/Settings/Settings';
import { PlatformProvider } from '../context/PlatformContext';

// Мокаем usePlatform
const mockUsePlatform = {
    state: {
        layout: {
            activeSettingsCategory: 'all',
        },
    },
    setActiveSettingsCategory: vi.fn(),
};

vi.mock('../hooks/usePlatform', () => ({
    usePlatform: () => mockUsePlatform,
}));

// Мокаем useSettings
const mockUseSettings = {
    settings: {
        theme: 'dark',
        fontSize: 'medium',
        animations: true,
    },
    showSaveSuccess: false,
    handleSettingChange: vi.fn(),
    handleSave: vi.fn(),
    handleReset: vi.fn(),
};

vi.mock('../hooks/useSettings', () => ({
    useSettings: () => mockUseSettings,
}));

// Мокаем settingsService (вся структура создается внутри factory, чтобы избежать hoisting-проблем)
vi.mock('../services/settings', () => ({
    settingsService: {
        getSettingsCategories: () => [
            {
                id: 'appearance',
                name: 'Внешний вид',
                description: 'Настройки темы и отображения',
                items: [
                    {
                        id: 'theme',
                        name: 'Тема',
                        description: 'Выберите тему',
                        type: 'select',
                        value: 'dark',
                    },
                ],
            },
            {
                id: 'interface',
                name: 'Интерфейс',
                description: 'Настройки панелей',
                items: [
                    {
                        id: 'sidebarCollapsed',
                        name: 'Свернуть панель',
                        description: 'Скрыть боковую панель',
                        type: 'boolean',
                        value: false,
                    },
                ],
            },
        ],
    },
    themeService: {
        applyTheme: vi.fn(),
    },
}));

describe('Settings Integration with Global State', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('должен отображать все категории когда activeCategory = "all"', () => {
        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        expect(screen.getAllByText('Внешний вид')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Интерфейс')[0]).toBeInTheDocument();
    });

    it('должен показывать только выбранную категорию когда activeCategory != "all"', () => {
        const withSpecificCategory = {
            ...mockUsePlatform,
            state: {
                layout: {
                    activeSettingsCategory: 'appearance',
                },
            },
        };

        vi.mocked(mockUsePlatform).state = withSpecificCategory.state;

        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        expect(screen.getAllByText('Внешний вид')[0]).toBeInTheDocument();
        expect(screen.queryByText('Интерфейс')).not.toBeInTheDocument();
    });

    it('должен обновлять глобальное состояние при клике на категорию в боковой панели', async () => {
        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        const appearanceButton = screen.getAllByText('Внешний вид')[0];
        fireEvent.click(appearanceButton);

        await waitFor(() => {
            expect(mockUsePlatform.setActiveSettingsCategory).toHaveBeenCalledWith('appearance');
        });
    });

    it('должен подсвечивать активную категорию в боковой панели', () => {
        const withActiveCategory = {
            ...mockUsePlatform,
            state: {
                layout: {
                    activeSettingsCategory: 'appearance',
                },
            },
        };

        vi.mocked(mockUsePlatform).state = withActiveCategory.state;

        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        const appearanceButton = screen.getAllByText('Внешний вид')[0].closest('button');
        expect(appearanceButton).toHaveClass('bg-primary');
    });

    it('должен отображать боковую панель с категориями', () => {
        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        expect(screen.getAllByText('Настройки')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Все настройки')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Внешний вид')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Интерфейс')[0]).toBeInTheDocument();
    });

    it('должен показывать описания категорий в боковой панели', () => {
        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        expect(screen.getAllByText('Настройки темы и отображения')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Настройки панелей')[0]).toBeInTheDocument();
    });

    it('должен отображать настройки выбранной категории в основной области', () => {
        const withActiveCategory = {
            ...mockUsePlatform,
            state: {
                layout: {
                    activeSettingsCategory: 'appearance',
                },
            },
        };

        vi.mocked(mockUsePlatform).state = withActiveCategory.state;

        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        // Должны отображаться настройки категории "appearance"
        expect(screen.getAllByText('Тема')[0]).toBeInTheDocument();
    });

    it('должен показывать все настройки когда активна категория "all"', () => {
        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        // Должны отображаться настройки всех категорий
        expect(screen.getAllByText('Тема')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Свернуть панель')[0]).toBeInTheDocument();
    });

    it('должен иметь кнопки сохранения и сброса настроек', () => {
        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        expect(screen.getAllByText('Сохранить настройки')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Сбросить настройки')[0]).toBeInTheDocument();
    });

    it('должен корректно обрабатывать изменения настроек', async () => {
        render(
            <PlatformProvider>
                <Settings />
            </PlatformProvider>
        );

        const saveButton = screen.getAllByText('Сохранить настройки')[0];
        fireEvent.click(saveButton);

        expect(mockUseSettings.handleSave).toHaveBeenCalled();
    });
});
