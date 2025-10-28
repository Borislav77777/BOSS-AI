/**
 * Компонент настроек сервиса
 */
import { ServiceRegistryEntry } from '@/services/ServiceRegistry/types';
import React from 'react';
interface ServiceSettingsComponentProps {
    service: ServiceRegistryEntry;
    onSettingChange: (key: string, value: any) => void;
    className?: string;
}
export declare const ServiceSettingsComponent: React.FC<ServiceSettingsComponentProps>;
export {};
//# sourceMappingURL=ServiceSettingsComponent.d.ts.map