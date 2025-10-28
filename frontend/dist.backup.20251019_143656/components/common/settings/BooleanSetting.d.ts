import React from 'react';
interface BooleanSettingProps {
    name: string;
    description?: string;
    value: boolean;
    onChange: (value: boolean) => void;
}
/**
 * Компонент для булевых настроек (чекбоксы)
 * Выделен из SettingItem для лучшей модульности
 */
export declare const BooleanSetting: React.FC<BooleanSettingProps>;
export {};
//# sourceMappingURL=BooleanSetting.d.ts.map