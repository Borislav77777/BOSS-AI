import { Widget, widgetsService, WidgetType } from '@/services/WidgetsService';
import { cn } from '@/utils';
import { Clock, Grid, Mic } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { TimeWidget } from './TimeWidget';
import { VoiceWidget } from './VoiceWidget';

interface WidgetsPanelProps {
    onTranscriptionComplete: (text: string) => void;
}

interface TimeWidgetSettings {
    'show-seconds': boolean;
    'show-date': boolean;
    'format24h': boolean;
}

interface VoiceWidgetSettings {
    'auto-start': boolean;
    'show-transcription': boolean;
}

export const WidgetsPanel: React.FC<WidgetsPanelProps> = ({
    onTranscriptionComplete
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [widgetTypes, setWidgetTypes] = useState<WidgetType[]>([]);

    // Загрузка виджетов и типов
    useEffect(() => {
        setWidgets(widgetsService.getAllWidgets());
        setWidgetTypes(widgetsService.getWidgetTypes());
    }, []);

    // Создание виджета
    const createWidget = (typeId: string) => {
        const widget = widgetsService.createWidget(typeId, {
            position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }
        });
        setWidgets([...widgets, widget]);
    };

    // Удаление виджета
    const removeWidget = (widgetId: string) => {
        widgetsService.removeWidget(widgetId);
        setWidgets(widgets.filter(w => w.id !== widgetId));
    };

    // Сворачивание виджета
    const toggleMinimize = (widgetId: string) => {
        widgetsService.toggleMinimize(widgetId);
        setWidgets([...widgets]);
    };

    // Настройки виджета
    const openWidgetSettings = (widgetId: string) => {
        // TODO: Реализовать настройки виджета
        console.log('Open settings for widget:', widgetId);
    };

    // Рендер виджета по типу
    const renderWidget = (widget: Widget) => {
        const commonProps = {
            onMinimize: () => toggleMinimize(widget.id),
            onClose: () => removeWidget(widget.id),
            onSettings: () => openWidgetSettings(widget.id),
            isMinimized: widget.isMinimized
        };

        switch (widget.type) {
            case 'time-widget':
                return (
                    <TimeWidget
                        {...commonProps}
                        widget={{
                            ...widget,
                            settings: widget.settings as unknown as TimeWidgetSettings
                        }}
                    />
                );
            case 'voice-widget':
                return (
                    <VoiceWidget
                        {...commonProps}
                        onTranscriptionComplete={onTranscriptionComplete}
                        widget={{
                            ...widget,
                            settings: widget.settings as unknown as VoiceWidgetSettings
                        }}
                    />
                );
            default:
                return null;
        }
    };

    // Получение иконки по типу
    const getWidgetIcon = (typeId: string) => {
        switch (typeId) {
            case 'time-widget':
                return <Clock size={16} />;
            case 'voice-widget':
                return <Mic size={16} />;
            default:
                return <Grid size={16} />;
        }
    };

    return (
        <div className="widgets-panel">
            {/* Кнопка панели виджетов */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "widgets-panel-toggle",
                    isExpanded && "widgets-panel-toggle-active"
                )}
                title="Виджеты"
            >
                <Grid size={18} />
                {isExpanded && <span className="widgets-panel-label">Виджеты</span>}
            </button>

            {/* Список виджетов */}
            {isExpanded && (
                <div className="widgets-panel-content">
                    <div className="widgets-panel-header">
                        <h3 className="widgets-panel-title">Виджеты</h3>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="widgets-panel-close"
                            title="Закрыть панель"
                        >
                            ×
                        </button>
                    </div>

                    <div className="widgets-panel-section">
                        <h4 className="widgets-panel-section-title">Доступные виджеты</h4>
                        <div className="widgets-panel-list">
                            {widgetTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => createWidget(type.id)}
                                    className="widgets-panel-item"
                                    title={type.description}
                                >
                                    {getWidgetIcon(type.id)}
                                    <span className="widgets-panel-item-text">{type.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {widgets.length > 0 && (
                        <div className="widgets-panel-section">
                            <h4 className="widgets-panel-section-title">Активные виджеты</h4>
                            <div className="widgets-panel-list">
                                {widgets.map(widget => (
                                    <div
                                        key={widget.id}
                                        className={cn(
                                            "widgets-panel-widget-item",
                                            widget.isMinimized && "widgets-panel-widget-minimized"
                                        )}
                                    >
                                        <div className="widgets-panel-widget-info">
                                            {getWidgetIcon(widget.type)}
                                            <span className="widgets-panel-widget-name">
                                                {widget.title}
                                            </span>
                                        </div>
                                        <div className="widgets-panel-widget-controls">
                                            <button
                                                onClick={() => toggleMinimize(widget.id)}
                                                className="widgets-panel-widget-btn"
                                                title={widget.isMinimized ? "Развернуть" : "Свернуть"}
                                            >
                                                {widget.isMinimized ? "□" : "▬"}
                                            </button>
                                            <button
                                                onClick={() => removeWidget(widget.id)}
                                                className="widgets-panel-widget-btn widgets-panel-widget-close"
                                                title="Удалить"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Рендер виджетов */}
            {widgets.map(widget => (
                <div
                    key={widget.id}
                    className="widget-wrapper"
                    data-x={widget.position.x}
                    data-y={widget.position.y}
                    data-z={widget.zIndex}
                >
                    {renderWidget(widget)}
                </div>
            ))}
        </div>
    );
};
