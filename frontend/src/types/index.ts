// Основные типы для BARSUKOV OS Platform

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

// Типы для сообщений
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
  name?: string; // Добавляем name для совместимости
  url?: string; // Добавляем url для файлов
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

// Типы для настроек сервиса
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

// Типы для настроек
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
  component?: string; // Имя компонента для кастомного типа
  customColor?: string; // Для theme-selector
  onCustomColorChange?: (value: string) => void; // Для theme-selector
  onChange: (value: SettingValue) => void;
}

export interface LayoutState {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  chatVisible: boolean;
  chatWidth: number;
  chatInputHeight: number; // Высота поля ввода чата
  workspaceLayout: 'grid' | 'list' | 'compact';
  activeService: string | null;
  activeTool: string | null;
  activeSection: string;
  activeSettingsCategory: string; // Добавляем активный раздел
  activeWidgetsCategory: string[]; // Массив активных виджетов
  chatType: 'default' | 'chatgpt'; // Тип чата
  expandedTabsHeight: number; // Высота раскрытых вкладок
}

// Типы для состояния платформы
export interface PlatformSettings {
  // Базовые темы (выбирается одна)
  theme: 'light' | 'dark' | 'custom';
  customColor?: string; // Только для custom темы

  // Акценты (можно включить/выключить)
  accentsEnabled: boolean; // Включены ли акцентные цвета
  accentColor?: string; // Цвет акцентов (если включены)

  // Настройки текста
  useColoredText: boolean; // Использовать цветной текст
  textColor?: string; // Цвет текста (если включен)
  fontSize: 'small' | 'medium' | 'large'; // Размер шрифта

  // Общие настройки
  animations: boolean;
  sidebarCollapsed: boolean;

  // Настройки чата
  autoScroll: boolean; // Автоматическая прокрутка в чате
  hideChatFunctionButtons: boolean; // Скрыть кнопки функций чата
  showTimestamps: boolean; // Показывать временные метки в чате

  [key: string]: SettingValue | string | undefined;
}

export interface PlatformState {
  user: User | null;
  authUser: import('./auth').AuthUser | null; // Telegram авторизация
  authLoading: boolean; // Загрузка авторизации
  authError: string | null; // Ошибки авторизации
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
  // Методы для работы с платформой
  switchService: (serviceId: string) => void;
  switchTool: (toolId: string) => void;
  sendMessage: (content: string) => void;
  createWorkspaceItem: (item: WorkspaceItem) => void;
  updateSettings: (key: string, value: SettingValue) => void;
  toggleSidebar: () => void;
  toggleChat: () => void;
  setChatType: (chatType: 'default' | 'chatgpt') => void;
  switchSection: (section: string) => void; // Добавляем метод переключения разделов
  setActiveSettingsCategory: (category: string) => void; // Установка активной категории настроек
  setExpandedTabsHeight: (height: number) => void; // Установка высоты раскрытых вкладок
  toggleService: (serviceId: string) => void; // Переключение сервиса
  executeServiceTool: (serviceId: string, toolId: string) => Promise<unknown>; // Выполнение инструмента
  // Методы для Telegram авторизации
  loginWithTelegram: (telegramData: import('./auth').TelegramAuthData) => Promise<void>; // Авторизация через Telegram
  logout: () => Promise<void>; // Выход из системы
  checkAuth: () => Promise<void>; // Проверка авторизации
}

export type PlatformAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_AUTH_USER'; payload: import('./auth').AuthUser } // Telegram авторизация
  | { type: 'CLEAR_AUTH_USER' } // Очистка авторизации
  | { type: 'SET_AUTH_LOADING'; payload: boolean } // Загрузка авторизации
  | { type: 'SET_AUTH_ERROR'; payload: string | null } // Ошибки авторизации
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean } // Установка флага инициализации
  | { type: 'SWITCH_SERVICE'; payload: string }
  | { type: 'SWITCH_TOOL'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'CREATE_WORKSPACE_ITEM'; payload: WorkspaceItem }
  | { type: 'REMOVE_WORKSPACE_ITEM'; payload: string } // Удаление элемента рабочего пространства
  | { type: 'UPDATE_WORKSPACE_ITEM'; payload: { id: string; updates: Partial<WorkspaceItem> } } // Обновление элемента
  | { type: 'UPDATE_SETTINGS'; payload: { key: string; value: SettingValue } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'SET_CHAT_TYPE'; payload: 'default' | 'chatgpt' }
  | { type: 'SET_LAYOUT'; payload: Partial<LayoutState> }
  | { type: 'SWITCH_SECTION'; payload: string } // Добавляем действие переключения разделов
  | { type: 'SET_ACTIVE_SETTINGS_CATEGORY'; payload: string } // Установка активной категории настроек
  | { type: 'SET_ACTIVE_WIDGETS_CATEGORY'; payload: string[] } // Установка активной категории виджетов
  | { type: 'ADD_SERVICE'; payload: import('./services').ServiceModule } // Добавление сервиса
  | { type: 'TOGGLE_SERVICE'; payload: string } // Переключение сервиса
  | { type: 'SET_ACTIVE_CHAT'; payload: ChatSession } // Установка активного чата
  | { type: 'SET_EXPANDED_TABS_HEIGHT'; payload: number }; // Установка высоты раскрытых вкладок

// Утилитарные типы
export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type LayoutMode = 'grid' | 'list' | 'compact';

// Типы для событий
export interface PlatformEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: Date;
}

export interface EventListener<T = unknown> {
  (event: PlatformEvent<T>): void;
}

// Типы для API
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
