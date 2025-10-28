import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
/**
 * Компонент официального логотипа OpenAI
 * Использует официальный логотип "Blossom" с CDN OpenAI
 * Источник: https://images.ctfassets.net/kftzwdyauwt9/3M8rPrJsENQL5tjaDzo6SL/f0f85c8e27090123c767ac3c8237b401/Blossom_Dark.svg
 */
export const OpenAILogo = ({ className = '', size = 24, variant = 'dark' }) => {
    const logoSrc = variant === 'dark'
        ? 'https://images.ctfassets.net/kftzwdyauwt9/3M8rPrJsENQL5tjaDzo6SL/f0f85c8e27090123c767ac3c8237b401/Blossom_Dark.svg'
        : 'https://images.ctfassets.net/kftzwdyauwt9/3M8rPrJsENQL5tjaDzo6SL/f0f85c8e27090123c767ac3c8237b401/Blossom_Light.svg';
    return (_jsx("img", { src: logoSrc, alt: "OpenAI Logo", width: size, height: size, className: className, style: {
            width: `${size}px`,
            height: `${size}px`,
            display: 'block'
        } }));
};
export default OpenAILogo;
//# sourceMappingURL=OpenAILogo.js.map