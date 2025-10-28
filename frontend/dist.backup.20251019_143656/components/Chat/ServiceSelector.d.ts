import React from 'react';
interface Service {
    id: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
    models?: Array<{
        id: string;
        name: string;
        description: string;
        cost: string;
        isDefault?: boolean;
    }>;
}
interface ServiceSelectorProps {
    selectedService: string;
    onServiceChange: (serviceId: string) => void;
    services: Service[];
    className?: string;
}
export declare const ServiceSelector: React.FC<ServiceSelectorProps>;
export {};
//# sourceMappingURL=ServiceSelector.d.ts.map