/**
 * Контекстные кнопки в чате
 * Показывают прикрепленные проекты, документы и другие элементы контекста
 */
import { ChatContextButton } from '@/types/chat';
import React from 'react';
interface ContextButtonsProps {
    contextButtons: ChatContextButton[];
    onRemoveContext: (id: string) => void;
    className?: string;
}
export declare const ContextButtons: React.FC<ContextButtonsProps>;
export {};
//# sourceMappingURL=ContextButtons.d.ts.map