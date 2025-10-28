/**
 * Улучшенный Error Boundary с детальным логированием и восстановлением
 */
import { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
    errorBoundaryName?: string;
    showNotification?: boolean;
    autoRetry?: boolean;
    retryDelay?: number;
}
interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    retryCount: number;
    isRetrying: boolean;
}
/**
 * Улучшенный Error Boundary с расширенными возможностями
 */
export declare class EnhancedErrorBoundary extends Component<Props, State> {
    private retryTimeout?;
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): Partial<State>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    componentWillUnmount(): void;
    private scheduleRetry;
    private handleRetry;
    private handleReload;
    private handleReportError;
    render(): any;
}
export default EnhancedErrorBoundary;
//# sourceMappingURL=EnhancedErrorBoundary.d.ts.map