/**
 * Валидатор коннекторов для всех сервисов
 */
import { ServiceConfig } from '@/types/services';
import { ConnectorConfig } from './ServiceConnector';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}
export interface ConnectorTestResult {
    serviceId: string;
    testName: string;
    passed: boolean;
    error?: string;
    duration: number;
    timestamp: Date;
}
export declare class ConnectorValidator {
    private static instance;
    private testResults;
    private constructor();
    static getInstance(): ConnectorValidator;
    /**
     * Валидирует конфигурацию коннектора
     */
    validateConnectorConfig(config: ConnectorConfig): ValidationResult;
    /**
     * Валидирует конфигурацию сервиса
     */
    validateServiceConfig(config: ServiceConfig): ValidationResult;
    /**
     * Выполняет тесты коннектора
     */
    testConnector(serviceId: string, config: ConnectorConfig): Promise<ConnectorTestResult[]>;
    /**
     * Получает результаты тестов для сервиса
     */
    getTestResults(serviceId: string): ConnectorTestResult[];
    /**
     * Получает все результаты тестов
     */
    getAllTestResults(): Map<string, ConnectorTestResult[]>;
    /**
     * Очищает результаты тестов
     */
    clearTestResults(serviceId?: string): void;
    private isValidUrl;
    private isValidServiceId;
    private isValidVersion;
    private isValidIcon;
    private addAuthHeaders;
}
export declare const connectorValidator: ConnectorValidator;
//# sourceMappingURL=ConnectorValidator.d.ts.map