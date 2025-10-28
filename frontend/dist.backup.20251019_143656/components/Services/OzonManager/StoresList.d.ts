import React from 'react';
import { Store } from './types';
interface StoresListProps {
    stores: Store[];
    onAddStore: () => void;
    onEditStore: (store: Store) => void;
    onDeleteStore: (storeName: string) => void;
    onRefresh: () => void;
    onTestConnection: (storeName: string) => void;
    isLoading: boolean;
}
/**
 * Список магазинов с таблицей
 * Воспроизводит функционал из Python gui.py (строки 761-792)
 */
export declare const StoresList: React.FC<StoresListProps>;
export {};
//# sourceMappingURL=StoresList.d.ts.map