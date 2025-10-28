/**
 * Панель настроек GPT для промптов
 */
import React from 'react';
import { GPTSettings } from '../../../types/gpt-settings';
interface GPTSettingsPanelProps {
    settings?: GPTSettings;
    onChange: (settings: GPTSettings | undefined) => void;
    className?: string;
}
export declare const GPTSettingsPanel: React.FC<GPTSettingsPanelProps>;
export default GPTSettingsPanel;
//# sourceMappingURL=GPTSettingsPanel.d.ts.map