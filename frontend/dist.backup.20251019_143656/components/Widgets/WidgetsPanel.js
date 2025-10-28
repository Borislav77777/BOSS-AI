import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { widgetsService } from '@/services/WidgetsService';
import { cn } from '@/utils';
import { Clock, Grid, Mic } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { TimeWidget } from './TimeWidget';
import { VoiceWidget } from './VoiceWidget';
export const WidgetsPanel = ({ onTranscriptionComplete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [widgets, setWidgets] = useState([]);
    const [widgetTypes, setWidgetTypes] = useState([]);
    // Загрузка виджетов и типов
    useEffect(() => {
        setWidgets(widgetsService.getAllWidgets());
        setWidgetTypes(widgetsService.getWidgetTypes());
    }, []);
    // Создание виджета
    const createWidget = (typeId) => {
        const widget = widgetsService.createWidget(typeId, {
            position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }
        });
        setWidgets([...widgets, widget]);
    };
    // Удаление виджета
    const removeWidget = (widgetId) => {
        widgetsService.removeWidget(widgetId);
        setWidgets(widgets.filter(w => w.id !== widgetId));
    };
    // Сворачивание виджета
    const toggleMinimize = (widgetId) => {
        widgetsService.toggleMinimize(widgetId);
        setWidgets([...widgets]);
    };
    // Настройки виджета
    const openWidgetSettings = (widgetId) => {
        // TODO: Реализовать настройки виджета
        console.log('Open settings for widget:', widgetId);
    };
    // Рендер виджета по типу
    const renderWidget = (widget) => {
        const commonProps = {
            onMinimize: () => toggleMinimize(widget.id),
            onClose: () => removeWidget(widget.id),
            onSettings: () => openWidgetSettings(widget.id),
            isMinimized: widget.isMinimized
        };
        switch (widget.type) {
            case 'time-widget':
                return (_jsx(TimeWidget, { ...commonProps, widget: {
                        ...widget,
                        settings: widget.settings
                    } }));
            case 'voice-widget':
                return (_jsx(VoiceWidget, { ...commonProps, onTranscriptionComplete: onTranscriptionComplete, widget: {
                        ...widget,
                        settings: widget.settings
                    } }));
            default:
                return null;
        }
    };
    // Получение иконки по типу
    const getWidgetIcon = (typeId) => {
        switch (typeId) {
            case 'time-widget':
                return _jsx(Clock, { size: 16 });
            case 'voice-widget':
                return _jsx(Mic, { size: 16 });
            default:
                return _jsx(Grid, { size: 16 });
        }
    };
    return (_jsxs("div", { className: "widgets-panel", children: [_jsxs("button", { onClick: () => setIsExpanded(!isExpanded), className: cn("widgets-panel-toggle", isExpanded && "widgets-panel-toggle-active"), title: "\u0412\u0438\u0434\u0436\u0435\u0442\u044B", children: [_jsx(Grid, { size: 18 }), isExpanded && _jsx("span", { className: "widgets-panel-label", children: "\u0412\u0438\u0434\u0436\u0435\u0442\u044B" })] }), isExpanded && (_jsxs("div", { className: "widgets-panel-content", children: [_jsxs("div", { className: "widgets-panel-header", children: [_jsx("h3", { className: "widgets-panel-title", children: "\u0412\u0438\u0434\u0436\u0435\u0442\u044B" }), _jsx("button", { onClick: () => setIsExpanded(false), className: "widgets-panel-close", title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u044C", children: "\u00D7" })] }), _jsxs("div", { className: "widgets-panel-section", children: [_jsx("h4", { className: "widgets-panel-section-title", children: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u0432\u0438\u0434\u0436\u0435\u0442\u044B" }), _jsx("div", { className: "widgets-panel-list", children: widgetTypes.map(type => (_jsxs("button", { onClick: () => createWidget(type.id), className: "widgets-panel-item", title: type.description, children: [getWidgetIcon(type.id), _jsx("span", { className: "widgets-panel-item-text", children: type.name })] }, type.id))) })] }), widgets.length > 0 && (_jsxs("div", { className: "widgets-panel-section", children: [_jsx("h4", { className: "widgets-panel-section-title", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0432\u0438\u0434\u0436\u0435\u0442\u044B" }), _jsx("div", { className: "widgets-panel-list", children: widgets.map(widget => (_jsxs("div", { className: cn("widgets-panel-widget-item", widget.isMinimized && "widgets-panel-widget-minimized"), children: [_jsxs("div", { className: "widgets-panel-widget-info", children: [getWidgetIcon(widget.type), _jsx("span", { className: "widgets-panel-widget-name", children: widget.title })] }), _jsxs("div", { className: "widgets-panel-widget-controls", children: [_jsx("button", { onClick: () => toggleMinimize(widget.id), className: "widgets-panel-widget-btn", title: widget.isMinimized ? "Развернуть" : "Свернуть", children: widget.isMinimized ? "□" : "▬" }), _jsx("button", { onClick: () => removeWidget(widget.id), className: "widgets-panel-widget-btn widgets-panel-widget-close", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", children: "\u00D7" })] })] }, widget.id))) })] }))] })), widgets.map(widget => (_jsx("div", { className: "widget-wrapper", "data-x": widget.position.x, "data-y": widget.position.y, "data-z": widget.zIndex, children: renderWidget(widget) }, widget.id)))] }));
};
//# sourceMappingURL=WidgetsPanel.js.map