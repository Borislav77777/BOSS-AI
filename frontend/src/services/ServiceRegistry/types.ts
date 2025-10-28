/**
 * Типы для Service Registry
 */

import { ServiceConfig } from '@/types/services';

export interface ServiceCapabilities {
  id: string;
  name: string;
  version: string;
  category: string;
  capabilities: {
    settings?: boolean;
    workspace?: boolean;
    chat?: boolean;
    widgets?: boolean;
    api?: boolean;
    events?: boolean;
  };
  dependencies: string[];
  conflicts: string[];
  requirements: {
    minPlatformVersion?: string;
    nodeVersion?: string;
    browserSupport?: string[];
  };
}

export interface ServiceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ServiceDependency {
  serviceId: string;
  version: string;
  optional: boolean;
  description: string;
}

export interface ServiceRegistryEntry {
  config: ServiceConfig;
  capabilities: ServiceCapabilities;
  dependencies: ServiceDependency[];
  isRegistered: boolean;
  isActive: boolean;
  lastUpdated: Date;
  metadata: {
    author: string;
    license: string;
    repository?: string;
    documentation?: string;
  };
}

export interface ServiceRegistry {
  // Регистрация сервисов
  registerService(service: ServiceConfig): Promise<ServiceValidationResult>;
  unregisterService(serviceId: string): Promise<boolean>;

  // Получение информации
  getService(serviceId: string): ServiceRegistryEntry | null;
  getAllServices(): ServiceRegistryEntry[];
  getServicesByCategory(category: string): ServiceRegistryEntry[];
  getServiceCapabilities(serviceId: string): ServiceCapabilities | null;

  // Валидация
  validateService(service: ServiceConfig): ServiceValidationResult;
  validateDependencies(serviceId: string): ServiceValidationResult;
  checkConflicts(serviceId: string): string[];

  // Зависимости
  getServiceDependencies(serviceId: string): ServiceDependency[];
  getDependentServices(serviceId: string): string[];
  resolveDependencyTree(serviceId: string): string[];

  // Состояние
  isServiceRegistered(serviceId: string): boolean;
  isServiceActive(serviceId: string): boolean;
  activateService(serviceId: string): Promise<boolean>;
  deactivateService(serviceId: string): Promise<boolean>;

  // События
  onServiceRegistered: (callback: (service: ServiceRegistryEntry) => void) => void;
  onServiceUnregistered: (callback: (serviceId: string) => void) => void;
  onServiceActivated: (callback: (serviceId: string) => void) => void;
  onServiceDeactivated: (callback: (serviceId: string) => void) => void;
}
