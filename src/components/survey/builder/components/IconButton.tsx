import React from 'react';
import { cn } from '../../../../utils/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'default' | 'primary' | 'danger' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  'aria-label': string;
}

const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'p-0.5',
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  // Variant classes
  const variantClasses = {
    ghost: cn(
      'text-slate-400 hover:text-slate-600',
      'hover:bg-slate-100 active:bg-slate-200',
      'focus:ring-slate-200'
    ),
    default: cn(
      'text-slate-600 hover:text-slate-800',
      'bg-white border border-slate-200',
      'hover:bg-slate-50 hover:border-slate-300',
      'focus:ring-slate-200'
    ),
    primary: cn(
      'text-primary-600 hover:text-primary-700',
      'hover:bg-primary-50 active:bg-primary-100',
      'focus:ring-primary-200'
    ),
    danger: cn(
      'text-slate-400 hover:text-red-600',
      'hover:bg-red-50 active:bg-red-100',
      'focus:ring-red-200'
    ),
    secondary: cn(
      'text-slate-500 hover:text-slate-700',
      'bg-slate-100 hover:bg-slate-200',
      'focus:ring-slate-200'
    ),
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'rounded-md transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        // Size
        sizeClasses[size],
        // Variant
        variantClasses[variant],
        // Disabled state
        (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...rest}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
};

export default IconButton;
