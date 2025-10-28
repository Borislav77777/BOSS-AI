import { cn } from '@/utils/cn';
import { Check, ChevronDown } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SelectOption, SettingValue } from '../../../types';

interface CustomSelectProps {
    value: SettingValue;
    options: SelectOption[];
    onChange: (value: SettingValue) => void;
    placeholder?: string;
    positioning?: 'fixed' | 'absolute';
}

/**
 * Кастомный выпадающий список без синих полей
 * Унифицированный компонент для всех селектов в настройках
 */
export const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    options,
    onChange,
    placeholder = 'Выберите опцию',
    positioning = 'fixed'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Находим выбранную опцию
    useEffect(() => {
        const option = options.find(opt => opt.value === value);
        setSelectedOption(option || null);
    }, [value, options]);

    // Позиционирование dropdown
    const [dropdownPosition, setDropdownPosition] = useState<{
        top: number;
        left: number;
        width: number;
    }>({ top: 0, left: 0, width: 0 });

    const updateDropdownPosition = useCallback(() => {
        if (!buttonRef.current) return;

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
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
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

    const handleOptionClick = (option: SelectOption) => {
        setSelectedOption(option);
        onChange(option.value);
        setIsOpen(false);
    };

    const dropdown = isOpen ? (
        <div
            ref={dropdownRef}
            data-custom-select-dropdown
            className="absolute z-[9999] mt-1 w-full rounded-lg border bg-surface shadow-lg border-border animate-dropdown-fade-in"
            style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                position: positioning
            }}
        >
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {options.map((option) => (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => handleOptionClick(option)}
                        className={cn(
                            "flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-hover",
                            selectedOption?.value === option.value ? "bg-primary text-background" : "text-text-primary"
                        )}
                    >
                        <span className="text-sm font-medium">{option.label}</span>
                        {selectedOption?.value === option.value && (
                            <Check className="w-4 h-4" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    ) : null;

    return (
        <div className="custom-select-container relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex w-full items-center justify-between rounded-lg border bg-input-bg px-4 py-3 text-left transition-all duration-200 hover:border-border-active focus:outline-none focus:ring-2 focus:ring-primary/20 border-input-border",
                    isOpen && "border-border-active ring-2 ring-primary/20"
                )}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={cn(
                    "text-sm font-medium",
                    selectedOption ? "text-text-primary" : "text-input-placeholder"
                )}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200 text-text-secondary",
                    isOpen && "rotate-180"
                )} />
            </button>

            {positioning === 'fixed' ? createPortal(dropdown, document.body) : dropdown}
        </div>
    );
};
