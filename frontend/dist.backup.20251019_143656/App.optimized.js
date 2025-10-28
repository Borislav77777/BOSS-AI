import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { NotificationContainer } from '@/components/common/NotificationContainer';
import { PlatformProvider } from '@/context/PlatformContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePlatform } from '@/hooks/usePlatform';
import { accentColorService } from '@/services/AccentColorService';
import { errorHandlingService } from '@/services/ErrorHandlingService';
import { initializeWidgets } from '@/services/initializeWidgets';
import { performanceMonitoringService } from '@/services/PerformanceMonitoringService';
import { usageAnalyticsService } from '@/services/UsageAnalyticsService';
import { cn } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import React, { Suspense, lazy, memo, useCallback, useEffect } from 'react';
// Lazy loading компонентов
const Chat = lazy(() => import('@/components/Chat').then(module => ({ default: module.Chat })));
const SettingsModular = lazy(() => import('@/components/Settings/SettingsModular').then(module => ({ default: module.SettingsModular })));
const Sidebar = lazy(() => import('@/components/Sidebar').then(module => ({ default: module.Sidebar })));
const WidgetsServiceTabs = lazy(() => import('@/components/Widgets/WidgetsServiceTabs').then(module => ({ default: module.WidgetsServiceTabs })));
const Workspace = lazy(() => import('@/components/Workspace').then(module => ({ default: module.Workspace })));
const AILawyerService = lazy(() => import('@/components/Services/AILawyer/AILawyerService').then(module => ({ default: module.AILawyerService })));
// Loading компоненты
const ChatLoading = () => (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
const SidebarLoading = () => (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsx("div", { className: "animate-pulse bg-gray-200 rounded-lg h-8 w-8" }) }));
const WorkspaceLoading = () => (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsx("div", { className: "animate-pulse bg-gray-200 rounded-lg h-12 w-12" }) }));
const AppContent = memo(() => {
    const { state, updateSettings } = usePlatform();
    // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ВЫЗВАНЫ ДО ЛЮБЫХ УСЛОВНЫХ ВОЗВРАТОВ
    // Инициализация виджетов
    useEffect(() => {
        initializeWidgets();
    }, []);
    // Инициализация сервиса акцентных цветов
    useEffect(() => {
        // Восстанавливаем сохраненные акцентные цвета
        accentColorService.restoreAccentSet();
        // НЕ запускаем автоматическое переключение цветов по умолчанию
        // accentColorService.startAutoCycle(8000); // Отключено для предотвращения синих цветов
    }, []);
    // Инициализация сервисов мониторинга
    useEffect(() => {
        // Инициализируем аналитику использования
        usageAnalyticsService.startSession();
        // Отслеживаем загрузку страницы
        usageAnalyticsService.trackPageView(window.location.href);
        // Отслеживаем производительность загрузки
        performanceMonitoringService.addCustomMetric('AppLoad', performance.now(), 'ms');
        // Регистрируем обработчик ошибок
        errorHandlingService.registerErrorHandler((error, context) => {
            usageAnalyticsService.trackError(error, context?.component, context?.service, context?.metadata);
        });
    }, []);
    const handleChatResizeMouseDown = useCallback((e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = state.layout.chatWidth;
        let animationFrame;
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE = 16; // ~60fps
        const onMove = (ev) => {
            const now = performance.now();
            // Троттлинг обновлений для производительности
            if (now - lastUpdateTime < UPDATE_THROTTLE) {
                return;
            }
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            animationFrame = requestAnimationFrame(() => {
                // Движение мыши влево уменьшает ширину чата (сжимает)
                // Движение мыши вправо увеличивает ширину чата (расширяет)
                const delta = ev.clientX - startX;
                const newWidth = startWidth - delta;
                // Ограничиваем минимальную ширину
                const next = Math.min(2000, Math.max(250, newWidth));
                // Проверяем, что не выходим за левую границу экрана
                const chatContainer = document.querySelector('.chat-container');
                if (chatContainer) {
                    const containerRect = chatContainer.getBoundingClientRect();
                    const minLeftPosition = 0; // Минимальная позиция от левого края экрана
                    const currentRightPosition = containerRect.right;
                    const newLeftPosition = currentRightPosition - next;
                    // Если новая левая позиция меньше минимальной, не обновляем
                    if (newLeftPosition < minLeftPosition) {
                        return;
                    }
                }
                // Обновляем только если значение действительно изменилось
                if (Math.abs(next - state.layout.chatWidth) > 1) {
                    updateSettings('chatWidth', next);
                    lastUpdateTime = now;
                }
            });
        };
        const onUp = () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [state.layout.chatWidth, updateSettings]);
    const handleChatInputResizeMouseDown = useCallback((e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = state.layout.chatInputHeight;
        let animationFrame;
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE = 16; // ~60fps
        const onMove = (ev) => {
            const now = performance.now();
            // Троттлинг обновлений для производительности
            if (now - lastUpdateTime < UPDATE_THROTTLE) {
                return;
            }
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            animationFrame = requestAnimationFrame(() => {
                const delta = ev.clientY - startY; // Исправлено: теперь тянем вверх = уменьшаем высоту
                const newHeight = startHeight - delta; // Исправлено: вычитаем delta
                // Строгие ограничения: минимум 200px, максимум 800px
                const next = Math.min(800, Math.max(200, newHeight));
                // Дополнительная проверка: не позволяем выйти за границы
                if (next !== newHeight) {
                    // Если мы достигли границы, останавливаем ресайз
                    return;
                }
                // Обновляем только если значение действительно изменилось
                if (Math.abs(next - state.layout.chatInputHeight) > 1) {
                    updateSettings('chatInputHeight', next);
                    lastUpdateTime = now;
                }
            });
        };
        const onUp = () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [state.layout.chatInputHeight, updateSettings]);
    // УСЛОВНЫЕ ВОЗВРАТЫ ТОЛЬКО ПОСЛЕ ВСЕХ ХУКОВ
    if (state.isLoading) {
        return (_jsxs(motion.div, { className: "h-screen w-screen flex flex-col items-center justify-center app-loading-screen relative", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.5 }, children: [_jsx("div", { className: "fixed top-0 left-0 right-0 h-1 z-50 animated-top-bar" }), _jsxs(motion.div, { className: "text-center mb-4", initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 }, "aria-label": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 Boss Ai", children: [_jsx("div", { className: "loading-boss-logo", children: "Boss Ai" }), _jsx("div", { className: "loading-boss-dots" })] })] }));
    }
    if (state.error) {
        return (_jsx("div", { className: "h-screen flex items-center justify-center error-container", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-warning-500 rounded-full flex items-center justify-center mb-4 mx-auto", children: _jsx("span", { className: "text-2xl", children: "\u26A0\uFE0F" }) }), _jsx("h2", { className: "text-xl font-semibold mb-2 error-title", children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438" }), _jsx("p", { className: "mb-4 error-message", children: state.error }), _jsx("button", { onClick: () => window.location.reload(), className: "px-4 py-2 rounded-lg transition-all duration-200 shadow-lg error-button", children: "\u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C" })] }) }));
    }
    return (_jsxs(motion.div, { className: "min-h-screen w-screen flex app-container", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.6, ease: "easeOut" }, children: [_jsx("div", { className: "fixed top-0 left-0 right-0 h-1 z-50 animated-top-bar" }), _jsx(motion.div, { className: cn("sidebar-container relative sidebar-dynamic-width", state.layout.sidebarCollapsed && "collapsed"), initial: { opacity: 0, x: -20, scale: 0.98 }, animate: { opacity: 1, x: 0, scale: 1 }, transition: {
                    duration: 0.8,
                    delay: 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94] // Плавная кривая Безье
                }, children: _jsx(Suspense, { fallback: _jsx(SidebarLoading, {}), children: _jsx(Sidebar, {}) }) }), _jsxs(motion.div, { className: "flex-1 flex h-screen main-content", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.2 }, children: [_jsx(motion.div, { className: cn("flex-1 overflow-x-hidden main-content-scrollbar rounded-2xl expanded-tabs-container", state.layout.activeSection === 'widgets' && "service-tabs-expanded"), initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay: 0.4 }, style: { '--expanded-height': `${state.layout.expandedTabsHeight}px` }, children: _jsxs(Suspense, { fallback: _jsx(WorkspaceLoading, {}), children: [state.layout.activeSection === 'workspace' && _jsx(Workspace, {}), state.layout.activeSection === 'settings' && _jsx(Workspace, {}), state.layout.activeSection === 'ai-lawyer' && _jsx(AILawyerService, {})] }) }), state.layout.activeSection === 'settings' && (_jsx(motion.div, { className: "settings-panel relative rounded-2xl full-height", initial: { opacity: 0, x: 10, scale: 0.99 }, animate: { opacity: 1, x: 0, scale: 1 }, transition: { duration: 0.3, delay: 0.2 }, style: { width: 500 }, children: _jsx(Suspense, { fallback: _jsx(WorkspaceLoading, {}), children: _jsx(SettingsModular, {}) }) })), state.layout.chatVisible && (_jsxs(motion.div, { className: "chat-container relative rounded-2xl full-height", style: { '--chat-width': `${state.layout.chatWidth}px` }, initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, delay: 0.4 }, children: [_jsx("div", { className: "h-full overflow-y-auto overflow-x-hidden chat-scrollbar", children: _jsx(Suspense, { fallback: _jsx(ChatLoading, {}), children: _jsx(Chat, { onInputResize: handleChatInputResizeMouseDown }) }) }), _jsx("div", { className: "chat-resizer", onMouseDown: handleChatResizeMouseDown, title: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0448\u0438\u0440\u0438\u043D\u0443 \u0447\u0430\u0442\u0430" })] }))] }), _jsx(Suspense, { fallback: _jsx("div", { className: "fixed bottom-4 right-4 w-12 h-12 bg-primary rounded-full animate-pulse" }), children: _jsx(WidgetsServiceTabs, { onTranscriptionComplete: (text) => {
                        console.log('Widget transcription:', text);
                    } }) })] }));
});
AppContent.displayName = 'AppContent';
const App = memo(() => {
    const { handleError } = useErrorHandler();
    return (_jsx(ErrorBoundary, { onError: handleError, children: _jsxs(PlatformProvider, { children: [_jsx(AnimatePresence, { mode: "wait", children: _jsx(AppContent, {}) }), _jsx(NotificationContainer, {})] }) }));
});
App.displayName = 'App';
export default App;
//# sourceMappingURL=App.optimized.js.map