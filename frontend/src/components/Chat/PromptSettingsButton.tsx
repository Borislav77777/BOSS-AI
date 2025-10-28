/**
 * Кнопка настроек промпта в чате
 */

import React from 'react';
import { GPTSettings, formatGPTSettings } from '../../types/gpt-settings';

interface PromptSettingsButtonProps {
    promptId: string;
    promptTitle: string;
    settings: GPTSettings;
    onRemove: () => void;
    onOpenPrompt: () => void;
    className?: string;
}

export const PromptSettingsButton: React.FC<PromptSettingsButtonProps> = ({
    promptId: _promptId,
    promptTitle,
    settings,
    onRemove,
    onOpenPrompt,
    className = ''
}) => {
    const settingsText = formatGPTSettings(settings);

    return (
        <div className={`prompt-settings-button ${className}`}>
            <button
                className="prompt-settings-button-content"
                onClick={onOpenPrompt}
                title={`Открыть промпт: ${promptTitle}`}
            >
                <div className="prompt-settings-button-icon">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                    </svg>
                </div>
                <div className="prompt-settings-button-text">
                    <div className="prompt-settings-button-title">{promptTitle}</div>
                    <div className="prompt-settings-button-settings">{settingsText}</div>
                </div>
            </button>
            <button
                className="prompt-settings-button-remove"
                onClick={onRemove}
                title="Удалить настройки промпта"
            >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
};

export default PromptSettingsButton;
