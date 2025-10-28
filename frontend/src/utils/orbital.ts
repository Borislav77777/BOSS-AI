// Утилиты для орбитальной навигации BOSS AI v2.0

import { BREAKPOINTS } from '../types/agents';

// Определение текущего breakpoint
export const getCurrentBreakpoint = (width: number): keyof typeof BREAKPOINTS => {
    if (width >= BREAKPOINTS.wide) return 'wide';
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
};

// Вычисление позиции элемента на орбите
export const calculatePosition = (
    index: number,
    total: number,
    radius: number,
    startAngle: number = -90
): { x: number; y: number } => {
    const angle = (startAngle + (360 / total) * index) * (Math.PI / 180);
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
    };
};

// Вычисление позиций для подсервисов (внешний радиус)
export const calculateSubServicePositions = (
    agentIndex: number,
    agentPosition: { x: number; y: number },
    subServicesCount: number,
    baseRadius: number
): Array<{ x: number; y: number }> => {
    const positions: Array<{ x: number; y: number }> = [];

    // Вычисляем угол агента относительно центра
    const agentAngle = Math.atan2(agentPosition.y, agentPosition.x);

    // Располагаем подсервисы ДАЛЬШЕ от центра
    const subServiceRadius = baseRadius + 100; // Добавляем к радиусу агента

    // Распределяем по дуге вокруг агента (90 градусов)
    const arcStart = agentAngle - Math.PI / 4; // -45°
    const arcStep = (Math.PI / 2) / (subServicesCount - 1); // 90° / количество

    for (let i = 0; i < subServicesCount; i++) {
        const angle = arcStart + arcStep * i;
        positions.push({
            x: Math.cos(angle) * subServiceRadius,
            y: Math.sin(angle) * subServiceRadius,
        });
    }

    return positions;
};

// Проверка, находится ли элемент в видимой области
export const isElementVisible = (
    elementPosition: { x: number; y: number },
    viewportWidth: number,
    viewportHeight: number,
    margin: number = 50
): boolean => {
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    const elementX = centerX + elementPosition.x;
    const elementY = centerY + elementPosition.y;

    return (
        elementX >= margin &&
        elementX <= viewportWidth - margin &&
        elementY >= margin &&
        elementY <= viewportHeight - margin
    );
};

// Вычисление оптимального радиуса для мобильных устройств
export const calculateOptimalMobileRadius = (
    viewportWidth: number,
    viewportHeight: number,
    iconSize: number,
    margin: number = 20
): number => {
    const availableWidth = viewportWidth - (margin * 2) - iconSize;
    const availableHeight = viewportHeight - (margin * 2) - iconSize;
    const maxRadius = Math.min(availableWidth, availableHeight) / 2;

    // Ограничиваем максимальный радиус для мобильных
    return Math.min(maxRadius, 160);
};

// Генерация уникального ID для анимации
export const generateAnimationId = (prefix: string = 'orbital'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Throttle функция для оптимизации производительности
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
            func(...args);
            lastExecTime = currentTime;
        } else {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
};

// Debounce функция для оптимизации производительности
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Проверка поддержки touch событий
export const isTouchDevice = (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Получение размера элемента
export const getElementSize = (element: HTMLElement): { width: number; height: number } => {
    const rect = element.getBoundingClientRect();
    return {
        width: rect.width,
        height: rect.height,
    };
};

// Вычисление расстояния между двумя точками
export const calculateDistance = (
    point1: { x: number; y: number },
    point2: { x: number; y: number }
): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

// Проверка пересечения элементов
export const checkCollision = (
    element1: { x: number; y: number; size: number },
    element2: { x: number; y: number; size: number }
): boolean => {
    const distance = calculateDistance(element1, element2);
    const minDistance = (element1.size + element2.size) / 2 + 10; // 10px зазор
    return distance < minDistance;
};

// Оптимизация позиций для избежания пересечений
export const optimizePositions = (
    positions: Array<{ x: number; y: number; size: number }>,
    maxIterations: number = 10
): Array<{ x: number; y: number; size: number }> => {
    let optimized = [...positions];
    let hasCollisions = true;
    let iterations = 0;

    while (hasCollisions && iterations < maxIterations) {
        hasCollisions = false;

        for (let i = 0; i < optimized.length; i++) {
            for (let j = i + 1; j < optimized.length; j++) {
                if (checkCollision(optimized[i], optimized[j])) {
                    hasCollisions = true;

                    // Сдвигаем элементы в противоположные стороны
                    const dx = optimized[j].x - optimized[i].x;
                    const dy = optimized[j].y - optimized[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0) {
                        const moveDistance = (optimized[i].size + optimized[j].size) / 4;
                        const moveX = (dx / distance) * moveDistance;
                        const moveY = (dy / distance) * moveDistance;

                        optimized[i].x -= moveX;
                        optimized[i].y -= moveY;
                        optimized[j].x += moveX;
                        optimized[j].y += moveY;
                    }
                }
            }
        }

        iterations++;
    }

    return optimized;
};
