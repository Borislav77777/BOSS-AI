/**
 * Модуль уведомлений о изменениях настроек
 */
export class SettingsNotificationsImpl {
    constructor() {
        this.listeners = new Map();
    }
    notify(key, value) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value);
                }
                catch (error) {
                    console.error(`Ошибка в callback для настройки ${key}:`, error);
                }
            });
        }
    }
    notifyAll() {
        this.listeners.forEach((callbacks, key) => {
            callbacks.forEach(callback => {
                try {
                    // Получаем текущее значение настройки из контекста
                    // Это должно быть реализовано в главном сервисе
                    callback(undefined);
                }
                catch (error) {
                    console.error(`Ошибка в callback для настройки ${key}:`, error);
                }
            });
        });
    }
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        // Возвращаем функцию отписки
        return () => {
            this.unsubscribe(key, callback);
        };
    }
    unsubscribe(key, callback) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.delete(callback);
            // Удаляем пустые наборы
            if (callbacks.size === 0) {
                this.listeners.delete(key);
            }
        }
    }
    getSubscribersCount(key) {
        const callbacks = this.listeners.get(key);
        return callbacks ? callbacks.size : 0;
    }
    getAllSubscribersCount() {
        let total = 0;
        this.listeners.forEach(callbacks => {
            total += callbacks.size;
        });
        return total;
    }
    getSubscribedKeys() {
        return Array.from(this.listeners.keys());
    }
    clearAllSubscriptions() {
        this.listeners.clear();
    }
    clearSubscriptionsForKey(key) {
        this.listeners.delete(key);
    }
    hasSubscribers(key) {
        const callbacks = this.listeners.get(key);
        return callbacks ? callbacks.size > 0 : false;
    }
    getSubscribersInfo() {
        const info = {};
        this.listeners.forEach((callbacks, key) => {
            info[key] = callbacks.size;
        });
        return info;
    }
}
//# sourceMappingURL=SettingsNotifications.js.map