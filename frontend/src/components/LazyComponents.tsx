import { ComponentType, lazy } from 'react';

// Lazy loading для тяжелых компонентов
const LazyChat = lazy(() => import('@/components/Chat').then(module => ({ default: module.Chat }))) as unknown as ComponentType<Record<string, never>>;
const LazySettings = lazy(() => import('@/components/Settings').then(module => ({ default: module.Settings }))) as unknown as ComponentType<Record<string, never>>;
const LazyWorkspace = lazy(() => import('@/components/Workspace').then(module => ({ default: module.Workspace }))) as unknown as ComponentType<Record<string, never>>;
const LazySidebar = lazy(() => import('@/components/Sidebar').then(module => ({ default: module.Sidebar }))) as unknown as ComponentType<Record<string, never>>;

// Lazy loading для сервисов
const LazyWidgetsServiceTabs = lazy(() => import('@/components/Widgets/WidgetsServiceTabs').then(module => ({ default: module.WidgetsServiceTabs }))) as unknown as ComponentType<Record<string, never>>;

// Lazy loading для настроек
const LazyServiceSettings = lazy(() => import('@/components/Settings/ServiceSettings').then(module => ({ default: module.ServiceSettingsComponent }))) as unknown as ComponentType<Record<string, never>>;

// Lazy loading для чата
const LazyChatInput = lazy(() => import('@/components/Chat/ChatInput/ChatInput').then(module => ({ default: module.ChatInput }))) as unknown as ComponentType<Record<string, never>>;

const LazyChatMessages = lazy(() => import('@/components/Chat/ChatMessages/ChatMessages').then(module => ({ default: module.ChatMessages }))) as unknown as ComponentType<Record<string, never>>;

const LazyChatControls = lazy(() => import('@/components/Chat/ChatControls/ChatControls').then(module => ({ default: module.ChatControls }))) as unknown as ComponentType<Record<string, never>>;

// Lazy loading для workspace
const LazyWorkspaceItem = lazy(() => import('@/components/Workspace/WorkspaceItem').then(module => ({ default: module.WorkspaceItem }))) as unknown as ComponentType<Record<string, never>>;

const LazyServiceWorkspaceItem = lazy(() => import('@/components/Workspace/ServiceWorkspaceItem').then(module => ({ default: module.ServiceWorkspaceItem }))) as unknown as ComponentType<Record<string, never>>;

// Экспортируем только компоненты
export {
    LazyChat, LazyChatControls, LazyChatInput,
    LazyChatMessages, LazyServiceSettings, LazyServiceWorkspaceItem, LazySettings, LazySidebar,
    LazyWidgetsServiceTabs, LazyWorkspace, LazyWorkspaceItem
};
