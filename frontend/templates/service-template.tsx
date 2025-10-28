/**
 * Шаблон для создания нового сервиса
 * Скопируйте этот файл и замените SERVICE_NAME на название вашего сервиса
 */

import { UnifiedCard, UnifiedService } from '@/components/common';
import React, { useState } from 'react';

interface SERVICE_NAMEProps {
    className?: string;
}

export const SERVICE_NAME: React.FC<SERVICE_NAMEProps> = ({ className }) => {
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (active: boolean) => {
        setIsLoading(true);
        try {
            // Здесь добавьте логику активации/деактивации сервиса
            await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация загрузки
            setIsActive(active);
        } catch (error) {
            console.error('Ошибка при изменении состояния сервиса:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfigure = () => {
        // Здесь добавьте логику настройки сервиса
        console.log('Настройка сервиса SERVICE_NAME');
    };

    const handleAction = (actionId: string) => {
        // Здесь добавьте логику для различных действий
        console.log('Действие:', actionId);
    };

    const actions = [
        {
            id: 'start',
            label: 'Запустить',
            variant: 'primary' as const,
            onClick: () => handleAction('start'),
            disabled: isActive,
        },
        {
            id: 'stop',
            label: 'Остановить',
            variant: 'danger' as const,
            onClick: () => handleAction('stop'),
            disabled: !isActive,
        },
    ];

    return (
        <UnifiedService
            id="SERVICE_NAME"
            title="Название сервиса"
            description="Описание функциональности сервиса"
            icon="🔧" // Замените на подходящую иконку
            status={isLoading ? 'loading' : isActive ? 'active' : 'inactive'}
            variant="default"
            size="md"
            actions={actions}
            onToggle={handleToggle}
            onConfigure={handleConfigure}
            className={className}
        >
            {/* Здесь добавьте специфичный контент сервиса */}
            <UnifiedCard variant="outlined" size="sm">
                <p>Дополнительная информация о сервисе</p>
            </UnifiedCard>
        </UnifiedService>
    );
};

export default SERVICE_NAME;
