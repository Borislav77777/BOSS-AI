import React from 'react';
interface TextSettingProps {
    name: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
}
/**
 * Компонент для текстовых настроек (input)
 * Выделен из SettingItem для лучшей модульности
 */
export declare const TextSetting: React.FC<TextSettingProps>;
export {};
//# sourceMappingURL=TextSetting.d.ts.map