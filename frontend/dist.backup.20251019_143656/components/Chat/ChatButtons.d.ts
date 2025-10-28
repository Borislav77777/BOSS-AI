import { ChatButton } from '@/types/services';
import React from 'react';
interface ServiceGroup {
    serviceId: string;
    serviceName: string;
    serviceIcon?: string;
    buttons: ChatButton[];
}
interface ChatButtonsProps {
    buttons?: ChatButton[];
    groups?: ServiceGroup[];
    onClick: (button: ChatButton, serviceId?: string) => void;
    className?: string;
    activeButtonId?: string | null;
    compactMode?: 'normal' | 'compact' | 'ultra-compact';
}
/**
 * Компактный компонент кнопок чата с современным дизайном
 * Оптимизирован для минимального HTML и максимальной функциональности
 */
export declare const ChatButtons: React.FC<ChatButtonsProps>;
export default ChatButtons;
//# sourceMappingURL=ChatButtons.d.ts.map