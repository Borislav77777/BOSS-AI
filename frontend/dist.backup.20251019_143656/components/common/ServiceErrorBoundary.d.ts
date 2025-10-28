/**
 * Специализированный Error Boundary для сервисов
 */
import { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    serviceName: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
}
/**
 * Error Boundary специально для сервисов
 * Предоставляет контекстную информацию об ошибке сервиса
 */
export declare class ServiceErrorBoundary extends Component<Props> {
    private handleError;
    render(): any;
}
export default ServiceErrorBoundary;
//# sourceMappingURL=ServiceErrorBoundary.d.ts.map