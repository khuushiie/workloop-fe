import React from 'react';
import { cn } from '../../../../utils/cn';

export interface RadioCardOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioCardGroupProps<T extends string = string> {
  /**
   * Name attribute for the radio group
   */
  name: string;
  /**
   * Currently selected value
   */
  value: T | null;
  /**
   * Radio options to display
   */
  options: RadioCardOption<T>[];
  /**
   * Callback when selection changes
   */
  onChange: (value: T) => void;
  /**
   * Label for the radio group
   */
  label?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Number of columns for the grid layout
   * @default 4
   */
  columns?: 1 | 2 | 3 | 4;
  /**
   * Whether the group is disabled
   */
  disabled?: boolean;
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * RadioCardGroup component - renders radio buttons as selectable cards
 * Ideal for selection options with labels and descriptions
 */
function RadioCardGroup<T extends string = string>({
  name,
  value,
  options,
  onChange,
  label,
  required = false,
  error,
  columns = 4,
  disabled = false,
  className,
}: RadioCardGroupProps<T>) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Radio Cards Grid */}
      <div className={cn('grid gap-3', columnClasses[columns])}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={cn(
                'relative flex flex-col p-3 border rounded-lg cursor-pointer transition-all',
                // Selected state
                isSelected
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                  : 'border-slate-200 hover:border-slate-300',
                // Disabled state
                isDisabled && 'opacity-50 cursor-not-allowed',
                // Error state
                error && !isSelected && 'border-red-200'
              )}
            >
              <div className="flex items-center gap-2">
                {/* Custom Radio Circle */}
                <span
                  className={cn(
                    'flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                    isSelected
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-slate-300 bg-white'
                  )}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>

                {/* Hidden native radio for accessibility */}
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => !isDisabled && onChange(option.value)}
                  disabled={isDisabled}
                  className="sr-only"
                />

                {/* Icon (optional) */}
                {option.icon && (
                  <span className="flex-shrink-0 text-slate-500">
                    {option.icon}
                  </span>
                )}

                {/* Label */}
                <span className="text-sm font-medium text-slate-900">
                  {option.label}
                </span>
              </div>

              {/* Description */}
              {option.description && (
                <p className="text-xs text-slate-500 mt-1 ml-6">
                  {option.description}
                </p>
              )}
            </label>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

export default RadioCardGroup;
