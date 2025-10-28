import { ChatButton } from '@/types/services';
import { cn } from '@/utils';
import { Bot, Camera, Edit3, Eye, EyeOff, FileText, FileText as FileTextIcon, FolderOpen, Grid, Languages, MessageCircle, Mic, Paperclip, Search, Send, Settings, Smile, Square, Upload, Wand2, Zap } from 'lucide-react';
import React, { useRef } from 'react';

interface ServiceGroup {
    serviceId: string;
    serviceName: string;
    serviceIcon?: string;
    buttons: ChatButton[];
}

interface ExtendedChatButton extends ChatButton {
    serviceId?: string;
    disabled?: boolean;
}

interface ChatButtonsProps {
    // Можно передать либо простой список кнопок,
    // либо сгруппированный по сервисам список для заданной позиции
    buttons?: ChatButton[];
    groups?: ServiceGroup[];
    onClick: (button: ChatButton, serviceId?: string) => void;
    className?: string;
    activeButtonId?: string | null;
    compactMode?: 'normal' | 'compact' | 'ultra-compact';
}

// Локальная карта безопасных иконок по имени
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Square,
    Bot,
    Camera,
    Zap,
    MessageCircle,
    Languages,
    Wand2,
    FileText,
    Edit3,
    FolderOpen,
    Upload,
    Search,
    Smile,
    Settings,
    Eye,
    EyeOff,
    Mic,
    Paperclip,
    Send,
    FileTextIcon,
    Grid,
} as unknown as Record<string, React.ComponentType<{ className?: string }>>;

/**
 * Компактный компонент кнопок чата с современным дизайном
 * Оптимизирован для минимального HTML и максимальной функциональности
 */
export const ChatButtons: React.FC<ChatButtonsProps> = ({ buttons, groups, onClick, className, activeButtonId, compactMode = 'normal' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const hasFlat = Array.isArray(buttons) && buttons.length > 0;
    const hasGroups = Array.isArray(groups) && groups.length > 0;

    if (!hasFlat && !hasGroups) return null;

    // Получаем все кнопки для пагинации
    const allButtons: ExtendedChatButton[] = hasFlat ? buttons! : groups!.flatMap(group =>
        group.buttons.map(button => ({ ...button, serviceId: group.serviceId }))
    );

    // Показываем все кнопки без пагинации
    const getCurrentPageButtons = () => {
        return allButtons;
    };

    // Рендер компактных кнопок
    return (
        <div className={cn('chat-buttons-compact', compactMode, className)}>
            <div ref={containerRef} className="chat-buttons-compact-grid">
                {getCurrentPageButtons().map((button) => {
                    const Icon = iconMap[button.icon] || Square;
                    const buttonKey = button.serviceId ? `${button.serviceId}-${button.id}` : button.id;
                    const isActive = activeButtonId === buttonKey;

                    return (
                        <button
                            key={buttonKey}
                            type="button"
                            onClick={() => onClick(button, button.serviceId)}
                            className={cn(
                                'chat-button-compact',
                                isActive && 'active',
                                button.disabled && 'disabled'
                            )}
                            title={button.description}
                            disabled={button.disabled}
                        >
                            <Icon className="chat-button-icon" />
                            <span className="chat-button-label">{button.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatButtons;
