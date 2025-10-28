/**
 * Специализированный Error Boundary для чата
 */
import { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
}
/**
 * Error Boundary специально для компонентов чата
 * Предоставляет контекстную информацию об ошибке чата
 */
export declare class ChatErrorBoundary extends Component<Props> {
    private handleError;
    render(): any;
}
export default ChatErrorBoundary;
//# sourceMappingURL=ChatErrorBoundary.d.ts.map