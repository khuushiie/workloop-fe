import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

/** Single option value (string or number) */
export type SelectOptionValue = string | number;

/** Selected value: single value or array for multiple mode */
export type SelectValue = SelectOptionValue | SelectOptionValue[];

export interface SelectOption {
  value: SelectOptionValue;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: SelectValue;
  defaultValue?: SelectValue;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dropdownClassName?: string;
  error?: string;
  required?: boolean;
  onChange?: (value: SelectValue, option?: SelectOption | SelectOption[]) => void;
  onSearch?: (searchTerm: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
  maxDropdownHeight?: number;
  position?: 'auto' | 'top' | 'bottom';
}
 
const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue = "",
  placeholder = 'Select an option...',
  label,
  id,
  disabled = false,
  loading = false,
  clearable = true,
  searchable = false,
  multiple = false,
  size = 'md',
  className = '',
  dropdownClassName = '',
  position="bottom",
  error,
  required = false,
  onChange,
  onSearch,
  onFocus,
  onBlur,
  renderOption,
  maxDropdownHeight = 300,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? (multiple ? [] : ''));
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Update internal value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
 
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
 
  // Filter options based on search term
  const filteredOptions = options?.filter(option =>
    String(option?.label || "").toLowerCase()?.includes(searchTerm?.toLowerCase())
  );
 
  // Get selected options for display
  const getSelectedOptions = (): SelectOption[] => {
    if (multiple) {
      const values = Array.isArray(internalValue) ? internalValue : [];
      return options?.filter(option => values.includes(option?.value));
    } else {
      return options?.filter(option => option?.value === internalValue);
    }
  };
 
  const selectedOptions = getSelectedOptions();
 
  // Handle option selection
  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;
 
    let newValue: SelectValue;
    let newSelectedOptions: SelectOption | SelectOption[];
 
    if (multiple) {
      const currentValues = Array.isArray(internalValue) ? internalValue : [];
      if (currentValues.includes(option.value)) {
        newValue = currentValues.filter(v => v !== option.value);
        newSelectedOptions = selectedOptions.filter(o => o.value !== option.value);
      } else {
        newValue = [...currentValues, option.value];
        newSelectedOptions = [...selectedOptions, option];
      }
    } else {
      newValue = option.value;
      newSelectedOptions = option;
      setIsOpen(false);
    }
 
    setInternalValue(newValue);
    onChange?.(newValue, newSelectedOptions);
    setSearchTerm('');
  };
 
  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = multiple ? [] : '';
    setInternalValue(newValue);
    onChange?.(newValue, multiple ? [] : undefined);
  };
 
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch?.(term);
  };
 
  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm px-2',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4',
  };
 
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };
 
  // Check if option is selected
  const isOptionSelected = (option: SelectOption): boolean => {
    if (multiple) {
      const values = Array.isArray(internalValue) ? internalValue : [];
      return values.includes(option.value);
    }
    return option.value === internalValue;
  };
 
  // Render display value
  const renderDisplayValue = () => {
    if (selectedOptions.length === 0) {
      return <span className="text-slate-500">{placeholder}</span>;
    }
 
    if (multiple) {
      if (selectedOptions.length === 1) {
        return selectedOptions[0].label;
      }
      return `${selectedOptions.length} selected`;
    }
 
    return selectedOptions[0]?.label;
  };
 
  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {/* Select Button */}
      <button
        type="button"
        id={id}
        disabled={disabled || loading}
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(!isOpen);
            if (!isOpen) onFocus?.();
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            if (!selectRef.current?.contains(document.activeElement)) {
              onBlur?.();
            }
            
          }, 120);
        }}
        className={`
          w-full flex items-center justify-between rounded-lg border transition-all duration-200
          ${sizeClasses[size]}
          ${ isOpen
              ? 'border-primary-500 ring-opacity-50'
              : 'border-slate-300 hover:border-slate-400'
          }
          ${disabled || loading
            ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
            : 'bg-white text-slate-900 cursor-pointer'
          }
          focus:ring-1 focus:ring-primary-500 focus:border-primary-500
        `}
      >
        <div className="flex-1 text-left truncate">
          {renderDisplayValue()}
        </div>
       
        <div className="flex items-center gap-1 ml-2">
          {clearable && selectedOptions.length > 0 && !disabled && !loading && internalValue !== defaultValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X size={iconSizes[size]} className="text-slate-400" />
            </button>
          )}
         
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
          ) : (
            <ChevronDown
              size={iconSizes[size]}
              className={`text-slate-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          )}
        </div>
      </button>
 
      {/* Dropdown */}
      {isOpen && !disabled && !loading && (
       <div
  ref={dropdownRef}
  className={`overflow-hidden
    absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-soft
    ${position === 'top' ? 'bottom-full mb-1' : 'mt-1'}
    ${dropdownClassName}
  `}
  style={{ maxHeight: maxDropdownHeight }}
>
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search options..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}
 
          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 text-center">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = isOptionSelected(option);
               
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => handleOptionClick(option)}
                    className={`
                      w-full px-3 py-2 text-left text-sm transition-colors duration-150
                      ${option.disabled
                        ? 'text-slate-400 cursor-not-allowed'
                        : isSelected
                          ? 'bg-primary-50 text-primary-900'
                          : 'text-slate-900 hover:bg-slate-50'
                      }
                      flex items-center justify-between
                    `}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex items-center gap-2">
                        {option.icon && <span>{option.icon}</span>}
                        <div>
                          <div>{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-slate-500">{option.description}</div>
                          )}
                        </div>
                      </div>
                    )}
                   
                    {isSelected && (
                      <Check size={16} className="text-primary-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
 
      {/* Error Message */}
      {error && (
        <div className="mt-1 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
 
export default Select;