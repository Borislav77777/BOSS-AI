/**
 * Компонент кнопок сервисов для чата
 */

import { ServiceChatButton } from '@/services/ChatIntegration/types';
import { cn } from '@/utils';
import React from 'react';

interface ServiceChatButtonsProps {
    buttons: ServiceChatButton[];
    position: 'top' | 'bottom';
    onButtonClick: (button: ServiceChatButton) => void;
    className?: string;
}

export const ServiceChatButtons: React.FC<ServiceChatButtonsProps> = ({
    buttons,
    position,
    onButtonClick,
    className
}) => {
    const filteredButtons = buttons.filter(button =>
        button.position === position && button.isEnabled
    );

    if (filteredButtons.length === 0) {
        return null;
    }

    return (
        <div className={cn(
            "flex flex-wrap gap-2 p-2",
            position === 'top' ? "border-b border-border" : "border-t border-border",
            className
        )}>
            {filteredButtons.map(button => (
                <button
                    key={button.id}
                    onClick={() => onButtonClick(button)}
                    className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium",
                        "transition-all duration-200 hover:scale-105",
                        "bg-surface border border-border text-text",
                        "hover:bg-surface-hover hover:border-primary/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                    title={button.label}
                >
                    <span className="text-lg">{button.icon}</span>
                    <span>{button.label}</span>
                </button>
            ))}
        </div>
    );
};
