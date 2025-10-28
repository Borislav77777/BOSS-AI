export * from './Theme';
export * from './auth';
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    preferences: UserPreferences;
}
export interface UserPreferences {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    notifications: boolean;
    animations: boolean;
    sounds: boolean;
}
export type MessageType = 'text' | 'image' | 'file' | 'command';
export type MessageSender = 'user' | 'assistant' | 'system';
export interface MessageMetadata {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
    command?: string;
    parameters?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface Message {
    id: string;
    content: string;
    sender: MessageSender;
    timestamp: Date;
    type: MessageType;
    metadata?: MessageMetadata;
}
export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
export interface WorkspaceItem {
    id: string;
    type: 'document' | 'note' | 'image' | 'folder' | 'file';
    title: string;
    emoji?: string;
    name?: string;
    url?: string;
    content?: string;
    path: string;
    createdAt: Date;
    updatedAt: Date;
    size: number;
    tags: string[];
}
export interface Tool {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    isEnabled: boolean;
    shortcut?: string;
    action: () => void | Promise<void>;
}
export interface ServiceSettings {
    [key: string]: boolean | string | number | string[] | object;
}
export interface Service {
    id: string;
    name: string;
    description: string;
    icon: string;
    version: string;
    isActive: boolean;
    tools: Tool[];
    settings: ServiceSettings;
    dependencies: string[];
    category: string;
    priority: number;
    author?: string;
}
export interface SettingsCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    items: SettingsItem[];
}
export type SettingType = 'boolean' | 'string' | 'number' | 'select' | 'color' | 'file' | 'custom' | 'theme-selector' | 'font-size-slider' | 'rainbow-theme-system' | 'unified-rainbow-theme' | 'theme-buttons';
export type SettingValue = boolean | string | number | object | undefined;
export interface SelectOption {
    label: string;
    value: SettingValue;
}
export interface SettingsItem {
    id: string;
    name: string;
    description: string;
    type: SettingType;
    value: SettingValue;
    options?: SelectOption[];
    min?: number;
    max?: number;
    step?: number;
    component?: string;
    customColor?: string;
    onCustomColorChange?: (value: string) => void;
    onChange: (value: SettingValue) => void;
}
export interface LayoutState {
    sidebarCollapsed: boolean;
    sidebarWidth: number;
    chatVisible: boolean;
    chatWidth: number;
    chatInputHeight: number;
    workspaceLayout: 'grid' | 'list' | 'compact';
    activeService: string | null;
    activeTool: string | null;
    activeSection: string;
    activeSettingsCategory: string;
    activeWidgetsCategory: string[];
    chatType: 'default' | 'chatgpt';
    expandedTabsHeight: number;
}
export interface PlatformSettings {
    theme: 'light' | 'dark' | 'custom';
    customColor?: string;
    accentsEnabled: boolean;
    accentColor?: string;
    useColoredText: boolean;
    textColor?: string;
    fontSize: 'small' | 'medium' | 'large';
    animations: boolean;
    sidebarCollapsed: boolean;
    autoScroll: boolean;
    hideChatFunctionButtons: boolean;
    showTimestamps: boolean;
    [key: string]: SettingValue | string | undefined;
}
export interface PlatformState {
    user: User | null;
    authUser: import('./auth').AuthUser | null;
    authLoading: boolean;
    authError: string | null;
    layout: LayoutState;
    services: import('./services').ServiceModule[];
    activeChat: ChatSession | null;
    workspaceItems: WorkspaceItem[];
    settings: PlatformSettings;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
}
export interface PlatformContextType {
    state: PlatformState;
    dispatch: React.Dispatch<PlatformAction>;
    switchService: (serviceId: string) => void;
    switchTool: (toolId: string) => void;
    sendMessage: (content: string) => void;
    createWorkspaceItem: (item: WorkspaceItem) => void;
    updateSettings: (key: string, value: SettingValue) => void;
    toggleSidebar: () => void;
    toggleChat: () => void;
    setChatType: (chatType: 'default' | 'chatgpt') => void;
    switchSection: (section: string) => void;
    setActiveSettingsCategory: (category: string) => void;
    setExpandedTabsHeight: (height: number) => void;
    toggleService: (serviceId: string) => void;
    executeServiceTool: (serviceId: string, toolId: string) => Promise<unknown>;
    loginWithTelegram: (telegramData: import('./auth').TelegramAuthData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}
export type PlatformAction = {
    type: 'SET_USER';
    payload: User;
} | {
    type: 'SET_AUTH_USER';
    payload: import('./auth').AuthUser;
} | {
    type: 'CLEAR_AUTH_USER';
} | {
    type: 'SET_AUTH_LOADING';
    payload: boolean;
} | {
    type: 'SET_AUTH_ERROR';
    payload: string | null;
} | {
    type: 'SET_LOADING';
    payload: boolean;
} | {
    type: 'SET_ERROR';
    payload: string | null;
} | {
    type: 'SET_INITIALIZED';
    payload: boolean;
} | {
    type: 'SWITCH_SERVICE';
    payload: string;
} | {
    type: 'SWITCH_TOOL';
    payload: string;
} | {
    type: 'ADD_MESSAGE';
    payload: Message;
} | {
    type: 'CREATE_WORKSPACE_ITEM';
    payload: WorkspaceItem;
} | {
    type: 'REMOVE_WORKSPACE_ITEM';
    payload: string;
} | {
    type: 'UPDATE_WORKSPACE_ITEM';
    payload: {
        id: string;
        updates: Partial<WorkspaceItem>;
    };
} | {
    type: 'UPDATE_SETTINGS';
    payload: {
        key: string;
        value: SettingValue;
    };
} | {
    type: 'TOGGLE_SIDEBAR';
} | {
    type: 'TOGGLE_CHAT';
} | {
    type: 'SET_CHAT_TYPE';
    payload: 'default' | 'chatgpt';
} | {
    type: 'SET_LAYOUT';
    payload: Partial<LayoutState>;
} | {
    type: 'SWITCH_SECTION';
    payload: string;
} | {
    type: 'SET_ACTIVE_SETTINGS_CATEGORY';
    payload: string;
} | {
    type: 'SET_ACTIVE_WIDGETS_CATEGORY';
    payload: string[];
} | {
    type: 'ADD_SERVICE';
    payload: import('./services').ServiceModule;
} | {
    type: 'TOGGLE_SERVICE';
    payload: string;
} | {
    type: 'SET_ACTIVE_CHAT';
    payload: ChatSession;
} | {
    type: 'SET_EXPANDED_TABS_HEIGHT';
    payload: number;
};
export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type LayoutMode = 'grid' | 'list' | 'compact';
export interface PlatformEvent<T = unknown> {
    type: string;
    payload: T;
    timestamp: Date;
}
export interface EventListener<T = unknown> {
    (event: PlatformEvent<T>): void;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface ApiRequest<T = unknown> {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    data?: T;
    headers?: Record<string, string>;
}
//# sourceMappingURL=index.d.ts.map