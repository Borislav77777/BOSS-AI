/**
 * Сервис аналитики использования
 */
class UsageAnalyticsService {
    constructor(config) {
        this.currentSession = null;
        this.sessions = [];
        this.events = [];
        this.reportingInterval = null;
        this.sessionTimeout = null;
        this.config = config;
        this.initializeTracking();
    }
    /**
     * Инициализирует отслеживание
     */
    initializeTracking() {
        if (!this.config.enableTracking) {
            return;
        }
        // Инициализируем сессию
        if (this.config.enableSessionTracking) {
            this.startSession();
        }
        // Настраиваем отслеживание страниц
        if (this.config.enablePageTracking) {
            this.setupPageTracking();
        }
        // Настраиваем отслеживание сервисов
        if (this.config.enableServiceTracking) {
            this.setupServiceTracking();
        }
        // Настраиваем периодическую отправку отчетов
        if (this.config.enableReporting) {
            this.setupReporting();
        }
        // Настраиваем таймаут сессии
        this.setupSessionTimeout();
    }
    /**
     * Начинает новую сессию
     */
    startSession() {
        if (this.currentSession) {
            this.endSession();
        }
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: new Date(),
            events: [],
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            pageViews: 0,
            interactions: 0
        };
        this.sessions.push(this.currentSession);
        this.resetSessionTimeout();
    }
    /**
     * Завершает текущую сессию
     */
    endSession() {
        if (!this.currentSession) {
            return;
        }
        this.currentSession.endTime = new Date();
        this.currentSession.duration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
        this.currentSession = null;
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    }
    /**
     * Отслеживает событие пользователя
     */
    trackEvent(type, action, component, service, metadata) {
        if (!this.config.enableEventTracking || !this.currentSession) {
            return;
        }
        const event = {
            id: this.generateEventId(),
            type,
            action,
            component,
            service,
            timestamp: new Date(),
            sessionId: this.currentSession.id,
            metadata
        };
        this.events.push(event);
        this.currentSession.events.push(event);
        this.currentSession.interactions++;
        // Проверяем лимит событий
        if (this.currentSession.events.length >= this.config.maxEventsPerSession) {
            this.endSession();
            this.startSession();
        }
    }
    /**
     * Отслеживает просмотр страницы
     */
    trackPageView(page, metadata) {
        if (!this.config.enablePageTracking) {
            return;
        }
        this.trackEvent('page', 'view', undefined, undefined, {
            page,
            ...metadata
        });
        if (this.currentSession) {
            this.currentSession.pageViews++;
        }
    }
    /**
     * Отслеживает использование сервиса
     */
    trackServiceUsage(service, action, metadata) {
        if (!this.config.enableServiceTracking) {
            return;
        }
        this.trackEvent('service', action, undefined, service, metadata);
    }
    /**
     * Отслеживает взаимодействие с компонентом
     */
    trackComponentInteraction(component, action, metadata) {
        this.trackEvent('component', action, component, undefined, metadata);
    }
    /**
     * Отслеживает ошибку
     */
    trackError(error, component, service, metadata) {
        this.trackEvent('error', 'occurred', component, service, {
            errorMessage: error.message,
            errorStack: error.stack,
            errorName: error.name,
            ...metadata
        });
    }
    /**
     * Отслеживает производительность
     */
    trackPerformance(metric, value, unit, metadata) {
        this.trackEvent('performance', metric, undefined, undefined, {
            value,
            unit,
            ...metadata
        });
    }
    /**
     * Получает статистику использования
     */
    getUsageStats() {
        const totalSessions = this.sessions.length;
        const totalEvents = this.events.length;
        const averageSessionDuration = totalSessions > 0
            ? this.sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / totalSessions
            : 0;
        // Самые используемые компоненты
        const componentCounts = new Map();
        this.events.forEach(event => {
            if (event.component) {
                componentCounts.set(event.component, (componentCounts.get(event.component) || 0) + 1);
            }
        });
        const mostUsedComponents = Array.from(componentCounts.entries())
            .map(([component, count]) => ({ component, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Самые используемые сервисы
        const serviceCounts = new Map();
        this.events.forEach(event => {
            if (event.service) {
                serviceCounts.set(event.service, (serviceCounts.get(event.service) || 0) + 1);
            }
        });
        const mostUsedServices = Array.from(serviceCounts.entries())
            .map(([service, count]) => ({ service, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Популярные действия
        const actionCounts = new Map();
        this.events.forEach(event => {
            actionCounts.set(event.action, (actionCounts.get(event.action) || 0) + 1);
        });
        const popularActions = Array.from(actionCounts.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Активность пользователей
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dailyActiveUsers = new Set(this.sessions
            .filter(session => session.startTime >= oneDayAgo)
            .map(session => session.userId)
            .filter(Boolean)).size;
        const weeklyActiveUsers = new Set(this.sessions
            .filter(session => session.startTime >= oneWeekAgo)
            .map(session => session.userId)
            .filter(Boolean)).size;
        const monthlyActiveUsers = new Set(this.sessions
            .filter(session => session.startTime >= oneMonthAgo)
            .map(session => session.userId)
            .filter(Boolean)).size;
        return {
            totalSessions,
            totalEvents,
            averageSessionDuration,
            mostUsedComponents,
            mostUsedServices,
            popularActions,
            userEngagement: {
                dailyActiveUsers,
                weeklyActiveUsers,
                monthlyActiveUsers
            }
        };
    }
    /**
     * Получает события по типу
     */
    getEventsByType(type) {
        return this.events.filter(event => event.type === type);
    }
    /**
     * Получает события по компоненту
     */
    getEventsByComponent(component) {
        return this.events.filter(event => event.component === component);
    }
    /**
     * Получает события по сервису
     */
    getEventsByService(service) {
        return this.events.filter(event => event.service === service);
    }
    /**
     * Получает сессии пользователя
     */
    getUserSessions(userId) {
        return this.sessions.filter(session => session.userId === userId);
    }
    /**
     * Очищает данные
     */
    clearData() {
        this.events = [];
        this.sessions = [];
        if (this.currentSession) {
            this.currentSession.events = [];
        }
    }
    /**
     * Останавливает отслеживание
     */
    stopTracking() {
        this.endSession();
        if (this.reportingInterval) {
            clearInterval(this.reportingInterval);
            this.reportingInterval = null;
        }
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    }
    /**
     * Настраивает отслеживание страниц
     */
    setupPageTracking() {
        // Отслеживаем изменения URL
        let currentUrl = window.location.href;
        const trackUrlChange = () => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                this.trackPageView(currentUrl);
            }
        };
        // Отслеживаем popstate события
        window.addEventListener('popstate', trackUrlChange);
        // Отслеживаем pushstate/replacestate
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        history.pushState = function (...args) {
            originalPushState.apply(history, args);
            trackUrlChange();
        };
        history.replaceState = function (...args) {
            originalReplaceState.apply(history, args);
            trackUrlChange();
        };
    }
    /**
     * Настраивает отслеживание сервисов
     */
    setupServiceTracking() {
        // Здесь можно добавить интеграцию с ServiceManager
        // для автоматического отслеживания использования сервисов
    }
    /**
     * Настраивает периодическую отправку отчетов
     */
    setupReporting() {
        if (!this.config.reportingEndpoint) {
            return;
        }
        this.reportingInterval = setInterval(() => {
            this.sendReport();
        }, this.config.reportingInterval);
    }
    /**
     * Настраивает таймаут сессии
     */
    setupSessionTimeout() {
        this.resetSessionTimeout();
    }
    /**
     * Сбрасывает таймаут сессии
     */
    resetSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        this.sessionTimeout = setTimeout(() => {
            this.endSession();
            this.startSession();
        }, this.config.sessionTimeout);
    }
    /**
     * Отправляет отчет на сервер
     */
    async sendReport() {
        if (!this.config.reportingEndpoint) {
            return;
        }
        const report = {
            sessions: this.sessions,
            events: this.events,
            stats: this.getUsageStats(),
            timestamp: new Date()
        };
        try {
            await fetch(this.config.reportingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(report)
            });
        }
        catch (error) {
            console.error('Failed to send analytics report:', error);
        }
    }
    /**
     * Генерирует ID сессии
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Генерирует ID события
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
// Создаем экземпляр сервиса
export const usageAnalyticsService = new UsageAnalyticsService({
    enableTracking: true,
    enableSessionTracking: true,
    enableEventTracking: true,
    enableUserTracking: true,
    enablePageTracking: true,
    enableServiceTracking: true,
    sessionTimeout: 30 * 60 * 1000, // 30 минут
    maxEventsPerSession: 1000,
    enableReporting: false,
    reportingInterval: 5 * 60 * 1000, // 5 минут
    enableLocalStorage: true,
    enableCookies: false
});
//# sourceMappingURL=UsageAnalyticsService.js.map