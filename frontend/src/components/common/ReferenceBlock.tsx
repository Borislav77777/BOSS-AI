import { cn } from '@/utils';
import { Settings as SettingsIcon } from 'lucide-react';
import React from 'react';

interface ReferenceBlockProps {
    className?: string;
    onClick?: () => void;
    isActive?: boolean;
}

/**
 * Эталонный блок "Все настройки" - используется как образец дизайна
 * для всех элементов интерфейса с закругленными краями и liquid glass эффектом
 */
export const ReferenceBlock: React.FC<ReferenceBlockProps> = ({
    className,
    onClick,
    isActive = false
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                "liquid-glass-block", // Применяем liquid glass эффект
                isActive
                    ? "bg-primary text-background shadow-md"
                    : "hover:bg-surface/50 text-text",
                className
            )}
        >
            <SettingsIcon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Все настройки</div>
                <div className="text-xs opacity-70">Показать все категории</div>
            </div>
        </button>
    );
};

ReferenceBlock.displayName = 'ReferenceBlock';
