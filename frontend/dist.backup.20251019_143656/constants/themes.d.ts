/**
 * Константы для тем и цветов
 */
export declare const THEMES: {
    readonly AVAILABLE: {
        readonly DARK: "dark";
        readonly LIGHT: "light";
        readonly CUSTOM: "custom";
    };
    readonly FONT_SIZES: {
        readonly SMALL: "small";
        readonly MEDIUM: "medium";
        readonly LARGE: "large";
    };
    readonly COLORS: {
        readonly MOCHA_MOUSE: "#8B4513";
        readonly MOCHA_MOUSE_LIGHT: "#A0522D";
        readonly MOCHA_MOUSE_DARK: "#5D2F0A";
        readonly NEON_GREEN: "#A0522D";
        readonly NEON_PURPLE: "#d946ef";
        readonly NEON_ORANGE: "#f59e0b";
        readonly SUCCESS: "#10b981";
        readonly WARNING: "#f59e0b";
        readonly ERROR: "#ef4444";
        readonly INFO: "#000000";
    };
    readonly CSS_VARIABLES: {
        readonly PRIMARY: "--primary";
        readonly BACKGROUND: "--background";
        readonly SURFACE: "--surface";
        readonly TEXT: "--text";
        readonly TEXT_SECONDARY: "--text-secondary";
        readonly BORDER: "--border";
    };
    readonly ANIMATIONS: {
        readonly ENABLED: "on";
        readonly DISABLED: "off";
    };
};
export type ThemeConstants = typeof THEMES;
//# sourceMappingURL=themes.d.ts.map