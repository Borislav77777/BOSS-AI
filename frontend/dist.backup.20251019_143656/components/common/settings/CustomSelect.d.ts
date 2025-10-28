import React from 'react';
import { SelectOption, SettingValue } from '../../../types';
interface CustomSelectProps {
    value: SettingValue;
    options: SelectOption[];
    onChange: (value: SettingValue) => void;
    placeholder?: string;
    positioning?: 'fixed' | 'absolute';
}
/**
 * Кастомный выпадающий список без синих полей
 * Унифицированный компонент для всех селектов в настройках
 */
export declare const CustomSelect: React.FC<CustomSelectProps>;
export {};
//# sourceMappingURL=CustomSelect.d.ts.map