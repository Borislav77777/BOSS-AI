/**
 * Специализированный Error Boundary для настроек
 */
import { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    settingName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
}
/**
 * Error Boundary специально для компонентов настроек
 * Предоставляет контекстную информацию об ошибке настройки
 */
export declare class SettingsErrorBoundary extends Component<Props> {
    private handleError;
    render(): any;
}
export default SettingsErrorBoundary;
//# sourceMappingURL=SettingsErrorBoundary.d.ts.map