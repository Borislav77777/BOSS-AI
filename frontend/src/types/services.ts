// Типы для системы сервисов BARSUKOV OS

import { ServiceTheme } from './Theme';

export interface ServiceTool {
  id: string;
  name: string;
  description: string;
  icon: string; // Название иконки из lucide-react
  action: string; // Путь к функции или файлу
  isEnabled: boolean;
  category?: string;
  // Поддержка чат функций
  isChatFunction?: boolean; // Является ли функцией чата
  chatApiEndpoint?: string; // API endpoint для чата
  chatPrompt?: string; // Промпт для чата
  chatResponseHandler?: string; // Обработчик ответа чата
}

export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // Название иконки из lucide-react
  version: string;
  isActive: boolean;
  tools: ServiceTool[];
  settings: Record<string, boolean | string | number | string[] | object>;
  dependencies: string[];
  author?: string;
  category: string;
  priority: number; // Для сортировки в сайдбаре
  // Поддержка чат функций
  chatApiBaseUrl?: string; // Базовый URL для API чата
  chatApiKey?: string; // API ключ для чата
  chatFunctions?: ServiceTool[]; // Специальные функции для чата
  chatButtons?: ChatButton[]; // Кнопки для чата
  // Поддержка тем
  theme?: ServiceTheme; // Тема сервиса
}

export interface ChatButton {
  id: string;
  name: string;
  icon: string;
  description: string;
  action: string;
  isEnabled: boolean;
  disabled?: boolean; // Состояние disabled
  color?: string; // Цвет кнопки
  position?: 'top' | 'bottom'; // Позиция в чате
}

export interface ServiceModule {
  config: ServiceConfig;
  module: ServiceModuleInterface | null; // Динамически загружаемый модуль
  isLoaded: boolean;
  error?: string;
}

export interface ServiceModuleInterface {
  initialize?: () => Promise<void>;
  execute?: (toolId: string, params?: Record<string, unknown>) => Promise<unknown>;
  cleanup?: () => Promise<void>;
  [key: string]: unknown;
}

export interface ServiceManager {
  services: ServiceModule[];
  loadService: (serviceId: string) => Promise<void>;
  unloadService: (serviceId: string) => void;
  getService: (serviceId: string) => ServiceModule | undefined;
  executeTool: (serviceId: string, toolId: string) => Promise<unknown>;
}
