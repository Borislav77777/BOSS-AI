/**
 * Утилиты для анимаций в стиле трендов 2025
 * Включает Framer Motion и React Spring анимации
 */
import { Transition, Variants } from 'framer-motion';
export declare const fadeInUp: Variants;
export declare const slideInLeft: Variants;
export declare const slideInRight: Variants;
export declare const scaleIn: Variants;
export declare const glassmorphismHover: Variants;
export declare const neumorphismHover: Variants;
export declare const staggerContainer: Variants;
export declare const staggerItem: Variants;
export declare const particleFloat: Variants;
export declare const gradientShift: Variants;
export declare const smoothTransition: Transition;
export declare const fastTransition: Transition;
export declare const slowTransition: Transition;
export declare const useMochaGlow: (isHovered: boolean) => any;
export declare const useNeonPulse: (isActive: boolean) => any;
export declare const useGlassShimmer: () => any;
export declare const createCustomVariants: (initial: Variants["initial"], animate: Variants["animate"], exit?: Variants["exit"]) => Variants;
export declare const modalBackdrop: Variants;
export declare const modalContent: Variants;
//# sourceMappingURL=animations.d.ts.map