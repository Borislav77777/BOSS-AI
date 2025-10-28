/**
 * Тесты для компонента SettingsSubmenu
 * Покрывает функционал выплывающего подменю настроек
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsSubmenu } from '../components/Sidebar/SettingsSubmenu';
import { PlatformProvider } from '../context/PlatformContext';

// Мокаем usePlatform
const mockSwitchSection = vi.fn();
const mockUsePlatform = {
    state: {
        layout: {
            activeSettingsCategory: 'all',
            sidebarCollapsed: false,
        },
    },
    switchSection: mockSwitchSection,
};

vi.mock('../hooks/usePlatform', () => ({
    usePlatform: () => mockUsePlatform,
}));

// Мокаем settingsService (создаем объект внутри factory, чтобы избежать hoisting-проблем)
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

describe('SettingsSubmenu', () => {
    const defaultProps = {
        isVisible: true,
        isCollapsed: false,
        onClose: vi.fn(),
        activeCategory: 'all',
        onCategoryChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('должен отображаться когда isVisible = true', () => {
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} />
            </PlatformProvider>
        );

        expect(screen.getByText('Настройки')).toBeInTheDocument();
        expect(screen.getByText('Все настройки')).toBeInTheDocument();
    });

    it('не должен отображаться когда isVisible = false', () => {
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} isVisible={false} />
            </PlatformProvider>
        );

        expect(screen.queryByText('Настройки')).not.toBeInTheDocument();
    });

    it('должен показывать все категории настроек', () => {
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} />
            </PlatformProvider>
        );

        expect(screen.getByText('Внешний вид')).toBeInTheDocument();
        expect(screen.getByText('Интерфейс')).toBeInTheDocument();
        expect(screen.getByText('Чат')).toBeInTheDocument();
        expect(screen.getByText('Уведомления')).toBeInTheDocument();
    });

    it('должен вызывать onClose при клике на кнопку закрытия', () => {
        const onClose = vi.fn();
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} onClose={onClose} />
            </PlatformProvider>
        );

        const closeButton = screen.getByTitle('Закрыть меню');
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('должен вызывать onCategoryChange и switchSection при клике на "Все настройки"', async () => {
        const onCategoryChange = vi.fn();
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} onCategoryChange={onCategoryChange} />
            </PlatformProvider>
        );

        const allSettingsButton = screen.getByText('Все настройки');
        fireEvent.click(allSettingsButton);

        await waitFor(() => {
            expect(onCategoryChange).toHaveBeenCalledWith('all');
            expect(mockSwitchSection).toHaveBeenCalledWith('settings');
        });
    });

    it('должен вызывать onCategoryChange и switchSection при клике на категорию', async () => {
        const onCategoryChange = vi.fn();
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} onCategoryChange={onCategoryChange} />
            </PlatformProvider>
        );

        const appearanceButton = screen.getAllByText('Внешний вид')[0];
        fireEvent.click(appearanceButton);

        await waitFor(() => {
            expect(onCategoryChange).toHaveBeenCalledWith('appearance');
            expect(mockSwitchSection).toHaveBeenCalledWith('settings');
        });
    });

    it('должен подсвечивать активную категорию', () => {
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} activeCategory="appearance" />
            </PlatformProvider>
        );

        const appearanceButton = screen.getByText('Внешний вид').closest('button');
        expect(appearanceButton).toHaveClass('bg-primary');
    });

    it('должен адаптироваться к свернутому состоянию сайдбара', () => {
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} isCollapsed={true} />
            </PlatformProvider>
        );

        const menu = screen.getAllByText('Настройки')[0].closest('div');
        expect(menu).toHaveClass('right-16');
    });

    it('должен показывать описания категорий', () => {
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} />
            </PlatformProvider>
        );

        expect(screen.getAllByText('Настройки темы и отображения')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Настройки панелей')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Настройки чата')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Настройки уведомлений')[0]).toBeInTheDocument();
    });

    it('должен закрывать меню после выбора категории', async () => {
        const onClose = vi.fn();
        render(
            <PlatformProvider>
                <SettingsSubmenu {...defaultProps} onClose={onClose} />
            </PlatformProvider>
        );

        const appearanceButton = screen.getAllByText('Внешний вид')[0];
        fireEvent.click(appearanceButton);

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
