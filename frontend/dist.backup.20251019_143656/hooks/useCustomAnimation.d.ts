interface AnimationVariants {
    initial: Record<string, any>;
    animate: Record<string, any>;
    exit?: Record<string, any>;
}
/**
 * Хук для создания кастомных анимаций
 */
export declare const useCustomAnimation: (variant: string, direction: string, delay?: number, duration?: number) => {
    isVisible: any;
    variants: AnimationVariants;
    motionProps: {
        initial: string;
        animate: string;
        variants: AnimationVariants;
        transition: {
            duration: number;
            ease: number[];
        };
    };
};
export {};
//# sourceMappingURL=useCustomAnimation.d.ts.map