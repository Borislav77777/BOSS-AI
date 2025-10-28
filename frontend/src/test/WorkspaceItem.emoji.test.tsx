import { WorkspaceItem } from '@/components/Workspace/WorkspaceItem';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const baseItem = {
    id: 'w1',
    type: 'folder',
    title: 'Проект 1',
    size: 0,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('WorkspaceItem emoji picker', () => {
    beforeEach(() => {
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('открывает пикер по клику и вызывает onItemAction(set-emoji:...) при выборе эмодзи', () => {
        const onItemClick = vi.fn();
        const onItemAction = vi.fn();
        const onItemRename = vi.fn();
        const onEditCancel = vi.fn();

        render(
            <WorkspaceItem
                item={baseItem as any}
                isSelected={false}
                isNew={false}
                isChecked={false}
                viewMode="grid"
                onItemClick={onItemClick}
                onItemAction={onItemAction}
                onItemRename={onItemRename}
                onEditCancel={onEditCancel}
                onDocumentCheck={vi.fn()}
            />
        );

        // Кнопка выбора эмодзи (по умолчанию бейдж 🏷️)
        const emojiBtn = screen.getByTitle('Выбрать эмодзи');
        fireEvent.click(emojiBtn);

        // После клика отображается меню эмодзи — возьмём, например, 🚀
        const rocket = screen.getByText('🚀');
        fireEvent.click(rocket);

        expect(onItemAction).toHaveBeenCalledWith('w1', expect.stringContaining('set-emoji:'));
    });
});
