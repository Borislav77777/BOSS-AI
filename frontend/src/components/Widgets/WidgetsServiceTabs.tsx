/**
 * Widgets Service Tabs Component
 *
 * Отображает виджеты как вкладки в сервисе "Виджеты" по принципу Настроек
 */

import { usePlatform } from '@/hooks/usePlatform';
import { Clock, Mic } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TimeWidget } from './TimeWidget';
import { VoiceWidget } from './VoiceWidget';

interface WidgetsServiceTabsProps {
    onTranscriptionComplete?: (text: string) => void;
}

interface WidgetTab {
    id: string;
    name: string;
    icon: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.ComponentType<any>;
    isActive: boolean;
}

interface Point { x: number; y: number }

export const WidgetsServiceTabs: React.FC<WidgetsServiceTabsProps> = ({
    onTranscriptionComplete
}) => {
    const { state, dispatch } = usePlatform();

    // Позиции и z-index для перетаскивания
    const [positions, setPositions] = useState<Record<string, Point>>({});
    const [zIndexMap, setZIndexMap] = useState<Record<string, number>>({});
    const nextZRef = useRef<number>(1000);
    const draggingRef = useRef<{ id: string; start: Point; offset: Point } | null>(null);

    const [widgets, setWidgets] = useState<WidgetTab[]>([
        {
            id: 'voice-widget',
            name: 'Голосовой ввод',
            icon: <Mic size={16} />,
            component: VoiceWidget,
            isActive: false
        },
        {
            id: 'time-widget',
            name: 'Часы',
            icon: <Clock size={16} />,
            component: TimeWidget,
            isActive: false
        }
    ]);

    // Активируем виджеты по выбору в Sidebar (сигнал через layout)
    useEffect(() => {
        const activeWidgets: string[] = state.layout.activeWidgetsCategory as unknown as string[];
        if (!activeWidgets || activeWidgets.length === 0) {
            // Если нет активных виджетов, деактивируем все
            setWidgets(prev => prev.map(w => ({ ...w, isActive: false })));
            return;
        }

        // Активируем виджеты из массива активных
        setWidgets(prev => prev.map(w => ({
            ...w,
            isActive: activeWidgets.includes(w.id)
        })));

        // Устанавливаем стартовые позиции для новых активных виджетов
        setPositions(prev => {
            const newPositions = { ...prev };
            activeWidgets.forEach((widgetId, index) => {
                if (!newPositions[widgetId]) {
                    newPositions[widgetId] = {
                        x: 520 + (index % 3) * 40,
                        y: 140 + (index % 3) * 40
                    };
                }
            });
            return newPositions;
        });

        // Устанавливаем z-index для активных виджетов
        setZIndexMap(prev => {
            const newZIndex = { ...prev };
            activeWidgets.forEach(widgetId => {
                if (!newZIndex[widgetId]) {
                    newZIndex[widgetId] = nextZRef.current++;
                }
            });
            return newZIndex;
        });
    }, [state.layout.activeWidgetsCategory]);

    // Закрытие виджета
    const closeWidget = (widgetId: string) => {
        setWidgets(prev => prev.map(w =>
            w.id === widgetId
                ? { ...w, isActive: false }
                : w
        ));

        // Также обновляем состояние в сайдбаре
        const currentActive = state.layout.activeWidgetsCategory;
        const newActive = currentActive.filter(id => id !== widgetId);
        dispatch({ type: 'SET_ACTIVE_WIDGETS_CATEGORY', payload: newActive });
    };

    // Получение активных виджетов
    const activeWidgets = widgets.filter(w => w.isActive);

    // Drag handlers
    const bringToFront = (id: string) => {
        setZIndexMap(prev => ({ ...prev, [id]: nextZRef.current++ }));
    };

    const onMouseDown = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
        // ЛКМ только
        if (e.button !== 0) return;
        const start = { x: e.clientX, y: e.clientY };
        const pos = positions[id] ?? { x: 480, y: 120 };
        draggingRef.current = { id, start, offset: pos };
        bringToFront(id);
        window.addEventListener('mousemove', onMouseMove as EventListener);
        window.addEventListener('mouseup', onMouseUp as EventListener);
        e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!draggingRef.current) return;
        const { id, start, offset } = draggingRef.current;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        setPositions(prev => ({ ...prev, [id]: { x: offset.x + dx, y: offset.y + dy } }));
    };

    const onMouseUp = useCallback(() => {
        draggingRef.current = null;
        window.removeEventListener('mousemove', onMouseMove as EventListener);
        window.removeEventListener('mouseup', onMouseUp as EventListener);
    }, []);

    useEffect(() => () => {
        window.removeEventListener('mousemove', onMouseMove as EventListener);
        window.removeEventListener('mouseup', onMouseUp as EventListener);
    }, [onMouseUp]);

    useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<string>;
            const widgetId = custom.detail;
            setWidgets(prev => prev.map(w => (
                w.id === widgetId ? { ...w, isActive: !w.isActive } : w
            )));
        };
        window.addEventListener('widgets:toggle', handler as EventListener);
        return () => window.removeEventListener('widgets:toggle', handler as EventListener);
    }, []);

    return (
        <>
            {/* FLOATING WIDGETS - поверх всех блоков */}
            {activeWidgets.map((widget) => {
                const WidgetComponent = widget.component;
                const pos = positions[widget.id] ?? { x: 520, y: 140 };
                const z = zIndexMap[widget.id] ?? 1000;
                return (
                    <div
                        key={widget.id}
                        className="widget-wrapper"
                        ref={(el) => {
                            if (el) {
                                el.style.left = `${pos.x}px`;
                                el.style.top = `${pos.y}px`;
                                el.style.zIndex = z.toString();
                            }
                        }}
                    >
                        <WidgetComponent
                            widget={{
                                id: widget.id,
                                settings: widget.id === 'voice-widget'
                                    ? { 'auto-start': false, 'show-transcription': true }
                                    : { 'show-seconds': true, 'show-date': true, 'format24h': true }
                            }}
                            onMinimize={() => closeWidget(widget.id)}
                            onClose={() => closeWidget(widget.id)}
                            isMinimized={false}
                            onTranscriptionComplete={onTranscriptionComplete}
                            onDragStart={(e: React.MouseEvent<HTMLDivElement>) => onMouseDown(widget.id, e)}
                        />
                    </div>
                );
            })}
        </>
    );
};
