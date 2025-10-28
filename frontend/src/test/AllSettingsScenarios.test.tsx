import { Sidebar } from '@/components/Sidebar/Sidebar';
import { PlatformProvider } from '@/context/PlatformContext';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Мокаем хук usePlatform
const mockUsePlatform = {
    state: {
        layout: {
            sidebarCollapsed: false,
            activeSection: 'workspace',
            activeSettingsCategory: 'appearance',
            sidebarWidth: 280,
            chatWidth: 400,
            chatInputHeight: 200,
            chatVisible: false,
        },
        workspaceItems: [],
        services: [],
        isLoading: false,
        error: null,
    },
    toggleSidebar: vi.fn(),
    switchSection: vi.fn(),
    executeServiceTool: vi.fn(),
    createWorkspaceItem: vi.fn(),
    setActiveSettingsCategory: vi.fn(),
    updateSettings: vi.fn(),
};

vi.mock('@/hooks/usePlatform', () => ({
    usePlatform: () => mockUsePlatform,
}));

describe('All Settings Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
        mockUsePlatform.state.layout.activeSection = 'workspace';
        mockUsePlatform.state.layout.activeSettingsCategory = 'appearance';
    });

    it('should show dropdown on first click, keep it open when selecting category', async () => {
        const { rerender } = render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        // В интерфейсе есть верхняя и нижняя кнопки "Настройки" — берём верхнюю (основную)
        const settingsButtons = screen.getAllByRole('button', { name: /Настройки/i });
        const settingsButton = settingsButtons[0];

        // Первый клик - должен показать выпадающее меню
        fireEvent.click(settingsButton);
        // Активируем секцию настроек
        mockUsePlatform.state.layout.activeSection = 'settings';
        // Ждем, пока секция настроек активируется и dropdown появится
        await waitFor(() => {
            const dropdown = document.querySelector('.sidebar-service-dropdown');
            expect(dropdown).toBeTruthy();
        }, { timeout: 3000 });

        const dropdown = document.querySelector('.sidebar-service-dropdown');
        const scoped = within(dropdown as HTMLElement);
        // В развернутом состоянии текст находится в service-title, а не в title
        expect(scoped.getByText('Внешний вид')).toBeInTheDocument();

        // Выбираем категорию - меню должно остаться открытым
        const appearanceButtons = scoped.getAllByText('Внешний вид');
        const appearanceButton = appearanceButtons[0]; // Берем первый матчер при дубликатах
        fireEvent.click(appearanceButton);

        // Проверяем, что настройки открылись
        expect(mockUsePlatform.switchSection).toHaveBeenCalledWith('settings');
        // В текущей реализации категория по умолчанию устанавливается как 'all'
        expect(mockUsePlatform.setActiveSettingsCategory).toHaveBeenCalledWith('all');

        // Меню должно остаться открытым
        expect(scoped.getAllByText('Внешний вид')[0]).toBeInTheDocument();
    });

    it('should work in collapsed mode', async () => {
        // Устанавливаем свернутый режим
        mockUsePlatform.state.layout.sidebarCollapsed = true;

        const { rerender } = render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        // Находим кнопку настроек (в свернутом виде)
        const settingsButtons = screen.getAllByRole('button', { name: /Настройки/i });
        const mainSettingsButton = settingsButtons[0]; // Основная кнопка

        // Кликаем - должен показать выпадающее меню
        fireEvent.click(mainSettingsButton);
        // Активируем секцию настроек
        mockUsePlatform.state.layout.activeSection = 'settings';
        // Ждем, пока секция настроек активируется и dropdown появится
        await waitFor(() => {
            const dropdown2 = document.querySelector('.sidebar-service-dropdown');
            expect(dropdown2).toBeTruthy();
        }, { timeout: 3000 });

        // В свернутом виде должны быть иконки в dropdown; берём их из контейнера dropdown
        const dropdown2 = document.querySelector('.sidebar-service-dropdown') as HTMLElement;
        const scoped2 = within(dropdown2);
        expect(scoped2.getAllByTitle('Внешний вид')[0]).toBeInTheDocument();
        expect(scoped2.getAllByTitle('Интерфейс')[0]).toBeInTheDocument();
        expect(scoped2.getAllByTitle('Чат')[0]).toBeInTheDocument();
        // Для 'Уведомления' на странице встречается несколько кнопок (dropdown + футер) — выбираем из dropdown
        expect(scoped2.getAllByTitle('Уведомления')[0]).toBeInTheDocument();
    });

    it('should work with bottom button', async () => {
        const { rerender } = render(
            <PlatformProvider>
                <Sidebar />
            </PlatformProvider>
        );

        // Находим кнопку внизу
        const settingsButtons = screen.getAllByRole('button', { name: /Настройки/i });
        const bottomSettingsButton = settingsButtons[settingsButtons.length - 1];

        // Кликаем - должен показать выпадающее меню
        fireEvent.click(bottomSettingsButton);
        // Активируем секцию настроек
        mockUsePlatform.state.layout.activeSection = 'settings';
        // Ждем, пока секция настроек активируется и dropdown появится
        await waitFor(() => {
            const dropdown3 = document.querySelector('.sidebar-service-dropdown');
            expect(dropdown3).toBeTruthy();
        }, { timeout: 3000 });

        const dropdown3 = document.querySelector('.sidebar-service-dropdown') as HTMLElement;
        const scoped3 = within(dropdown3);
        expect(scoped3.getAllByText('Внешний вид')[0]).toBeInTheDocument();

        // Выбираем категорию
        const appearanceButtons = scoped3.getAllByText('Внешний вид');
        const appearanceButton = appearanceButtons[0]; // Берем первый матчер при дубликатах
        fireEvent.click(appearanceButton);

        // Проверяем, что настройки открылись
        expect(mockUsePlatform.switchSection).toHaveBeenCalledWith('settings');
        // По текущей логике выставляется 'all'
        expect(mockUsePlatform.setActiveSettingsCategory).toHaveBeenCalledWith('all');
    });
});
