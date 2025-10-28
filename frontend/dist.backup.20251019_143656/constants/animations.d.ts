/**
 * Константы для анимаций и переходов
 */
export declare const ANIMATIONS: {
    readonly DURATION: {
        readonly FAST: 150;
        readonly NORMAL: 300;
        readonly SLOW: 500;
        readonly VERY_SLOW: 800;
    };
    readonly THROTTLE: {
        readonly UPDATE_THROTTLE: 16;
        readonly RESIZE_THROTTLE: 100;
        readonly SCROLL_THROTTLE: 16;
    };
    readonly EASING: {
        readonly EASE_OUT: readonly [0.25, 0.46, 0.45, 0.94];
        readonly EASE_IN: readonly [0.55, 0.055, 0.675, 0.19];
        readonly EASE_IN_OUT: readonly [0.645, 0.045, 0.355, 1];
        readonly BOUNCE: readonly [0.68, -0.55, 0.265, 1.55];
    };
    readonly DELAY: {
        readonly STAGGER: 100;
        readonly SEQUENTIAL: 200;
        readonly CASCADE: 50;
    };
    readonly LOADING: {
        readonly SPINNER_DURATION: 1000;
        readonly PULSE_DURATION: 1500;
        readonly FADE_DURATION: 300;
    };
    readonly TRANSITIONS: {
        readonly FADE_IN: {
            readonly duration: 300;
            readonly ease: readonly [0.25, 0.46, 0.45, 0.94];
        };
        readonly SLIDE_UP: {
            readonly duration: 400;
            readonly ease: readonly [0.25, 0.46, 0.45, 0.94];
        };
        readonly SCALE_IN: {
            readonly duration: 250;
            readonly ease: readonly [0.68, -0.55, 0.265, 1.55];
        };
    };
};
export type AnimationConstants = typeof ANIMATIONS;
//# sourceMappingURL=animations.d.ts.map