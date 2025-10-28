import React from 'react';
export declare const LoadingSpinner: () => any;
export declare function withLazyLoading<T extends object>(Component: React.ComponentType<T>, fallback?: React.ReactNode): {
    (props: T): any;
    displayName: string;
};
export declare function ConditionalLazyComponent({ condition, children, fallback }: {
    condition: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}): any;
//# sourceMappingURL=lazyLoading.d.ts.map