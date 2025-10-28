import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { Calendar, Clock, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
export const TimeWidget = ({ widget, onMinimize, onClose, isMinimized, onDragStart }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef(null);
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
    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        if (widget.settings['format24h']) {
            let timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            if (widget.settings['show-seconds']) {
                timeString += `:${seconds.toString().padStart(2, '0')}`;
            }
            return timeString;
        }
        else {
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
    const formatDate = (date) => {
        const options = {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        };
        return date.toLocaleDateString('ru-RU', options);
    };
    if (isMinimized) {
        return (_jsx("div", { className: "widget-minimized time-widget-minimized", onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onClick: onMinimize, children: _jsxs("div", { className: "widget-minimized-content", children: [_jsx(Clock, { size: 16, className: "widget-minimized-icon" }), _jsx("div", { className: "widget-minimized-time", children: formatTime(currentTime) })] }) }));
    }
    return (_jsxs("div", { className: "widget-container time-widget-container active", "data-testid": "widget-container", onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onMouseDown: onDragStart, children: [_jsxs("div", { className: "widget-header", children: [_jsxs("div", { className: "widget-title", children: [_jsx(Clock, { size: 16, className: "widget-icon" }), _jsx("span", { children: "\u0427\u0430\u0441\u044B" })] }), _jsxs("div", { className: cn("widget-controls", isHovered && "widget-controls-visible"), children: [_jsx("button", { onClick: () => {
                                    // Убираем тень с виджета
                                    const widgetElement = document.querySelector('.time-widget-container');
                                    if (widgetElement) {
                                        widgetElement.classList.toggle('no-shadow');
                                    }
                                }, className: "widget-control-btn", title: "\u0423\u0431\u0440\u0430\u0442\u044C \u0442\u0435\u043D\u044C", children: _jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M12 2L2 7l10 5 10-5-10-5z" }), _jsx("path", { d: "M2 17l10 5 10-5" }), _jsx("path", { d: "M2 12l10 5 10-5" })] }) }), _jsx("button", { onClick: onClose, className: "widget-control-btn widget-control-close", title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", children: _jsx(X, { size: 12 }) })] })] }), _jsxs("div", { className: "widget-content time-widget-content", children: [_jsx("div", { className: "time-display", children: _jsx("div", { className: "time-main", children: formatTime(currentTime) }) }), widget.settings['show-date'] && (_jsxs("div", { className: "date-display", children: [_jsx(Calendar, { size: 14, className: "date-icon" }), _jsx("span", { className: "date-text", children: formatDate(currentTime) })] }))] })] }));
};
//# sourceMappingURL=TimeWidget.js.map