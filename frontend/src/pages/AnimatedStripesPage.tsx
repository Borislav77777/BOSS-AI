import { AnimatedStripesDemo } from '@/components/AnimatedStripes';
import React from 'react';
import './AnimatedStripesPage.css';

/**
 * СТРАНИЦА ДЕМОНСТРАЦИИ ГЕНЕРАТОРА АНИМИРОВАННЫХ ПОЛОСОК
 *
 * Полноэкранная демонстрация революционной системы генерации полосок
 */

const AnimatedStripesPage: React.FC = () => {
    return (
        <div className="animated-stripes-page">
            <AnimatedStripesDemo />
        </div>
    );
};

export default AnimatedStripesPage;
