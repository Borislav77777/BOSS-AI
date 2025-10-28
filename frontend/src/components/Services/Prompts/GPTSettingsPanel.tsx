/**
 * Панель настроек GPT для промптов
 */

import React, { useEffect, useState } from 'react';
import { formatGPTSettings, GPTSettings, PRESET_SETTINGS, validateGPTSettings } from '../../../types/gpt-settings';

interface GPTSettingsPanelProps {
    settings?: GPTSettings;
    onChange: (settings: GPTSettings | undefined) => void;
    className?: string;
}

export const GPTSettingsPanel: React.FC<GPTSettingsPanelProps> = ({
    settings,
    onChange,
    className = ''
}) => {
    const [localSettings, setLocalSettings] = useState<GPTSettings>(settings || {});
    const [selectedPreset, setSelectedPreset] = useState<string>('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [validation, setValidation] = useState({ valid: true, errors: [] as string[] });

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handlePresetChange = (presetName: string) => {
        if (presetName === '') {
            setLocalSettings({});
            setSelectedPreset('');
            onChange(undefined);
        } else {
            const preset = PRESET_SETTINGS[presetName];
            setLocalSettings(preset);
            setSelectedPreset(presetName);
            onChange(preset);
        }
    };

    const handleSettingChange = (key: keyof GPTSettings, value: string | number | boolean | string[]) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);

        const validation = validateGPTSettings(newSettings);
        setValidation(validation);

        if (validation.valid) {
            onChange(newSettings);
        }
    };

    const handleClearSettings = () => {
        setLocalSettings({});
        setSelectedPreset('');
        onChange(undefined);
    };

    const hasSettings = Object.keys(localSettings).length > 0;

    return (
        <div className={`gpt-settings-panel ${className}`}>
            <div className="gpt-settings-header">
                <h4 className="gpt-settings-title">Настройки GPT</h4>
                {hasSettings && (
                    <button
                        className="gpt-settings-clear"
                        onClick={handleClearSettings}
                        title="Очистить настройки"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Предустановки */}
            <div className="gpt-settings-presets">
                <label htmlFor="preset-select" className="gpt-settings-label">Предустановка:</label>
                <select
                    id="preset-select"
                    className="gpt-settings-select"
                    value={selectedPreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                >
                    <option value="">Без предустановки</option>
                    <option value="creative">Креативная</option>
                    <option value="analytical">Аналитическая</option>
                    <option value="balanced">Сбалансированная</option>
                    <option value="precise">Точная</option>
                </select>
            </div>

            {/* Основные настройки */}
            <div className="gpt-settings-basic">
                <div className="gpt-settings-row">
                    <label htmlFor="temperature-slider" className="gpt-settings-label">
                        Temperature:
                        <span className="gpt-settings-value">{localSettings.temperature || 1.0}</span>
                    </label>
                    <input
                        id="temperature-slider"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={localSettings.temperature || 1.0}
                        onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                        className="gpt-settings-slider"
                    />
                </div>

                <div className="gpt-settings-row">
                    <label htmlFor="top-p-slider" className="gpt-settings-label">
                        Top P:
                        <span className="gpt-settings-value">{localSettings.top_p || 1.0}</span>
                    </label>
                    <input
                        id="top-p-slider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={localSettings.top_p || 1.0}
                        onChange={(e) => handleSettingChange('top_p', parseFloat(e.target.value))}
                        className="gpt-settings-slider"
                    />
                </div>

                <div className="gpt-settings-row">
                    <label htmlFor="max-tokens-slider" className="gpt-settings-label">
                        Max Tokens:
                        <span className="gpt-settings-value">{localSettings.max_tokens || 1000}</span>
                    </label>
                    <input
                        id="max-tokens-slider"
                        type="range"
                        min="100"
                        max="4000"
                        step="100"
                        value={localSettings.max_tokens || 1000}
                        onChange={(e) => handleSettingChange('max_tokens', parseInt(e.target.value))}
                        className="gpt-settings-slider"
                    />
                </div>
            </div>

            {/* Расширенные настройки */}
            <div className="gpt-settings-advanced">
                <button
                    className="gpt-settings-toggle"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? 'Скрыть' : 'Показать'} расширенные настройки
                </button>

                {showAdvanced && (
                    <div className="gpt-settings-advanced-content">
                        <div className="gpt-settings-row">
                            <label htmlFor="frequency-penalty-slider" className="gpt-settings-label">
                                Frequency Penalty:
                                <span className="gpt-settings-value">{localSettings.frequency_penalty || 0.0}</span>
                            </label>
                            <input
                                id="frequency-penalty-slider"
                                type="range"
                                min="-2"
                                max="2"
                                step="0.1"
                                value={localSettings.frequency_penalty || 0.0}
                                onChange={(e) => handleSettingChange('frequency_penalty', parseFloat(e.target.value))}
                                className="gpt-settings-slider"
                            />
                        </div>

                        <div className="gpt-settings-row">
                            <label htmlFor="presence-penalty-slider" className="gpt-settings-label">
                                Presence Penalty:
                                <span className="gpt-settings-value">{localSettings.presence_penalty || 0.0}</span>
                            </label>
                            <input
                                id="presence-penalty-slider"
                                type="range"
                                min="-2"
                                max="2"
                                step="0.1"
                                value={localSettings.presence_penalty || 0.0}
                                onChange={(e) => handleSettingChange('presence_penalty', parseFloat(e.target.value))}
                                className="gpt-settings-slider"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Валидация */}
            {!validation.valid && (
                <div className="gpt-settings-errors">
                    {validation.errors.map((error, index) => (
                        <div key={index} className="gpt-settings-error">
                            {error}
                        </div>
                    ))}
                </div>
            )}

            {/* Предварительный просмотр */}
            {hasSettings && (
                <div className="gpt-settings-preview">
                    <span className="gpt-settings-preview-label">Настройки:</span>
                    <span className="gpt-settings-preview-value">
                        {formatGPTSettings(localSettings)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default GPTSettingsPanel;
