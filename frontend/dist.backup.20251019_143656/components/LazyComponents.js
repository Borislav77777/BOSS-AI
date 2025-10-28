import { lazy } from 'react';
// Lazy loading для тяжелых компонентов
const LazyChat = lazy(() => import('@/components/Chat').then(module => ({ default: module.Chat })));
const LazySettings = lazy(() => import('@/components/Settings').then(module => ({ default: module.Settings })));
const LazyWorkspace = lazy(() => import('@/components/Workspace').then(module => ({ default: module.Workspace })));
const LazySidebar = lazy(() => import('@/components/Sidebar').then(module => ({ default: module.Sidebar })));
// Lazy loading для сервисов
const LazyWidgetsServiceTabs = lazy(() => import('@/components/Widgets/WidgetsServiceTabs').then(module => ({ default: module.WidgetsServiceTabs })));
// Lazy loading для настроек
const LazyServiceSettings = lazy(() => import('@/components/Settings/ServiceSettings').then(module => ({ default: module.ServiceSettingsComponent })));
// Lazy loading для чата
const LazyChatInput = lazy(() => import('@/components/Chat/ChatInput/ChatInput').then(module => ({ default: module.ChatInput })));
const LazyChatMessages = lazy(() => import('@/components/Chat/ChatMessages/ChatMessages').then(module => ({ default: module.ChatMessages })));
const LazyChatControls = lazy(() => import('@/components/Chat/ChatControls/ChatControls').then(module => ({ default: module.ChatControls })));
// Lazy loading для workspace
const LazyWorkspaceItem = lazy(() => import('@/components/Workspace/WorkspaceItem').then(module => ({ default: module.WorkspaceItem })));
const LazyServiceWorkspaceItem = lazy(() => import('@/components/Workspace/ServiceWorkspaceItem').then(module => ({ default: module.ServiceWorkspaceItem })));
// Экспортируем только компоненты
export { LazyChat, LazyChatControls, LazyChatInput, LazyChatMessages, LazyServiceSettings, LazyServiceWorkspaceItem, LazySettings, LazySidebar, LazyWidgetsServiceTabs, LazyWorkspace, LazyWorkspaceItem };
//# sourceMappingURL=LazyComponents.js.map