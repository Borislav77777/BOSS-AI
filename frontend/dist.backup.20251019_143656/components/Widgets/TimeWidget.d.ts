import React from 'react';
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
export declare const TimeWidget: React.FC<TimeWidgetProps>;
export {};
//# sourceMappingURL=TimeWidget.d.ts.map