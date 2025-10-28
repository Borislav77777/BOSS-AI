/**
 * Константы для макета и размеров панелей
 */
export declare const LAYOUT: {
    readonly SIDEBAR: {
        readonly DEFAULT_WIDTH: 280;
        readonly MIN_WIDTH: 200;
        readonly MAX_WIDTH: 500;
        readonly COLLAPSED_WIDTH: 60;
    };
    readonly CHAT: {
        readonly DEFAULT_WIDTH: 525;
        readonly MIN_WIDTH: 250;
        readonly MAX_WIDTH: 2000;
        readonly INPUT_DEFAULT_HEIGHT: 300;
        readonly INPUT_MIN_HEIGHT: 200;
        readonly INPUT_MAX_HEIGHT: 800;
    };
    readonly HEADER_HEIGHT: 60;
    readonly FOOTER_HEIGHT: 40;
    readonly SPACING: {
        readonly SMALL: 8;
        readonly MEDIUM: 16;
        readonly LARGE: 24;
        readonly XLARGE: 32;
    };
    readonly BREAKPOINTS: {
        readonly MOBILE: 768;
        readonly TABLET: 1024;
        readonly DESKTOP: 1280;
        readonly LARGE_DESKTOP: 1920;
    };
};
export type LayoutConstants = typeof LAYOUT;
//# sourceMappingURL=layout.d.ts.map