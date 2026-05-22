import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface AccordionWrapperProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  error?: string;
  badge?: React.ReactNode;
}

const AccordionWrapper: React.FC<AccordionWrapperProps> = ({
  title,
  subtitle,
  icon,
  isOpen,
  onToggle,
  children,
  error,
  badge,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border transition-all duration-200 ',
        error ? 'border-red-300' : 'border-slate-200',
        isOpen && 'shadow-soft'
      )}
    >
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left ',
          'hover:bg-slate-50 transition-colors rounded-lg',
          isOpen && 'border-b border-slate-100'
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3  p-1">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary-50 rounded-lg text-primary-600 ">
              {icon}
            </div>
          )}
          <div className="flex flex-col flex-center pt-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-0">{title}</h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 mb-2">{subtitle}</p>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 pt-3">{children}</div>
      )}
    </div>
  );
};

export default AccordionWrapper;
