/**
 * Унифицированный компонент сервиса
 * Облегчает добавление новых сервисов в платформу
 * Использует платформенные стили и компоненты
 */

import { cn } from '@/utils/cn';
import React, { memo } from 'react';
import { UnifiedButton, UnifiedCard } from './';

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

const statusClasses = {
    active: 'platform-service-active',
    inactive: 'platform-service-inactive',
    loading: 'platform-service-loading',
    error: 'platform-service-error',
};

const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

export const UnifiedService: React.FC<UnifiedServiceProps> = memo(({
    id: _id,
    title,
    description,
    icon,
    status = 'inactive',
    variant = 'default',
    size = 'md',
    hover = true,
    actions = [],
    onToggle,
    onConfigure,
    className,
    children,
}) => {
    const isActive = status === 'active';
    const isLoading = status === 'loading';
    const hasError = status === 'error';

    const handleToggle = () => {
        if (onToggle && !isLoading) {
            onToggle(!isActive);
        }
    };

    const handleConfigure = () => {
        if (onConfigure && !isLoading) {
            onConfigure();
        }
    };

    return (
        <UnifiedCard
            variant={variant}
            size={size}
            hover={hover}
            clickable={!!onToggle}
            className={cn(
                'platform-service',
                statusClasses[status],
                sizeClasses[size],
                className
            )}
            onClick={handleToggle}
        >
            {/* Стандартизированная шапка с рамкой */}
            <div className="platform-service-header-standard">
                <div className="platform-service-header-content">
                    <div className="platform-service-icon">
                        {icon}
                    </div>

                    <div className="platform-service-content">
                        <h3 className="platform-service-title">
                            {title}
                        </h3>

                        {description && (
                            <p className="platform-service-description">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="platform-service-status">
                        {isLoading && (
                            <div className="platform-service-spinner" />
                        )}

                        {hasError && (
                            <div className="platform-service-error-icon">
                                ⚠️
                            </div>
                        )}

                        {isActive && !isLoading && !hasError && (
                            <div className="platform-service-active-icon">
                                ✓
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {children && (
                <div className="platform-service-body">
                    {children}
                </div>
            )}

            {(actions.length > 0 || onConfigure) && (
                <div className="platform-service-actions">
                    {actions.map((action) => (
                        <UnifiedButton
                            key={action.id}
                            variant={action.variant || 'secondary'}
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                            }}
                            disabled={action.disabled || isLoading}
                        >
                            {action.label}
                        </UnifiedButton>
                    ))}

                    {onConfigure && (
                        <UnifiedButton
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleConfigure();
                            }}
                            disabled={isLoading}
                        >
                            Настроить
                        </UnifiedButton>
                    )}
                </div>
            )}
        </UnifiedCard>
    );
});

UnifiedService.displayName = 'UnifiedService';
