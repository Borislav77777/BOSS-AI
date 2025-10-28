import { AuthWidget } from '@/components/Auth';
import { ChatInterface } from '@/components/ChatInterface';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { NotificationContainer } from '@/components/common/NotificationContainer';
import { SimpleHeader } from '@/components/SimpleHeader';
import { ZombieConfigurator } from '@/components/ZombieConfigurator';
import { PlatformProvider } from '@/context/PlatformContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePlatform } from '@/hooks/usePlatform';
import { accentColorService } from '@/services/AccentColorService';
import { errorHandlingService } from '@/services/ErrorHandlingService';
import { initializeWidgets } from '@/services/initializeWidgets';
import { performanceMonitoringService } from '@/services/PerformanceMonitoringService';
import { usageAnalyticsService } from '@/services/UsageAnalyticsService';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import { allAgents } from './data/agentsData';
// import AnimatedStripesPage from './pages/AnimatedStripesPage';

const AppContent = memo(() => {
    // Получаем контекст платформы
    const platformContext = usePlatform();
    const { state, dispatch } = platformContext;
    const [showZombieConfig, setShowZombieConfig] = useState(false);
    // const [showStripesGenerator, setShowStripesGenerator] = useState(false);


    // Инициализация виджетов
    useEffect(() => {
        initializeWidgets();
    }, []);

    // Инициализация сервиса акцентных цветов
    useEffect(() => {
        accentColorService.restoreAccentSet();
    }, []);

    // Инициализация сервисов мониторинга
    useEffect(() => {
        usageAnalyticsService.startSession();
        usageAnalyticsService.trackPageView(window.location.href);
        performanceMonitoringService.addCustomMetric('AppLoad', performance.now(), 'ms');
        errorHandlingService.registerErrorHandler((error, context) => {
            usageAnalyticsService.trackError(error, context?.component, context?.service, context?.metadata);
        });
    }, []);

    // Если контекст еще не инициализирован, показываем загрузку
    if (!state.isInitialized) {
        return (
            <motion.div
                className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-4">Boss AI</div>
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </motion.div>
        );
    }

    // Проверка авторизации - показываем AuthWidget если пользователь не авторизован
    if (state.isInitialized && !state.authUser) {
        return (
            <AuthWidget
                onAuthSuccess={async (user, token) => {
                    console.log('[App] Авторизация успешна:', user);
                    dispatch({ type: 'SET_AUTH_USER', payload: user });
                }}
                onAuthError={(error) => {
                    console.error('[App] Ошибка авторизации:', error);
                }}
            />
        );
    }

    if (state.isLoading) {
        return (
            <motion.div
                className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-4">Boss AI</div>
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </motion.div>
        );
    }

    if (state.error) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
                    <p className="mb-4 text-gray-600">{state.error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Перезагрузить
                    </button>
                </div>
            </div>
        );
    }

    // Обработчик выхода
    const handleLogout = () => {
        dispatch({ type: 'SET_AUTH_USER', payload: null });
        localStorage.removeItem('boss_ai_token');
        localStorage.removeItem('boss_ai_user');
    };

    // Если открыт генератор полосок, показываем его
    // Генератор полосок отключен

    // Основной интерфейс - SimpleHeader + статичный фон + ChatInterface
    return (
        <div className="min-h-screen bg-black">
            {/* SimpleHeader с логотипом и кнопками */}
            <SimpleHeader
                onOpenZombieConfig={() => setShowZombieConfig(true)}
                onLogout={handleLogout}
            />

            {/* Zombie Configurator Modal */}
            <AnimatePresence>
                {showZombieConfig && (
                    <ZombieConfigurator
                        isOpen={showZombieConfig}
                        onClose={() => setShowZombieConfig(false)}
                    />
                )}
            </AnimatePresence>

            {/* ChatInterface с агентами и чатом */}
            <ChatInterface agents={allAgents} />
        </div>
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
