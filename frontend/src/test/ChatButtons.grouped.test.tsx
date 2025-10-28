import { ChatButtons } from '@/components/Chat/ChatButtons';
import type { ChatButton } from '@/types/services';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('ChatButtons (grouped mode)', () => {
    beforeEach(() => {
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('рендерит группы по сервисам, показывает заголовок и иконку сервиса', () => {
        const groups = [
            {
                serviceId: 'svc1',
                serviceName: 'Service One',
                serviceIcon: 'Bot',
                buttons: [
                    { id: 'b1', name: 'Run', icon: 'Zap', description: 'd', action: 'run', isEnabled: true },
                ] as ChatButton[],
            },
            {
                serviceId: 'svc2',
                serviceName: 'Service Two',
                serviceIcon: 'Settings',
                buttons: [
                    { id: 'b2', name: 'Edit', icon: 'Edit3', description: 'd', action: 'edit', isEnabled: true },
                ] as ChatButton[],
            },
        ];

        const onClick = vi.fn();
        render(<ChatButtons groups={groups} onClick={onClick} />);

        expect(screen.getByText('Service One')).toBeInTheDocument();
        expect(screen.getByText('Service Two')).toBeInTheDocument();
        // Кнопки внутри групп
        expect(screen.getByText('Run')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('пробрасывает onClick(button, serviceId) при клике по кнопке в группе', () => {
        const button: ChatButton = { id: 'b1', name: 'Run', icon: 'Zap', description: 'd', action: 'run', isEnabled: true };
        const groups = [
            {
                serviceId: 'svc1',
                serviceName: 'Service One',
                serviceIcon: 'Bot',
                buttons: [button],
            },
        ];

        const onClick = vi.fn();
        render(<ChatButtons groups={groups} onClick={onClick} />);

        fireEvent.click(screen.getByText('Run'));
        expect(onClick).toHaveBeenCalledWith(button, 'svc1');
    });
});


describe('ChatButtons grouped rendering', () => {
    beforeEach(() => {
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('renders service groups and triggers onClick with serviceId', () => {
        const groups = [
            {
                serviceId: 'svc-1',
                serviceName: 'Service One',
                serviceIcon: 'Zap',
                buttons: [
                    { id: 'b1', name: 'Btn1', icon: 'Zap', description: '', action: 'b1', isEnabled: true } as ChatButton,
                ],
            },
        ];

        const onClick = vi.fn();
        render(<ChatButtons groups={groups as any} onClick={onClick} />);

        expect(screen.getByText('Service One')).toBeInTheDocument();
        const btn = screen.getByText('Btn1');
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'b1' }), 'svc-1');
    });
});
