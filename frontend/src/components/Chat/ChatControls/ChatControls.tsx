/**
 * Компонент управления чатом (сервисы, модели, кнопки)
 */

import React from 'react';
import { ChatButtons } from '../ChatButtons';
import { ModelSelector } from '../ModelSelector';
import { ServiceSelector } from '../ServiceSelector';
import { ChatControlsProps } from '../types';

export const ChatControls: React.FC<ChatControlsProps> = ({
    onServiceSelect,
    onModelSelect,
    onButtonClick,
    selectedService,
    selectedModel,
    availableServices,
    availableModels
}) => {
    return (
        <div className="flex flex-col space-y-4">
            {/* Выбор сервиса */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-text">Сервис</label>
                <ServiceSelector
                    services={availableServices}
                    selectedService={selectedService || ''}
                    onServiceChange={onServiceSelect}
                />
            </div>

            {/* Выбор модели */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-text">Модель</label>
                <ModelSelector
                    models={availableModels}
                    selectedModel={selectedModel || ''}
                    onModelChange={onModelSelect}
                />
            </div>

            {/* Кнопки чата */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-text">Действия</label>
                <ChatButtons onClick={onButtonClick} />
            </div>
        </div>
    );
};
