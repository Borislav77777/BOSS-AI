import React from 'react';
interface DiagramControlsProps {
    zoom: number;
    isFullscreen: boolean;
    showLegend: boolean;
    showMinimap: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
    onToggleFullscreen: () => void;
    onToggleLegend: () => void;
    onToggleMinimap: () => void;
    onDownload: () => void;
    onRerender: () => void;
    onResetControls: () => void;
}
/**
 * Панель управления диаграммой
 */
export declare const DiagramControls: React.FC<DiagramControlsProps>;
export {};
//# sourceMappingURL=DiagramControls.d.ts.map