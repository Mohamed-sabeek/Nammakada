import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, CaretUp, Check } from '@phosphor-icons/react';

const CustomSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder = "Select an option", 
    label, 
    icon,
    className = "" 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [placement, setPlacement] = useState('bottom');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    
    const containerRef = useRef(null);
    const listboxRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || null;

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle placement (above or below)
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            
            // Assume dropdown height might be around 250px
            const estimatedDropdownHeight = 250;

            if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
                setPlacement('top');
            } else {
                setPlacement('bottom');
            }
            
            // Find current index to focus
            const currentIndex = options.findIndex(opt => opt.value === value);
            setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
    }, [isOpen, options, value]);
    
    // Auto scroll focused item into view
    useEffect(() => {
        if (isOpen && listboxRef.current && focusedIndex >= 0) {
            const listbox = listboxRef.current;
            const focusedItem = listbox.children[focusedIndex];
            
            if (focusedItem) {
                const scrollBottom = listbox.scrollTop + listbox.clientHeight;
                const itemBottom = focusedItem.offsetTop + focusedItem.offsetHeight;
                
                if (itemBottom > scrollBottom) {
                    listbox.scrollTop = itemBottom - listbox.clientHeight;
                } else if (focusedItem.offsetTop < listbox.scrollTop) {
                    listbox.scrollTop = focusedItem.offsetTop;
                }
            }
        }
    }, [focusedIndex, isOpen]);

    // Keyboard accessibility
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < options.length) {
                    onChange(options[focusedIndex].value);
                    setIsOpen(false);
                }
                break;
            case 'Escape':
            case 'Tab':
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            
            {/* Select Button */}
            <button
                type="button"
                className={`
                    w-full flex items-center justify-between px-4 py-2.5 
                    bg-white border text-left rounded-xl outline-none transition-all duration-200
                    ${isOpen ? 'border-green-500 ring-2 ring-green-100 shadow-sm' : 'border-[#E2E8E5] hover:border-gray-300'}
                `}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-[#647067] flex-shrink-0">{icon}</span>}
                    <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-[#17201B]'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                
                <span className="text-[#647067] flex-shrink-0 ml-2 transition-transform duration-200">
                    {isOpen ? <CaretUp size={18} weight="bold" /> : <CaretDown size={18} weight="bold" />}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className={`
                        absolute z-50 w-full bg-white border border-[#E2E8E5] 
                        rounded-[12px] shadow-lg overflow-hidden py-1
                        ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
                    `}
                >
                    <ul 
                        ref={listboxRef}
                        className="max-h-60 overflow-y-auto outline-none"
                        role="listbox"
                        tabIndex="-1"
                    >
                        {options.map((option, index) => {
                            const isSelected = value === option.value;
                            const isFocused = focusedIndex === index;
                            
                            return (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => handleOptionClick(option.value)}
                                    className={`
                                        flex items-center px-4 py-2.5 cursor-pointer transition-colors duration-150
                                        ${isSelected ? 'bg-[#DCFCE7] text-[#15803D]' : 'text-[#17201B]'}
                                        ${isFocused && !isSelected ? 'bg-[#F0FDF4] text-[#15803D]' : ''}
                                        ${!isFocused && !isSelected ? 'hover:bg-[#F0FDF4] hover:text-[#15803D]' : ''}
                                    `}
                                >
                                    <span className="flex-1 block truncate">
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <Check size={16} weight="bold" className="text-[#15803D] ml-2 flex-shrink-0" />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
