import { PlatformProvider } from '@/context/PlatformContext';
import { usePlatform } from '@/hooks/usePlatform';
import { act, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

const Consumer: React.FC = () => {
    const { state, dispatch } = usePlatform();
    (window as any).__platform = { state, dispatch };
    return null;
};

describe('Platform reducer: удаление проекта + Undo восстановление', () => {
    beforeEach(() => {
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('удаляет элемент и восстанавливает через событие workspace:restore', async () => {
        render(
            <PlatformProvider>
                <Consumer />
            </PlatformProvider>
        );

        const { dispatch } = (window as any).__platform as { state: any; dispatch: React.Dispatch<any> };

        const item = {
            id: 'p1',
            type: 'folder',
            title: 'Proj',
            size: 0,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        act(() => {
            dispatch({ type: 'CREATE_WORKSPACE_ITEM', payload: item });
        });
        expect(((window as any).__platform.state.workspaceItems as any[]).find((w) => w.id === 'p1')).toBeTruthy();

        act(() => {
            dispatch({ type: 'REMOVE_WORKSPACE_ITEM', payload: 'p1' });
        });
        expect(((window as any).__platform.state.workspaceItems as any[]).find((w) => w.id === 'p1')).toBeFalsy();

        // Восстановление через событие
        act(() => {
            window.dispatchEvent(new CustomEvent('workspace:restore', { detail: item }));
        });
        expect(((window as any).__platform.state.workspaceItems as any[]).find((w) => w.id === 'p1')).toBeTruthy();
    });
});
