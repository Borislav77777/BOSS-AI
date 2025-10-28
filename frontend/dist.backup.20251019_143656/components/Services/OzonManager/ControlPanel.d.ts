import React from 'react';
import { OperationStatus } from './types';
interface ControlPanelProps {
    stores: string[];
    selectedStores: string[];
    onStoreSelectionChange: (stores: string[]) => void;
    onRunPromotions: () => void;
    onRunUnarchive: () => void;
    onRunAll: () => void;
    onStop: () => void;
    operationStatus: OperationStatus;
}
/**
 * Панель управления операциями
 * Воспроизводит функционал из Python gui.py (строки 685-707)
 */
export declare const ControlPanel: React.FC<ControlPanelProps>;
export {};
//# sourceMappingURL=ControlPanel.d.ts.map