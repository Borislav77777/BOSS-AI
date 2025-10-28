/**
 * Модуль уведомлений о изменениях настроек
 */
import { SettingValue } from '@/types';
import { SettingsNotifications } from '../types/SettingsTypes';
export declare class SettingsNotificationsImpl implements SettingsNotifications {
    private listeners;
    notify(key: string, value: SettingValue): void;
    notifyAll(): void;
    subscribe(key: string, callback: (value: SettingValue) => void): () => void;
    unsubscribe(key: string, callback: (value: SettingValue) => void): void;
    getSubscribersCount(key: string): number;
    getAllSubscribersCount(): number;
    getSubscribedKeys(): string[];
    clearAllSubscriptions(): void;
    clearSubscriptionsForKey(key: string): void;
    hasSubscribers(key: string): boolean;
    getSubscribersInfo(): Record<string, number>;
}
//# sourceMappingURL=SettingsNotifications.d.ts.map