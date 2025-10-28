import React from 'react';
import { SelectOption, SettingValue } from '../../../types';
interface ButtonSelectProps {
    value: SettingValue;
    options: SelectOption[];
    onChange: (value: SettingValue) => void;
    placeholder?: string;
    className?: string;
}
/**
 * Компонент выбора с кнопками вместо выпадающего списка
 * Решает проблему с z-index и позиционированием
 */
export declare const ButtonSelect: React.FC<ButtonSelectProps>;
export {};
//# sourceMappingURL=ButtonSelect.d.ts.map