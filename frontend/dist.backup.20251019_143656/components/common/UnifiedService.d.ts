/**
 * Унифицированный компонент сервиса
 * Облегчает добавление новых сервисов в платформу
 * Использует платформенные стили и компоненты
 */
import React from 'react';
export interface UnifiedServiceProps {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    status?: 'active' | 'inactive' | 'loading' | 'error';
    variant?: 'default' | 'glass' | 'solid' | 'elevated' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    hover?: boolean;
    actions?: Array<{
        id: string;
        label: string;
        variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
        onClick: () => void;
        disabled?: boolean;
    }>;
    onToggle?: (active: boolean) => void;
    onConfigure?: () => void;
    className?: string;
    children?: React.ReactNode;
}
export declare const UnifiedService: React.FC<UnifiedServiceProps>;
//# sourceMappingURL=UnifiedService.d.ts.map