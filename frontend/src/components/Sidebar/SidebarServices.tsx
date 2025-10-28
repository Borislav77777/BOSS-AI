import { ServiceTool } from '@/types/services';
import { cn } from '@/utils';
import React, { memo, useCallback } from 'react';
import { SidebarTool } from './SidebarTool';

interface Service {
    config: {
        id: string;
        name: string;
        icon: string;
        tools: ServiceTool[];
    };
}

interface SidebarServicesProps {
    services: Service[];
    expandedServices: Set<string>;
    onToggleExpansion: (serviceId: string) => void;
    onToolClick: (serviceId: string, toolId: string) => void;
    iconMap: Record<string, React.ComponentType<{ className?: string }>>;
    isCollapsed: boolean;
    className?: string;
}

/**
 * Компонент секции сервисов в сайдбаре
 */
export const SidebarServices = memo<SidebarServicesProps>(({
    services,
    expandedServices,
    onToggleExpansion,
    onToolClick,
    iconMap,
    isCollapsed,
    className = ''
}) => {
    const handleServiceClick = useCallback((serviceId: string) => {
        onToggleExpansion(serviceId);
    }, [onToggleExpansion]);

    if (services.length === 0) {
        return null;
    }

    return (
        <div className={cn('space-y-0.5', className)}>
            {services.map((service) => {
                const isExpanded = expandedServices.has(service.config.id);
                const ServiceIcon = iconMap[service.config.icon] || iconMap.Folder;

                return (
                    <div key={service.config.id} className="animate-interface-stagger">
                        {/* Кнопка сервиса */}
                        <button
                            onClick={() => handleServiceClick(service.config.id)}
                            className={cn(
                                'w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 group',
                                'hover:bg-surface-hover hover:shadow-sm text-white hover:text-white',
                                isCollapsed ? 'justify-center' : 'justify-between'
                            )}
                            title={isCollapsed ? service.config.name : undefined}
                        >
                            <div className={cn(
                                'flex items-center',
                                isCollapsed ? 'justify-center' : 'justify-start'
                            )}>
                                <ServiceIcon className={cn(
                                    'transition-all duration-200',
                                    isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3',
                                    'text-icon-muted group-hover:text-icon-primary'
                                )} />

                                {!isCollapsed && (
                                    <span className="text-sm font-medium truncate">
                                        {service.config.name}
                                    </span>
                                )}
                            </div>

                            {!isCollapsed && (
                                <div className="flex items-center">
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary mr-2">
                                        {service.config.tools.length}
                                    </span>
                                    {isExpanded ? (
                                        <svg className="w-4 h-4 text-icon-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-icon-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </div>
                            )}
                        </button>

                        {/* Инструменты сервиса (в потоке, смещают элементы ниже) */}
                        {isExpanded && !isCollapsed && (
                            <div className="mt-1 ml-3 mr-4 pr-2 pt-1 pb-1 space-y-0.5 animate-interface-slide-up overflow-visible">
                                {service.config.tools.map((tool: ServiceTool) => (
                                    <SidebarTool
                                        key={tool.id}
                                        tool={tool}
                                        serviceId={service.config.id}
                                        onToolClick={onToolClick}
                                        iconMap={iconMap}
                                        isCollapsed={isCollapsed}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

SidebarServices.displayName = 'SidebarServices';
