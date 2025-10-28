import React from 'react';
interface NumberSettingProps {
    name: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}
/**
 * Компонент для числовых настроек (слайдеры)
 * Выделен из SettingItem для лучшей модульности
 */
export declare const NumberSetting: React.FC<NumberSettingProps>;
export {};
//# sourceMappingURL=NumberSetting.d.ts.map