import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Панель настроек GPT для промптов
 */
import React, { useEffect, useState } from 'react';
import { formatGPTSettings, PRESET_SETTINGS, validateGPTSettings } from '../../../types/gpt-settings';
export const GPTSettingsPanel = ({ settings, onChange, className = '' }) => {
    const [localSettings, setLocalSettings] = useState(settings || {});
    const [selectedPreset, setSelectedPreset] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [validation, setValidation] = useState({ valid: true, errors: [] });
    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);
    const handlePresetChange = (presetName) => {
        if (presetName === '') {
            setLocalSettings({});
            setSelectedPreset('');
            onChange(undefined);
        }
        else {
            const preset = PRESET_SETTINGS[presetName];
            setLocalSettings(preset);
            setSelectedPreset(presetName);
            onChange(preset);
        }
    };
    const handleSettingChange = (key, value) => {
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
    return (_jsxs("div", { className: `gpt-settings-panel ${className}`, children: [_jsxs("div", { className: "gpt-settings-header", children: [_jsx("h4", { className: "gpt-settings-title", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 GPT" }), hasSettings && (_jsx("button", { className: "gpt-settings-clear", onClick: handleClearSettings, title: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", children: "\u2715" }))] }), _jsxs("div", { className: "gpt-settings-presets", children: [_jsx("label", { htmlFor: "preset-select", className: "gpt-settings-label", children: "\u041F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430:" }), _jsxs("select", { id: "preset-select", className: "gpt-settings-select", value: selectedPreset, onChange: (e) => handlePresetChange(e.target.value), children: [_jsx("option", { value: "", children: "\u0411\u0435\u0437 \u043F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438" }), _jsx("option", { value: "creative", children: "\u041A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u0430\u044F" }), _jsx("option", { value: "analytical", children: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F" }), _jsx("option", { value: "balanced", children: "\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F" }), _jsx("option", { value: "precise", children: "\u0422\u043E\u0447\u043D\u0430\u044F" })] })] }), _jsxs("div", { className: "gpt-settings-basic", children: [_jsxs("div", { className: "gpt-settings-row", children: [_jsxs("label", { htmlFor: "temperature-slider", className: "gpt-settings-label", children: ["Temperature:", _jsx("span", { className: "gpt-settings-value", children: localSettings.temperature || 1.0 })] }), _jsx("input", { id: "temperature-slider", type: "range", min: "0", max: "2", step: "0.1", value: localSettings.temperature || 1.0, onChange: (e) => handleSettingChange('temperature', parseFloat(e.target.value)), className: "gpt-settings-slider" })] }), _jsxs("div", { className: "gpt-settings-row", children: [_jsxs("label", { htmlFor: "top-p-slider", className: "gpt-settings-label", children: ["Top P:", _jsx("span", { className: "gpt-settings-value", children: localSettings.top_p || 1.0 })] }), _jsx("input", { id: "top-p-slider", type: "range", min: "0", max: "1", step: "0.05", value: localSettings.top_p || 1.0, onChange: (e) => handleSettingChange('top_p', parseFloat(e.target.value)), className: "gpt-settings-slider" })] }), _jsxs("div", { className: "gpt-settings-row", children: [_jsxs("label", { htmlFor: "max-tokens-slider", className: "gpt-settings-label", children: ["Max Tokens:", _jsx("span", { className: "gpt-settings-value", children: localSettings.max_tokens || 1000 })] }), _jsx("input", { id: "max-tokens-slider", type: "range", min: "100", max: "4000", step: "100", value: localSettings.max_tokens || 1000, onChange: (e) => handleSettingChange('max_tokens', parseInt(e.target.value)), className: "gpt-settings-slider" })] })] }), _jsxs("div", { className: "gpt-settings-advanced", children: [_jsxs("button", { className: "gpt-settings-toggle", onClick: () => setShowAdvanced(!showAdvanced), children: [showAdvanced ? 'Скрыть' : 'Показать', " \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"] }), showAdvanced && (_jsxs("div", { className: "gpt-settings-advanced-content", children: [_jsxs("div", { className: "gpt-settings-row", children: [_jsxs("label", { htmlFor: "frequency-penalty-slider", className: "gpt-settings-label", children: ["Frequency Penalty:", _jsx("span", { className: "gpt-settings-value", children: localSettings.frequency_penalty || 0.0 })] }), _jsx("input", { id: "frequency-penalty-slider", type: "range", min: "-2", max: "2", step: "0.1", value: localSettings.frequency_penalty || 0.0, onChange: (e) => handleSettingChange('frequency_penalty', parseFloat(e.target.value)), className: "gpt-settings-slider" })] }), _jsxs("div", { className: "gpt-settings-row", children: [_jsxs("label", { htmlFor: "presence-penalty-slider", className: "gpt-settings-label", children: ["Presence Penalty:", _jsx("span", { className: "gpt-settings-value", children: localSettings.presence_penalty || 0.0 })] }), _jsx("input", { id: "presence-penalty-slider", type: "range", min: "-2", max: "2", step: "0.1", value: localSettings.presence_penalty || 0.0, onChange: (e) => handleSettingChange('presence_penalty', parseFloat(e.target.value)), className: "gpt-settings-slider" })] })] }))] }), !validation.valid && (_jsx("div", { className: "gpt-settings-errors", children: validation.errors.map((error, index) => (_jsx("div", { className: "gpt-settings-error", children: error }, index))) })), hasSettings && (_jsxs("div", { className: "gpt-settings-preview", children: [_jsx("span", { className: "gpt-settings-preview-label", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438:" }), _jsx("span", { className: "gpt-settings-preview-value", children: formatGPTSettings(localSettings) })] }))] }));
};
export default GPTSettingsPanel;
//# sourceMappingURL=GPTSettingsPanel.js.map