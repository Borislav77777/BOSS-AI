/**
 * Хук для мемоизации функций с кэшированием
 */
export declare function useMemoizedCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T;
/**
 * Хук для мемоизации вычислений с кэшированием
 */
export declare function useMemoizedValue<T>(computeValue: () => T, deps: React.DependencyList, options?: {
    maxCacheSize?: number;
    cacheTimeout?: number;
}): T;
/**
 * Хук для мемоизации объектов с глубоким сравнением
 */
export declare function useMemoizedObject<T extends Record<string, any>>(obj: T, deps: React.DependencyList): T;
/**
 * Хук для мемоизации массивов с глубоким сравнением
 */
export declare function useMemoizedArray<T>(array: T[], deps: React.DependencyList): T[];
/**
 * Хук для мемоизации селекторов
 */
export declare function useMemoizedSelector<T, R>(selector: (state: T) => R, state: T, deps?: React.DependencyList): R;
/**
 * Хук для мемоизации с таймаутом
 */
export declare function useMemoizedWithTimeout<T>(computeValue: () => T, deps: React.DependencyList, timeout?: number): T;
declare const _default: {
    useMemoizedCallback: typeof useMemoizedCallback;
    useMemoizedValue: typeof useMemoizedValue;
    useMemoizedObject: typeof useMemoizedObject;
    useMemoizedArray: typeof useMemoizedArray;
    useMemoizedSelector: typeof useMemoizedSelector;
    useMemoizedWithTimeout: typeof useMemoizedWithTimeout;
};
export default _default;
//# sourceMappingURL=useMemoization.d.ts.map