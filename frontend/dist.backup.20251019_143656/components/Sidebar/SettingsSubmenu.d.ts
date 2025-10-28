import { type FC } from 'react';
interface SettingsSubmenuProps {
    isVisible: boolean;
    isCollapsed: boolean;
    onClose: () => void;
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}
export declare const SettingsSubmenu: FC<SettingsSubmenuProps>;
export {};
//# sourceMappingURL=SettingsSubmenu.d.ts.map