/**
 * Специализированный Error Boundary для рабочего пространства
 */
import { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
}
/**
 * Error Boundary специально для компонентов рабочего пространства
 * Предоставляет контекстную информацию об ошибке рабочего пространства
 */
export declare class WorkspaceErrorBoundary extends Component<Props> {
    private handleError;
    render(): any;
}
export default WorkspaceErrorBoundary;
//# sourceMappingURL=WorkspaceErrorBoundary.d.ts.map