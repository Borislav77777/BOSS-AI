import React from 'react';
interface ProgressIndicatorProps {
    isVisible: boolean;
    message: string;
    type: 'loading' | 'success' | 'error';
    duration?: number;
    onComplete?: () => void;
    className?: string;
}
/**
 * Индикатор прогресса для операций
 */
export declare const ProgressIndicator: React.FC<ProgressIndicatorProps>;
export {};
//# sourceMappingURL=ProgressIndicator.d.ts.map