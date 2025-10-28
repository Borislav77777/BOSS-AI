/**
 * Компонент кнопок сервисов для чата
 */
import { ServiceChatButton } from '@/services/ChatIntegration/types';
import React from 'react';
interface ServiceChatButtonsProps {
    buttons: ServiceChatButton[];
    position: 'top' | 'bottom';
    onButtonClick: (button: ServiceChatButton) => void;
    className?: string;
}
export declare const ServiceChatButtons: React.FC<ServiceChatButtonsProps>;
export {};
//# sourceMappingURL=ServiceChatButtons.d.ts.map