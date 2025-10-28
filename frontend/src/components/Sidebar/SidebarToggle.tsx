import { cn } from '@/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';

interface SidebarToggleProps {
    isCollapsed: boolean;
    onToggle: () => void;
    className?: string;
}

/**
 * Компонент кнопки сворачивания/разворачивания сайдбара
 */
export const SidebarToggle = memo<SidebarToggleProps>(({
    isCollapsed,
    onToggle,
    className = ''
}) => {
    return (
        <button
            onClick={onToggle}
            className={cn(
                'absolute -right-3 top-1/2 transform -translate-y-1/2 z-10',
                'w-6 h-6 rounded-full border-2 transition-all duration-200',
                'bg-surface border-border hover:border-primary hover:bg-surface-hover',
                'flex items-center justify-center shadow-lg hover:shadow-xl',
                'text-icon-muted hover:text-primary',
                className
            )}
            title={isCollapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
        >
            {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
            ) : (
                <ChevronLeft className="w-4 h-4" />
            )}
        </button>
    );
});

SidebarToggle.displayName = 'SidebarToggle';
