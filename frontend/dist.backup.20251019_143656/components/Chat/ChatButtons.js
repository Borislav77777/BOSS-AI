import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { Bot, Camera, Edit3, Eye, EyeOff, FileText, FileText as FileTextIcon, FolderOpen, Grid, Languages, MessageCircle, Mic, Paperclip, Search, Send, Settings, Smile, Square, Upload, Wand2, Zap } from 'lucide-react';
import React, { useRef } from 'react';
// Локальная карта безопасных иконок по имени
const iconMap = {
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
};
/**
 * Компактный компонент кнопок чата с современным дизайном
 * Оптимизирован для минимального HTML и максимальной функциональности
 */
export const ChatButtons = ({ buttons, groups, onClick, className, activeButtonId, compactMode = 'normal' }) => {
    const containerRef = useRef(null);
    const hasFlat = Array.isArray(buttons) && buttons.length > 0;
    const hasGroups = Array.isArray(groups) && groups.length > 0;
    if (!hasFlat && !hasGroups)
        return null;
    // Получаем все кнопки для пагинации
    const allButtons = hasFlat ? buttons : groups.flatMap(group => group.buttons.map(button => ({ ...button, serviceId: group.serviceId })));
    // Показываем все кнопки без пагинации
    const getCurrentPageButtons = () => {
        return allButtons;
    };
    // Рендер компактных кнопок
    return (_jsx("div", { className: cn('chat-buttons-compact', compactMode, className), children: _jsx("div", { ref: containerRef, className: "chat-buttons-compact-grid", children: getCurrentPageButtons().map((button) => {
                const Icon = iconMap[button.icon] || Square;
                const buttonKey = button.serviceId ? `${button.serviceId}-${button.id}` : button.id;
                const isActive = activeButtonId === buttonKey;
                return (_jsxs("button", { type: "button", onClick: () => onClick(button, button.serviceId), className: cn('chat-button-compact', isActive && 'active', button.disabled && 'disabled'), title: button.description, disabled: button.disabled, children: [_jsx(Icon, { className: "chat-button-icon" }), _jsx("span", { className: "chat-button-label", children: button.name })] }, buttonKey));
            }) }) }));
};
export default ChatButtons;
//# sourceMappingURL=ChatButtons.js.map