import { cn } from '@/utils';
import { Bot, Brain, ChevronDown, FileText, Mic, Settings } from 'lucide-react';
import React, { useState } from 'react';

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

// Карта иконок для сервисов
const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'ai-assistant': Brain,
    'chatgpt-service': Bot,
    'real-speech-service': Mic,
    'settings': Settings,
    'file-manager': FileText,
} as unknown as Record<string, React.ComponentType<{ className?: string }>>;

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
    selectedService,
    onServiceChange,
    services,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedServiceData = services.find(service => service.id === selectedService) || services[0];
    const Icon = serviceIconMap[selectedServiceData?.icon] || Brain;

    const handleServiceSelect = (serviceId: string) => {
        onServiceChange(serviceId);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md",
                    "bg-surface/30 border border-border/30 hover:bg-surface/50",
                    "transition-all duration-200 text-xs"
                )}
            >
                <Icon className="w-3 h-3 text-primary" />
                <div className="text-xs">
                    <div className="font-medium truncate max-w-20">{selectedServiceData?.name}</div>
                </div>
                <ChevronDown
                    className={cn(
                        "w-2 h-2 text-text-secondary transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50">
                    {services.map((service) => {
                        const ServiceIcon = serviceIconMap[service.icon] || Brain;
                        return (
                            <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service.id)}
                                className={cn(
                                    "w-full flex items-start justify-between px-3 py-2 text-left",
                                    "hover:bg-surface/50 transition-colors duration-200",
                                    "first:rounded-t-lg last:rounded-b-lg",
                                    selectedService === service.id && "bg-primary/10"
                                )}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <ServiceIcon className="w-4 h-4 text-primary" />
                                    <div>
                                        <div className="font-medium text-sm">{service.name}</div>
                                        <div className="text-xs text-text-secondary">{service.description}</div>
                                    </div>
                                </div>
                                {service.isActive && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
