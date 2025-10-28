import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import React, { memo, useEffect, useState } from 'react';
/**
 * Индикатор прогресса для операций
 */
export const ProgressIndicator = memo(({ isVisible, message, type, duration = 3000, onComplete, className = '' }) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                onComplete?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onComplete]);
    if (!show)
        return null;
    const getIcon = () => {
        switch (type) {
            case 'loading':
                return _jsx(Loader2, { className: "w-5 h-5 animate-spin text-text" });
            case 'success':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'error':
                return _jsx(XCircle, { className: "w-5 h-5 text-red-500" });
        }
    };
    const getBackgroundColor = () => {
        switch (type) {
            case 'loading':
                return 'bg-black/10 border-black/20';
            case 'success':
                return 'bg-green-500/10 border-green-500/20';
            case 'error':
                return 'bg-red-500/10 border-red-500/20';
        }
    };
    return (_jsxs("div", { className: cn("fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm", getBackgroundColor(), className), children: [getIcon(), _jsx("span", { className: "text-sm font-medium text-primary", children: message })] }));
});
ProgressIndicator.displayName = 'ProgressIndicator';
//# sourceMappingURL=ProgressIndicator.js.map