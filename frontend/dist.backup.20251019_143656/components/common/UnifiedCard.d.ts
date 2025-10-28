/**
 * Унифицированная карточка платформы
 * Объединяет все варианты карточек в один переиспользуемый компонент
 * Использует платформенные CSS переменные для единообразия
 */
import React from 'react';
export interface UnifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'solid' | 'elevated' | 'outlined';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    clickable?: boolean;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
}
export declare const UnifiedCard: React.FC<UnifiedCardProps>;
//# sourceMappingURL=UnifiedCard.d.ts.map