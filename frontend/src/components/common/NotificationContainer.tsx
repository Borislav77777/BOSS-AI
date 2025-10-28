/**
 * Контейнер для отображения уведомлений
 */

import { Notification, notificationService, NotificationType } from '@/services/NotificationService';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

interface NotificationItemProps {
    notification: Notification;
    onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getStyles = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return {
                    container: 'bg-green-50 border-green-200 text-green-800',
                    icon: 'text-green-400',
                    button: 'bg-green-100 hover:bg-green-200 text-green-800',
                };
            case 'error':
                return {
                    container: 'bg-red-50 border-red-200 text-red-800',
                    icon: 'text-red-400',
                    button: 'bg-red-100 hover:bg-red-200 text-red-800',
                };
            case 'warning':
                return {
                    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                    icon: 'text-yellow-400',
                    button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
                };
            case 'info':
                return {
                    container: 'bg-primary border-primary text-background',
                    icon: 'text-background',
                    button: 'bg-primary hover:bg-primary/80 text-background',
                };
        }
    };

    const styles = getStyles(notification.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
                "max-w-sm w-full p-4 rounded-lg border shadow-lg",
                styles.container
            )}
        >
            <div className="flex items-start space-x-3">
                <div className={cn("flex-shrink-0", styles.icon)}>
                    {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium mb-1">
                        {notification.title}
                    </h4>
                    <p className="text-sm opacity-90">
                        {notification.message}
                    </p>

                    {notification.actions && notification.actions.length > 0 && (
                        <div className="mt-3 flex space-x-2">
                            {notification.actions.map((action, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={action.action}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded transition-colors duration-200",
                                        styles.button
                                    )}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onClose(notification.id)}
                    className={cn(
                        "flex-shrink-0 p-1 rounded transition-colors duration-200",
                        styles.button
                    )}
                    aria-label="Закрыть уведомление"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </motion.div>
    );
};

export const NotificationContainer: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const unsubscribe = notificationService.subscribe(setNotifications);
        return unsubscribe;
    }, []);

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClose={(id) => notificationService.hide(id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationContainer;
