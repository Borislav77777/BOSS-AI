/**
 * Тесты для производительности и оптимизации
 */

import { render, screen, waitFor } from '@testing-library/react';
import { memo, useCallback, useMemo, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Компонент для тестирования мемоизации
const ExpensiveComponent = memo(({ value, onClick }: { value: number; onClick: () => void }) => {
    // Симуляция дорогой операции
    const expensiveValue = useMemo(() => {
        let result = 0;
        for (let i = 0; i < value * 1000; i++) {
            result += i;
        }
        return result;
    }, [value]);

    return (
        <div>
            <span data-testid="expensive-value">{expensiveValue}</span>
            <button onClick={onClick}>Click me</button>
        </div>
    );
});

// Компонент для тестирования useCallback
const CallbackComponent = ({ onAction }: { onAction: (value: string) => void }) => {
    const [count, setCount] = useState(0);

    const handleClick = useCallback((value: string) => {
        onAction(value);
        setCount(prev => prev + 1);
    }, [onAction]);

    return (
        <div>
            <span data-testid="count">{count}</span>
            <button onClick={() => handleClick('test')}>Action</button>
        </div>
    );
};

// Компонент для тестирования виртуализации
const VirtualizedList = ({ items }: { items: string[] }) => {
    const [visibleStart] = useState(0);
    const [visibleEnd] = useState(10);

    const visibleItems = items.slice(visibleStart, visibleEnd);

    return (
        <div>
            {visibleItems.map((item, index) => (
                <div key={visibleStart + index} data-testid={`item-${visibleStart + index}`}>
                    {item}
                </div>
            ))}
        </div>
    );
};

describe('Performance Optimization', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('должен мемоизировать дорогие вычисления', () => {
        const { rerender } = render(<ExpensiveComponent value={5} onClick={() => { }} />);

        const initialValue = screen.getByTestId('expensive-value').textContent;

        // Ререндер с тем же значением
        rerender(<ExpensiveComponent value={5} onClick={() => { }} />);

        // Значение должно остаться тем же (мемоизировано)
        expect(screen.getByTestId('expensive-value').textContent).toBe(initialValue);
    });

    it('должен пересчитывать при изменении зависимостей', () => {
        const { rerender } = render(<ExpensiveComponent value={5} onClick={() => { }} />);

        const initialValue = screen.getByTestId('expensive-value').textContent;

        // Ререндер с другим значением
        rerender(<ExpensiveComponent value={10} onClick={() => { }} />);

        // Значение должно измениться
        expect(screen.getByTestId('expensive-value').textContent).not.toBe(initialValue);
    });

    it('должен использовать useCallback для стабильных ссылок', () => {
        const onAction = vi.fn();
        const { rerender } = render(<CallbackComponent onAction={onAction} />);

        const initialCount = screen.getByTestId('count').textContent;

        // Ререндер с тем же callback
        rerender(<CallbackComponent onAction={onAction} />);

        // Компонент не должен перерендериваться
        expect(screen.getByTestId('count').textContent).toBe(initialCount);
    });

    it('должен виртуализировать большие списки', () => {
        const items = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);

        render(<VirtualizedList items={items} />);

        // Должны отображаться только первые 10 элементов
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
        expect(screen.getByTestId('item-9')).toBeInTheDocument();
        expect(screen.queryByTestId('item-10')).not.toBeInTheDocument();
    });

    it('должен дебаунсить частые обновления', async () => {
        const debouncedFunction = vi.fn();
        let timeoutId: NodeJS.Timeout;

        const debounce = (fn: () => void, delay: number) => {
            return () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(fn, delay);
            };
        };

        const debouncedFn = debounce(debouncedFunction, 100);

        // Вызываем функцию несколько раз быстро
        debouncedFn();
        debouncedFn();
        debouncedFn();

        // Функция не должна быть вызвана сразу
        expect(debouncedFunction).not.toHaveBeenCalled();

        // Ждем завершения debounce
        vi.advanceTimersByTime(100);

        // Функция должна быть вызвана только один раз
        expect(debouncedFunction).toHaveBeenCalledTimes(1);
    });

    it('должен троттлить частые события', () => {
        const throttledFunction = vi.fn();
        let lastCall = 0;
        const throttleDelay = 100;

        const throttle = (fn: () => void, delay: number) => {
            return () => {
                const now = Date.now();
                if (now - lastCall >= delay) {
                    lastCall = now;
                    fn();
                }
            };
        };

        const throttledFn = throttle(throttledFunction, throttleDelay);

        // Вызываем функцию несколько раз
        throttledFn();
        throttledFn();
        throttledFn();

        // Функция должна быть вызвана только один раз
        expect(throttledFunction).toHaveBeenCalledTimes(1);
    });

    it('должен лениво загружать компоненты', async () => {
        const LazyComponent = vi.fn(() => Promise.resolve({ default: () => <div>Lazy Component</div> }));

        const { lazy } = await import('react');
        const Lazy = lazy(LazyComponent);

        render(
            <div>
                <Lazy />
            </div>
        );

        await waitFor(() => {
            expect(LazyComponent).toHaveBeenCalled();
        });
    });

    it('должен оптимизировать ре-рендеры с React.memo', () => {
        const renderCount = vi.fn();

        const MemoizedComponent = memo(({ value }: { value: string }) => {
            renderCount();
            return <div>{value}</div>;
        });

        const { rerender } = render(<MemoizedComponent value="test" />);

        // Первый рендер
        expect(renderCount).toHaveBeenCalledTimes(1);

        // Ререндер с тем же значением
        rerender(<MemoizedComponent value="test" />);

        // Компонент не должен перерендериваться
        expect(renderCount).toHaveBeenCalledTimes(1);

        // Ререндер с другим значением
        rerender(<MemoizedComponent value="different" />);

        // Компонент должен перерендериваться
        expect(renderCount).toHaveBeenCalledTimes(2);
    });
});
