import { PlatformContext } from '@/context/PlatformContextDefinition';
import { useContext } from 'react';
// Хук для использования контекста
export function usePlatform() {
    const context = useContext(PlatformContext);
    if (context === undefined) {
        // Возвращаем заглушку вместо выброса ошибки
        console.warn('usePlatform called outside PlatformProvider, returning fallback context');
        return {
            state: {
                user: null,
                authUser: null,
                authLoading: false,
                authError: null,
                layout: {
                    sidebarCollapsed: false,
                    sidebarWidth: 300,
                    chatVisible: true,
                    chatWidth: 400,
                    chatInputHeight: 300,
                    workspaceLayout: 'grid',
                    activeService: null,
                    activeTool: null,
                    activeSection: 'workspace',
                    activeSettingsCategory: 'all',
                    activeWidgetsCategory: [],
                    chatType: 'default',
                    expandedTabsHeight: 0,
                },
                services: [],
                activeChat: null,
                workspaceItems: [],
                settings: {
                    theme: 'dark',
                    fontSize: 'medium',
                    animations: true,
                    sidebarCollapsed: false,
                    useColoredText: false,
                    textColor: '#ffffff',
                    accentsEnabled: false,
                    autoScroll: true,
                    hideChatFunctionButtons: false,
                    showTimestamps: false,
                },
                isLoading: true,
                error: null,
                isInitialized: false,
            },
            dispatch: () => { },
            switchService: () => { },
            switchTool: () => { },
            sendMessage: async () => { },
            createWorkspaceItem: () => { },
            updateSettings: () => { },
            toggleSidebar: () => { },
            toggleChat: () => { },
            setChatType: () => { },
            switchSection: () => { },
            setActiveSettingsCategory: () => { },
            setExpandedTabsHeight: () => { },
            toggleService: () => { },
            executeServiceTool: async () => ({ success: false }),
            // Auth методы
            loginWithTelegram: async () => { },
            logout: async () => { },
            checkAuth: async () => { },
        };
    }
    return context;
}
//# sourceMappingURL=usePlatform.js.map