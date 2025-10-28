/**
 * Валидатор сервисов для Service Registry
 */
import { ServiceConfig } from '@/types/services';
import { ServiceValidationResult } from './types';
export declare class ServiceValidator {
    private readonly PLATFORM_VERSION;
    private readonly REQUIRED_FIELDS;
    private readonly VALID_CATEGORIES;
    private readonly VALID_ICONS;
    /**
     * Валидирует конфигурацию сервиса
     */
    validateService(service: ServiceConfig): ServiceValidationResult;
    /**
     * Валидирует зависимости сервиса
     */
    validateDependencies(service: ServiceConfig): ServiceValidationResult;
    /**
     * Проверяет конфликты между сервисами
     */
    checkConflicts(service: ServiceConfig, existingServices: ServiceConfig[]): string[];
    private validateRequiredFields;
    private validateDataTypes;
    private validateValues;
    private validateTools;
    private validateSettings;
    private validateChatButtons;
    private validateTheme;
    private generateSuggestions;
    private isValidServiceId;
    private isValidVersion;
}
//# sourceMappingURL=ServiceValidator.d.ts.map