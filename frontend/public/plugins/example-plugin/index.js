/**
 * Пример плагина для демонстрации системы плагинов
 */

class ExamplePluginModule {
    constructor() {
        this.name = 'Example Plugin';
        this.version = '1.0.0';
        this.initialized = false;
        this.settings = {
            enabled: true,
            autoStart: false,
            notifications: true
        };
    }

    /**
     * Инициализация плагина
     */
    async initialize() {
        console.log(`${this.name} v${this.version} инициализируется...`);

        // Загружаем настройки из localStorage
        const savedSettings = localStorage.getItem('example-plugin-settings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                console.error('Ошибка загрузки настроек плагина:', error);
            }
        }

        // Инициализируем плагин
        if (this.settings.autoStart) {
            await this.start();
        }

        this.initialized = true;
        console.log(`${this.name} успешно инициализирован`);
    }

    /**
     * Запуск плагина
     */
    async start() {
        console.log('Плагин запускается...');

        // Здесь можно добавить логику запуска
        // Например, регистрация обработчиков событий, инициализация UI и т.д.

        if (this.settings.notifications) {
            this.showNotification('Плагин запущен');
        }
    }

    /**
     * Остановка плагина
     */
    async stop() {
        console.log('Плагин останавливается...');

        // Здесь можно добавить логику остановки
        // Например, очистка обработчиков событий, сохранение состояния и т.д.

        if (this.settings.notifications) {
            this.showNotification('Плагин остановлен');
        }
    }

    /**
     * Выполнение инструмента
     */
    async execute(toolId, params = {}) {
        if (!this.initialized) {
            throw new Error('Плагин не инициализирован');
        }

        console.log(`Выполнение инструмента ${toolId} с параметрами:`, params);

        switch (toolId) {
            case 'greet':
                return {
                    success: true,
                    message: `Привет от плагина! 👋 Вы используете ${this.name} v${this.version}`,
                    data: {
                        pluginName: this.name,
                        version: this.version,
                        timestamp: new Date().toISOString(),
                        toolId,
                        params
                    }
                };

            case 'info':
                return {
                    success: true,
                    message: `Информация о плагине: ${this.name}`,
                    data: {
                        name: this.name,
                        version: this.version,
                        initialized: this.initialized,
                        settings: this.settings,
                        timestamp: new Date().toISOString()
                    }
                };

            case 'settings':
                return {
                    success: true,
                    message: 'Настройки плагина обновлены',
                    data: {
                        settings: this.settings,
                        timestamp: new Date().toISOString()
                    }
                };

            default:
                throw new Error(`Неизвестный инструмент: ${toolId}`);
        }
    }

    /**
     * Обновление настроек
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('example-plugin-settings', JSON.stringify(this.settings));

        if (this.settings.notifications) {
            this.showNotification('Настройки обновлены');
        }
    }

    /**
     * Показ уведомления
     */
    showNotification(message) {
        // Простое уведомление в консоли
        // В реальном приложении здесь можно использовать toast уведомления
        console.log(`[${this.name}] ${message}`);

        // Пример создания DOM уведомления
        if (typeof document !== 'undefined') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--background-primary);
                color: var(--text-primary);
                padding: 12px 16px;
                border-radius: 8px;
                border: 1px solid var(--border);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-size: 14px;
                max-width: 300px;
            `;
            notification.textContent = `[${this.name}] ${message}`;

            document.body.appendChild(notification);

            // Удаляем уведомление через 3 секунды
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }

    /**
     * Получение информации о плагине
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            initialized: this.initialized,
            settings: this.settings
        };
    }

    /**
     * Очистка ресурсов
     */
    async cleanup() {
        console.log(`${this.name} очищает ресурсы...`);

        // Останавливаем плагин
        await this.stop();

        // Сохраняем настройки
        localStorage.setItem('example-plugin-settings', JSON.stringify(this.settings));

        this.initialized = false;
        console.log(`${this.name} успешно очищен`);
    }
}

// Экспортируем модуль как default
export default new ExamplePluginModule();
