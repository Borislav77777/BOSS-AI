/**
 * Модуль валидации настроек
 */
import { SettingValue } from '@/types';
import { SettingsValidator } from '../types/SettingsTypes';
export declare class SettingsValidatorImpl implements SettingsValidator {
    private validationRules;
    constructor();
    private initializeValidationRules;
    validate(key: string, value: SettingValue): boolean;
    getValidationRules(): Record<string, (value: SettingValue) => boolean>;
    addValidationRule(key: string, validator: (value: SettingValue) => boolean): void;
    removeValidationRule(key: string): void;
    validateAll(settings: Record<string, SettingValue>): Record<string, boolean>;
    getInvalidSettings(settings: Record<string, SettingValue>): string[];
}
//# sourceMappingURL=SettingsValidator.d.ts.map