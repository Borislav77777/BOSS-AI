import React, { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}
/**
 * Глобальный Error Boundary для обработки ошибок React
 */
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): ReactNode;
}
/**
 * HOC для оборачивания компонентов в Error Boundary
 */
export declare function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, fallback?: ReactNode, onError?: (error: Error, errorInfo: ErrorInfo) => void): {
    (props: P): any;
    displayName: string;
};
/**
 * Хук для обработки ошибок в функциональных компонентах
 */
export declare function useErrorHandler(): {
    handleError: any;
    handleAsyncError: any;
};
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.d.ts.map