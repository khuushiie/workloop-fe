import React from 'react';
import { cn } from '../../../../utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;
  /**
   * Default checked state for uncontrolled usage
   */
  defaultChecked?: boolean;
  /**
   * Callback when checkbox state changes
   */
  onChange?: (checked: boolean) => void;
  /**
   * Label text to display next to checkbox
   */
  label?: string;
  /**
   * Optional description text below label
   */
  description?: string;
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;
  /**
   * Size of the checkbox
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show error state
   */
  error?: boolean;
  /**
   * Error message to display
   */
  errorMessage?: string;
  /**
   * Additional class names for the container
   */
  className?: string;
  /**
   * Additional class names for the checkbox
   */
  checkboxClassName?: string;
  /**
   * ID for the checkbox input
   */
  id?: string;
  /**
   * Name attribute for the checkbox
   */
  name?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  error = false,
  errorMessage,
  className,
  checkboxClassName,
  id,
  name,
  required = false,
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
  
  // Use controlled or uncontrolled value
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = e.target.checked;
    
    // Update internal state for uncontrolled usage
    if (checked === undefined) {
      setInternalChecked(newValue);
    }
    
    onChange?.(newValue);
  };

  // Handle click to prevent scroll behavior
  const handleClick = (e: React.MouseEvent) => {
    // Prevent the default scroll behavior when clicking the checkbox
    e.preventDefault();
    if (disabled) return;
    
    const newValue = !isChecked;
    
    // Update internal state for uncontrolled usage
    if (checked === undefined) {
      setInternalChecked(newValue);
    }
    
    onChange?.(newValue);
  };

  // Size classes for the checkbox
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  };

  // Label text size classes
  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('inline-flex flex-col', className)}>
      <label
        className={cn(
          'inline-flex items-center gap-[7px] cursor-pointer group select-none pl-[2px]',
          disabled && 'cursor-not-allowed opacity-60'
        )}
        onClick={handleClick}
      >
        {/* Hidden native checkbox for accessibility */}
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
        />

        {/* Custom checkbox - using isChecked state directly for reliable styling */}
        <span
          className={cn(
            'relative flex-shrink-0 flex items-center justify-center',
            'rounded border-2 transition-all duration-150',
            sizeClasses[size],
            // Checked vs unchecked state
            isChecked
              ? 'bg-primary-600 border-primary-600'
              : 'border-slate-300 bg-white group-hover:border-primary-400',
            // Focus state
            'focus-within:ring-2 focus-within:ring-primary-200 focus-within:ring-offset-1',
            // Error state
            error && (isChecked ? 'bg-red-600 border-red-600' : 'border-red-500'),
            // Disabled state
            disabled && (isChecked ? 'bg-slate-400 border-slate-400' : 'bg-slate-100 border-slate-200'),
            checkboxClassName
          )}
        >
          {/* Check icon - show when checked */}
          <Check
            className={cn(
              iconSizeClasses[size],
              'text-white transition-opacity duration-150',
              isChecked ? 'opacity-100' : 'opacity-0'
            )}
            strokeWidth={3}
          />
        </span>

        {/* Label and description */}
        {(label || description) && (
          <span className="flex flex-col">
            {label && (
              <span
                className={cn(
                  labelSizeClasses[size],
                  'text-slate-700 font-normal',
                  'group-hover:text-slate-900 transition-colors',
                  disabled && 'text-slate-500'
                )}
              >
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500 mt-0.5">
                {description}
              </span>
            )}
          </span>
        )}
      </label>

      {/* Error message */}
      {errorMessage && (
        <span
          id={id ? `${id}-error` : undefined}
          className="text-xs text-red-600 mt-1 ml-6"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default Checkbox;
