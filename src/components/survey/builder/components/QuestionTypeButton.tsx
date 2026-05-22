import React from 'react';
import { cn } from '../../../../utils/cn';

export interface QuestionTypeButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;

  isSelected?: boolean;

  disabled?: boolean;
  /**
   * Size variant
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

const QuestionTypeButton: React.FC<QuestionTypeButtonProps> = ({
  icon,
  label,
  onClick,
  isSelected = false,
  disabled = false,
  size = 'md',
  className,
  title,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 gap-0.5',
    md: 'w-14 h-14 sm:w-16 sm:h-16 gap-1 sm:gap-1.5',
    lg: 'w-18 h-18 sm:w-20 sm:h-20 gap-1.5 sm:gap-2',
  };

  const iconSizeClasses = {
    sm: '[&_svg]:w-4 [&_svg]:h-4',
    md: '[&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-6 sm:[&_svg]:h-6',
    lg: '[&_svg]:w-6 [&_svg]:h-6 sm:[&_svg]:w-7 sm:[&_svg]:h-7',
  };

  const labelSizeClasses = {
    sm: 'text-[9px] sm:text-[10px]',
    md: 'text-[10px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      className={cn(
        // Base styles
        'flex flex-col items-center justify-center',
        'rounded-lg border bg-white',
        'transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-1',
        'group',
        // Size
        sizeClasses[size],
        // Default state
        !isSelected && 'border-slate-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-soft',
        // Selected state
        isSelected && 'border-primary-500 bg-primary-50 ring-1 ring-primary-500',
        // Active state
        'active:scale-95',
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // Icon size
        iconSizeClasses[size],
        className
      )}
    >
      <span
        className={cn(
          'transition-colors',
          isSelected ? 'text-primary-600' : 'text-slate-500 group-hover:text-primary-600'
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          'font-medium transition-colors',
          labelSizeClasses[size],
          isSelected ? 'text-primary-700' : 'text-slate-600 group-hover:text-primary-700'
        )}
      >
        {label}
      </span>
    </button>
  );
};

export default QuestionTypeButton;
