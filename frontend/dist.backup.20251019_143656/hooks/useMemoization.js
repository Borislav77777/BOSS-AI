import { useCallback, useMemo, useRef } from 'react';
/**
 * Хук для мемоизации функций с кэшированием
 */
export function useMemoizedCallback(callback, deps) {
    const cacheRef = useRef(new Map());
    const lastDepsRef = useRef(deps);
    return useCallback((...args) => {
        // Создаем ключ кэша на основе аргументов
        const cacheKey = JSON.stringify(args);
        // Проверяем, изменились ли зависимости
        const depsChanged = deps.some((dep, index) => dep !== lastDepsRef.current[index]);
        if (depsChanged) {
            cacheRef.current.clear();
            lastDepsRef.current = deps;
        }
        // Проверяем кэш
        if (cacheRef.current.has(cacheKey)) {
            return cacheRef.current.get(cacheKey);
        }
        // Выполняем функцию и кэшируем результат
        const result = callback(...args);
        cacheRef.current.set(cacheKey, result);
        return result;
    }, deps);
}
/**
 * Хук для мемоизации вычислений с кэшированием
 */
export function useMemoizedValue(computeValue, deps, options = {}) {
    const cacheRef = useRef(new Map());
    const lastDepsRef = useRef(deps);
    const { maxCacheSize = 100, cacheTimeout = 5 * 60 * 1000 } = options; // 5 минут по умолчанию
    return useMemo(() => {
        // Создаем ключ кэша на основе зависимостей
        const cacheKey = JSON.stringify(deps);
        // Проверяем, изменились ли зависимости
        const depsChanged = deps.some((dep, index) => dep !== lastDepsRef.current[index]);
        if (depsChanged) {
            cacheRef.current.clear();
            lastDepsRef.current = deps;
        }
        // Проверяем кэш
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
            // Проверяем таймаут кэша
            if (Date.now() - cached.timestamp < cacheTimeout) {
                return cached.value;
            }
            else {
                cacheRef.current.delete(cacheKey);
            }
        }
        // Вычисляем значение и кэшируем
        const value = computeValue();
        // Очищаем старые записи, если превышен лимит
        if (cacheRef.current.size >= maxCacheSize) {
            const oldestKey = cacheRef.current.keys().next().value;
            if (oldestKey !== undefined) {
                cacheRef.current.delete(oldestKey);
            }
        }
        cacheRef.current.set(cacheKey, {
            value,
            timestamp: Date.now()
        });
        return value;
    }, deps);
}
/**
 * Хук для мемоизации объектов с глубоким сравнением
 */
export function useMemoizedObject(obj, deps) {
    const prevObjRef = useRef(null);
    const prevDepsRef = useRef(deps);
    return useMemo(() => {
        // Проверяем, изменились ли зависимости
        const depsChanged = deps.some((dep, index) => dep !== prevDepsRef.current[index]);
        if (depsChanged) {
            prevDepsRef.current = deps;
            prevObjRef.current = null;
        }
        // Проверяем, изменился ли объект
        if (prevObjRef.current && isEqual(prevObjRef.current, obj)) {
            return prevObjRef.current;
        }
        prevObjRef.current = obj;
        return obj;
    }, deps);
}
/**
 * Хук для мемоизации массивов с глубоким сравнением
 */
export function useMemoizedArray(array, deps) {
    const prevArrayRef = useRef(null);
    const prevDepsRef = useRef(deps);
    return useMemo(() => {
        // Проверяем, изменились ли зависимости
        const depsChanged = deps.some((dep, index) => dep !== prevDepsRef.current[index]);
        if (depsChanged) {
            prevDepsRef.current = deps;
            prevArrayRef.current = null;
        }
        // Проверяем, изменился ли массив
        if (prevArrayRef.current && isEqual(prevArrayRef.current, array)) {
            return prevArrayRef.current;
        }
        prevArrayRef.current = array;
        return array;
    }, deps);
}
/**
 * Хук для мемоизации селекторов
 */
export function useMemoizedSelector(selector, state, deps = []) {
    const prevResultRef = useRef(null);
    const prevStateRef = useRef(null);
    const prevDepsRef = useRef(deps);
    return useMemo(() => {
        // Проверяем, изменились ли зависимости
        const depsChanged = deps.some((dep, index) => dep !== prevDepsRef.current[index]);
        if (depsChanged) {
            prevDepsRef.current = deps;
            prevStateRef.current = null;
            prevResultRef.current = null;
        }
        // Проверяем, изменилось ли состояние
        if (prevStateRef.current && isEqual(prevStateRef.current, state)) {
            return prevResultRef.current;
        }
        const result = selector(state);
        prevStateRef.current = state;
        prevResultRef.current = result;
        return result;
    }, [selector, state, ...deps]);
}
/**
 * Хук для мемоизации с таймаутом
 */
export function useMemoizedWithTimeout(computeValue, deps, timeout = 1000) {
    const timeoutRef = useRef(null);
    const valueRef = useRef(null);
    const lastDepsRef = useRef(deps);
    return useMemo(() => {
        // Проверяем, изменились ли зависимости
        const depsChanged = deps.some((dep, index) => dep !== lastDepsRef.current[index]);
        if (depsChanged) {
            lastDepsRef.current = deps;
            // Очищаем предыдущий таймаут
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Устанавливаем новый таймаут
            timeoutRef.current = setTimeout(() => {
                valueRef.current = computeValue();
            }, timeout);
            return valueRef.current || computeValue();
        }
        return valueRef.current || computeValue();
    }, deps);
}
/**
 * Глубокое сравнение объектов
 */
function isEqual(a, b) {
    if (a === b)
        return true;
    if (a == null || b == null)
        return a === b;
    if (typeof a !== typeof b)
        return false;
    if (typeof a !== 'object')
        return a === b;
    if (Array.isArray(a) !== Array.isArray(b))
        return false;
    if (Array.isArray(a)) {
        if (a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            if (!isEqual(a[i], b[i]))
                return false;
        }
        return true;
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length)
        return false;
    for (const key of keysA) {
        if (!keysB.includes(key))
            return false;
        if (!isEqual(a[key], b[key]))
            return false;
    }
    return true;
}
export default {
    useMemoizedCallback,
    useMemoizedValue,
    useMemoizedObject,
    useMemoizedArray,
    useMemoizedSelector,
    useMemoizedWithTimeout
};
//# sourceMappingURL=useMemoization.js.map