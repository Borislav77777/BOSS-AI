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
const ChatLoading = () => (
    <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

const SidebarLoading = () => (
    <div className="h-full flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-8"></div>
    </div>
);

const WorkspaceLoading = () => (
    <div className="h-full flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 rounded-lg h-12 w-12"></div>
    </div>
);

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

    const handleChatResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = state.layout.chatWidth;
        let animationFrame: number;
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE = 16; // ~60fps

        const onMove = (ev: MouseEvent) => {
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
                const chatContainer = document.querySelector('.chat-container') as HTMLElement;
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

    const handleChatInputResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = state.layout.chatInputHeight;
        let animationFrame: number;
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE = 16; // ~60fps

        const onMove = (ev: MouseEvent) => {
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
        return (
            <motion.div
                className="h-screen w-screen flex flex-col items-center justify-center app-loading-screen relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="fixed top-0 left-0 right-0 h-1 z-50 animated-top-bar" />
                <motion.div
                    className="text-center mb-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    aria-label="Загрузка Boss Ai"
                >
                    <div className="loading-boss-logo">Boss Ai</div>
                    <div className="loading-boss-dots" />
                </motion.div>
            </motion.div>
        );
    }

    if (state.error) {
        return (
            <div className="h-screen flex items-center justify-center error-container">
                <div className="text-center">
                    <div className="w-16 h-16 bg-warning-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 error-title">Ошибка загрузки</h2>
                    <p className="mb-4 error-message">{state.error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 rounded-lg transition-all duration-200 shadow-lg error-button"
                    >
                        Перезагрузить
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen w-screen flex app-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Анимированная радужная полоска сверху экрана */}
            <div className="fixed top-0 left-0 right-0 h-1 z-50 animated-top-bar"></div>

            {/* Левая панель */}
            <motion.div
                className={cn(
                    "sidebar-container relative sidebar-dynamic-width",
                    state.layout.sidebarCollapsed && "collapsed"
                )}
                initial={{ opacity: 0, x: -20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                    duration: 0.8,
                    delay: 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94] // Плавная кривая Безье
                }}
            >
                <Suspense fallback={<SidebarLoading />}>
                    <Sidebar />
                </Suspense>
            </motion.div>

            {/* Основное содержимое */}
            <motion.div
                className="flex-1 flex h-screen main-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >

                {/* Основной контент - всегда показываем Workspace */}
                <motion.div
                    className={cn(
                        "flex-1 overflow-x-hidden main-content-scrollbar rounded-2xl expanded-tabs-container",
                        state.layout.activeSection === 'widgets' && "service-tabs-expanded"
                    )}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    style={{ '--expanded-height': `${state.layout.expandedTabsHeight}px` } as React.CSSProperties}
                >
                    <Suspense fallback={<WorkspaceLoading />}>
                        {state.layout.activeSection === 'workspace' && <Workspace />}
                        {state.layout.activeSection === 'settings' && <Workspace />}
                        {state.layout.activeSection === 'ai-lawyer' && <AILawyerService />}
                    </Suspense>
                </motion.div>

                {/* Панель настроек справа от Workspace */}
                {state.layout.activeSection === 'settings' && (
                    <motion.div
                        className="settings-panel relative rounded-2xl full-height"
                        initial={{ opacity: 0, x: 10, scale: 0.99 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        style={{ width: 500 }}
                    >
                        <Suspense fallback={<WorkspaceLoading />}>
                            <SettingsModular />
                        </Suspense>
                    </motion.div>
                )}

                {/* Чат (если включен) */}
                {state.layout.chatVisible && (
                    <motion.div
                        className="chat-container relative rounded-2xl full-height"
                        style={{ '--chat-width': `${state.layout.chatWidth}px` } as React.CSSProperties}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="h-full overflow-y-auto overflow-x-hidden chat-scrollbar">
                            <Suspense fallback={<ChatLoading />}>
                                <Chat onInputResize={handleChatInputResizeMouseDown} />
                            </Suspense>
                        </div>
                        {/* Ресайзер слева от чата */}
                        <div
                            className="chat-resizer"
                            onMouseDown={handleChatResizeMouseDown}
                            title="Изменить ширину чата"
                        />
                    </motion.div>
                )}
            </motion.div>

            {/* FLOATING WIDGETS - поверх всех блоков, всегда видны */}
            <Suspense fallback={<div className="fixed bottom-4 right-4 w-12 h-12 bg-primary rounded-full animate-pulse"></div>}>
                <WidgetsServiceTabs
                    onTranscriptionComplete={(text) => {
                        console.log('Widget transcription:', text);
                    }}
                />
            </Suspense>
        </motion.div>
    );
});

AppContent.displayName = 'AppContent';

const App = memo(() => {
    const { handleError } = useErrorHandler();

    return (
        <ErrorBoundary onError={handleError}>
            <PlatformProvider>
                <AnimatePresence mode="wait">
                    <AppContent />
                </AnimatePresence>
                <NotificationContainer />
            </PlatformProvider>
        </ErrorBoundary>
    );
});

App.displayName = 'App';

export default App;
