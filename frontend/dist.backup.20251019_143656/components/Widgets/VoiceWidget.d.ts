import React from 'react';
interface VoiceWidgetProps {
    widget: {
        id: string;
        settings: {
            'auto-start': boolean;
            'show-transcription': boolean;
        };
    };
    onMinimize: () => void;
    onClose: () => void;
    isMinimized: boolean;
    onTranscriptionComplete: (text: string) => void;
    onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void;
}
export declare const VoiceWidget: React.FC<VoiceWidgetProps>;
export {};
//# sourceMappingURL=VoiceWidget.d.ts.map