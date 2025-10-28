import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { Check, ChevronDown } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
/**
 * Кастомный выпадающий список без синих полей
 * Унифицированный компонент для всех селектов в настройках
 */
export const CustomSelect = ({ value, options, onChange, placeholder = 'Выберите опцию', positioning = 'fixed' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    // Находим выбранную опцию
    useEffect(() => {
        const option = options.find(opt => opt.value === value);
        setSelectedOption(option || null);
    }, [value, options]);
    // Позиционирование dropdown
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const updateDropdownPosition = useCallback(() => {
        if (!buttonRef.current)
            return;
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const position = positioning === 'fixed' ? {
            top: buttonRect.bottom + window.scrollY,
            left: buttonRect.left + window.scrollX,
            width: buttonRect.width,
        } : {
            top: buttonRect.bottom,
            left: buttonRect.left,
            width: buttonRect.width,
        };
        setDropdownPosition(position);
    }, [positioning]);
    // Обновляем позицию при открытии dropdown
    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
        }
    }, [isOpen, updateDropdownPosition]);
    // Закрытие при клике вне компонента и обновление позиции при скролле
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            const container = buttonRef.current?.closest('.custom-select-container');
            const dropdown = document.querySelector('[data-custom-select-dropdown]');
            if (isOpen && container && !container.contains(target) && dropdown && !dropdown.contains(target)) {
                setIsOpen(false);
            }
        };
        const handleScroll = () => {
            if (isOpen) {
                updateDropdownPosition();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', updateDropdownPosition);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', updateDropdownPosition);
        };
    }, [isOpen, updateDropdownPosition]);
    const handleOptionClick = (option) => {
        setSelectedOption(option);
        onChange(option.value);
        setIsOpen(false);
    };
    const dropdown = isOpen ? (_jsx("div", { ref: dropdownRef, "data-custom-select-dropdown": true, className: "absolute z-[9999] mt-1 w-full rounded-lg border bg-surface shadow-lg border-border animate-dropdown-fade-in", style: {
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            position: positioning
        }, children: _jsx("div", { className: "max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent", children: options.map((option) => (_jsxs("button", { type: "button", onClick: () => handleOptionClick(option), className: cn("flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-hover", selectedOption?.value === option.value ? "bg-primary text-background" : "text-text-primary"), children: [_jsx("span", { className: "text-sm font-medium", children: option.label }), selectedOption?.value === option.value && (_jsx(Check, { className: "w-4 h-4" }))] }, String(option.value)))) }) })) : null;
    return (_jsxs("div", { className: "custom-select-container relative", children: [_jsxs("button", { ref: buttonRef, type: "button", onClick: () => setIsOpen(!isOpen), className: cn("flex w-full items-center justify-between rounded-lg border bg-input-bg px-4 py-3 text-left transition-all duration-200 hover:border-border-active focus:outline-none focus:ring-2 focus:ring-primary/20 border-input-border", isOpen && "border-border-active ring-2 ring-primary/20"), "aria-expanded": isOpen, "aria-haspopup": "listbox", children: [_jsx("span", { className: cn("text-sm font-medium", selectedOption ? "text-text-primary" : "text-input-placeholder"), children: selectedOption ? selectedOption.label : placeholder }), _jsx(ChevronDown, { className: cn("w-4 h-4 transition-transform duration-200 text-text-secondary", isOpen && "rotate-180") })] }), positioning === 'fixed' ? createPortal(dropdown, document.body) : dropdown] }));
};
//# sourceMappingURL=CustomSelect.js.map