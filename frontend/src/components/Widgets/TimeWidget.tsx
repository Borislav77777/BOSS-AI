import { cn } from '@/utils';
import { Calendar, Clock, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface TimeWidgetProps {
    widget: {
        id: string;
        settings: {
            'show-seconds': boolean;
            'show-date': boolean;
            'format24h': boolean;
        };
    };
    onMinimize: () => void;
    onClose: () => void;
    isMinimized: boolean;
    onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const TimeWidget: React.FC<TimeWidgetProps> = ({
    widget,
    onMinimize,
    onClose,
    isMinimized,
    onDragStart
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Обновление времени каждую секунду
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date());
        };

        updateTime();
        intervalRef.current = setInterval(updateTime, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Форматирование времени (улучшенная читабельность)
    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        if (widget.settings['format24h']) {
            let timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            if (widget.settings['show-seconds']) {
                timeString += `:${seconds.toString().padStart(2, '0')}`;
            }
            return timeString;
        } else {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            let timeString = `${displayHours}:${minutes.toString().padStart(2, '0')}`;
            if (widget.settings['show-seconds']) {
                timeString += `:${seconds.toString().padStart(2, '0')}`;
            }
            timeString += ` ${ampm}`;
            return timeString;
        }
    };

    // Форматирование даты (упрощенное)
    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        };
        return date.toLocaleDateString('ru-RU', options);
    };

    if (isMinimized) {
        return (
            <div
                className="widget-minimized time-widget-minimized"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onMinimize}
            >
                <div className="widget-minimized-content">
                    <Clock size={16} className="widget-minimized-icon" />
                    <div className="widget-minimized-time">
                        {formatTime(currentTime)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="widget-container time-widget-container active"
            data-testid="widget-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={onDragStart}
        >
            {/* Заголовок виджета */}
            <div className="widget-header">
                <div className="widget-title">
                    <Clock size={16} className="widget-icon" />
                    <span>Часы</span>
                </div>
                <div className={cn("widget-controls", isHovered && "widget-controls-visible")}>
                    <button
                        onClick={() => {
                            // Убираем тень с виджета
                            const widgetElement = document.querySelector('.time-widget-container');
                            if (widgetElement) {
                                widgetElement.classList.toggle('no-shadow');
                            }
                        }}
                        className="widget-control-btn"
                        title="Убрать тень"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="widget-control-btn widget-control-close"
                        title="Закрыть"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* Содержимое виджета */}
            <div className="widget-content time-widget-content">
                <div className="time-display">
                    <div className="time-main">{formatTime(currentTime)}</div>
                </div>

                {widget.settings['show-date'] && (
                    <div className="date-display">
                        <Calendar size={14} className="date-icon" />
                        <span className="date-text">{formatDate(currentTime)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
