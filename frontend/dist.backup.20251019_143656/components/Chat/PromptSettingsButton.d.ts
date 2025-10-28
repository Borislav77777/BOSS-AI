/**
 * Кнопка настроек промпта в чате
 */
import React from 'react';
import { GPTSettings } from '../../types/gpt-settings';
interface PromptSettingsButtonProps {
    promptId: string;
    promptTitle: string;
    settings: GPTSettings;
    onRemove: () => void;
    onOpenPrompt: () => void;
    className?: string;
}
export declare const PromptSettingsButton: React.FC<PromptSettingsButtonProps>;
export default PromptSettingsButton;
//# sourceMappingURL=PromptSettingsButton.d.ts.map