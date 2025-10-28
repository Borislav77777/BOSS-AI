import React, { Suspense } from 'react';

// Компонент загрузки
export const LoadingSpinner = () => (
    <div className="loading-spinner">
        <div className="loading-spinner__container">
            <div className="loading-spinner__dot"></div>
            <div className="loading-spinner__dot"></div>
            <div className="loading-spinner__dot"></div>
        </div>
        <p className="loading-spinner__text">Загрузка...</p>
    </div>
);

// HOC для lazy loading с fallback
export function withLazyLoading<T extends object>(
    Component: React.ComponentType<T>,
    fallback?: React.ReactNode
) {
    const LazyComponent = (props: T) => (
        <Suspense fallback={fallback || <LoadingSpinner />}>
            <Component {...props} />
        </Suspense>
    );

    LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;

    return LazyComponent;
}

// Компонент для условной загрузки
export function ConditionalLazyComponent({
    condition,
    children,
    fallback
}: {
    condition: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    if (!condition) {
        return fallback || null;
    }

    return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}
