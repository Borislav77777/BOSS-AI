/**
 * Контекстные кнопки в чате
 * Показывают прикрепленные проекты, документы и другие элементы контекста
 */

import { ChatContextButton } from '@/types/chat';
import React from 'react';

interface ContextButtonsProps {
    contextButtons: ChatContextButton[];
    onRemoveContext: (id: string) => void;
    className?: string;
}

export const ContextButtons: React.FC<ContextButtonsProps> = ({
    contextButtons,
    onRemoveContext,
    className = ''
}) => {
    if (contextButtons.length === 0) {
        return null;
    }

    const getTypeIcon = (type: ChatContextButton['type']) => {
        switch (type) {
            case 'project':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                    </svg>
                );
            case 'document':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" x2="8" y1="13" y2="13"></line>
                        <line x1="16" x2="8" y1="17" y2="17"></line>
                        <line x1="10" x2="8" y1="9" y2="9"></line>
                    </svg>
                );
            case 'file':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                );
            case 'image':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                );
            case 'prompt':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                );
        }
    };

    const getTypeColor = (type: ChatContextButton['type']) => {
        switch (type) {
            case 'project':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'document':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'file':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'image':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'prompt':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className={`flex flex-wrap gap-2 mb-3 ${className}`}>
            {contextButtons.map((button) => (
                <div
                    key={button.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${getTypeColor(button.type)}`}
                    title={`${button.type}: ${button.title}`}
                >
                    {getTypeIcon(button.type)}
                    <span className="truncate max-w-[120px]">{button.title}</span>
                    {button.removable && (
                        <button
                            onClick={() => onRemoveContext(button.id)}
                            className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                            title="Удалить из контекста"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                <line x1="18" x2="6" y1="6" y2="18"></line>
                                <line x1="6" x2="18" y1="6" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};
