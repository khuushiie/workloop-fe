import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export interface InputProps {
  type?: 'text' | 'email' | 'number' | 'password' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  autoFocus?: boolean;
  autoComplete?: string;
  readOnly?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onChange?: (value: string | number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  defaultValue,
  placeholder = '',
  label,
  disabled = false,
  loading = false,
  clearable = false,
  size = 'md',
  className = '',
  error,
  helperText,
  required = false,
  maxLength,
  min,
  max,
  step,
  autoFocus = false,
  autoComplete,
  readOnly = false,
  leftIcon,
  rightIcon,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onEnter,
}) => {
  const [internalValue, setInternalValue] = useState<string | number>(value ?? defaultValue ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      type === 'number'
        ? e.target.value === ''
          ? ''
          : Number(e.target.value)
        : e.target.value;
    // Controlled: parent owns `value` (e.g. sanitized). Do not mirror raw input locally or
    // invalid characters can flash / stick until the parent re-renders.
    if (value !== undefined) {
      onChange?.(newValue);
      return;
    }
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = '';
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    inputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      e.preventDefault();
      onEnter();
    }
    onKeyDown?.(e);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  // Check if input has value
  const hasValue = internalValue !== '' && internalValue !== null && internalValue !== undefined;

  // Check if should show clear button
  const showClear = clearable && hasValue && !disabled && !loading && !readOnly;

  // Check if should show password toggle
  const showPasswordToggle = type === 'password' && !disabled && !loading;

  // Check if has right side content
  const hasRightContent = showClear || showPasswordToggle || rightIcon || loading;

  // Padding classes based on icons
  const getPaddingClasses = () => {
    if (leftIcon && hasRightContent) {
      return size === 'sm' ? 'pl-8 pr-8' : size === 'md' ? 'pl-10 pr-10' : 'pl-12 pr-12';
    } else if (leftIcon) {
      return size === 'sm' ? 'pl-8 pr-2' : size === 'md' ? 'pl-10 pr-3' : 'pl-12 pr-4';
    } else if (hasRightContent) {
      return size === 'sm' ? 'pl-2 pr-8' : size === 'md' ? 'pl-3 pr-10' : 'pl-4 pr-12';
    } else {
      return size === 'sm' ? 'px-2' : size === 'md' ? 'px-3' : 'px-4';
    }
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  // Determine input type (for password toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type={inputType}
          value={internalValue}
          defaultValue={defaultValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={onKeyUp}
          placeholder={placeholder}
          disabled={disabled || loading}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          className={`
            w-full rounded-lg border transition-all duration-200 placeholder:text-slate-400
            ${sizeClasses[size]} ${getPaddingClasses()}
            ${isFocused
              ? 'border-primary-500 ring-2 ring-primary-500/20 ring-offset-1'
              : 'border-slate-200 hover:border-slate-300'
            }
            ${disabled || loading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white text-slate-900'
            }
            ${error
              ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
              : 'focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
            }
          `}
        />

        {/* Right Icons Container */}
        {(showClear || showPasswordToggle || rightIcon || loading) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Loading Spinner */}
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
            )}

            {/* Clear Button */}
            {showClear && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                tabIndex={-1}
              >
                <X size={iconSizes[size]} className="text-slate-400" />
              </button>
            )}

            {/* Password Toggle */}
            {showPasswordToggle && !loading && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={iconSizes[size]} className="text-slate-400" />
                ) : (
                  <Eye size={iconSizes[size]} className="text-slate-400" />
                )}
              </button>
            )}

            {/* Right Icon */}
            {rightIcon && !loading && !showClear && !showPasswordToggle && (
              <div className="text-slate-400">
                {rightIcon}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      <div className="mt-1 flex justify-between">
        {error ? (
          <div className="text-xs text-red-600">{error}</div>
        ) : helperText ? (
          <div className="text-xs text-slate-500">{helperText}</div>
        ) : <div />}
      </div>
    </div>
  );
};

export default Input;

