/**
 * Компонент регулировщика высоты поля ввода чата
 */

import React from 'react';

interface ChatInputResizerProps {
    onResize?: (e: React.MouseEvent) => void;
}

export const ChatInputResizer: React.FC<ChatInputResizerProps> = ({ onResize }) => {
    return (
        <div
            className="select-none cursor-row-resize h-1 w-full relative z-50 pointer-events-auto m-0 p-0 chat-resize-handle"
            onMouseDown={onResize}
            title="Изменить высоту поля ввода"
        >
            {/* Убираем видимую градиентную полоску - регулировщик невидим */}
        </div>
    );
};
