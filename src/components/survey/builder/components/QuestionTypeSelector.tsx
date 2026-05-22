import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Type, AlignLeft, ListChecks, CheckSquare, Star } from 'lucide-react';
import { QuestionType } from '../../types';
import Button from '../../../common/Button';
import { cn } from '../../../../utils/cn';

interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
  disabled?: boolean;
}

interface QuestionTypeOption {
  type: QuestionType;
  label: string;
  icon: React.ReactNode;
}

const questionTypeOptions: QuestionTypeOption[] = [
  {
    type: 'short_text',
    label: 'Short Text',
    icon: <Type className="w-4 h-4" />,
  },
  {
    type: 'long_text',
    label: 'Long Text',
    icon: <AlignLeft className="w-4 h-4" />,
  },
  {
    type: 'mcq',
    label: 'MCQ',
    icon: <ListChecks className="w-4 h-4" />,
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: <CheckSquare className="w-4 h-4" />,
  },
  {
    type: 'rating',
    label: 'Rating',
    icon: <Star className="w-4 h-4" />,
  },
];

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = questionTypeOptions.find((opt) => opt.type === value);

  const handleSelect = (type: QuestionType) => {
    onChange(type);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <Button
        appearance="secondary"
        size="small"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        icon={<span className="text-slate-600">{selectedOption?.icon}</span>}
        className="!bg-white !border-slate-200 hover:!bg-slate-50 hover:!border-slate-300"
      >
        <span className="text-slate-700 hidden sm:inline">
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform ml-1',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 mt-1 z-50',
            'min-w-[160px] bg-white rounded-lg',
            'shadow-soft border border-slate-200',
            'py-1 animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {questionTypeOptions.map((option) => (
            <Button
              key={option.type}
              appearance="text"
              size="small"
              onClick={() => handleSelect(option.type)}
              icon={
                <span
                  className={cn(
                    'flex-shrink-0',
                    option.type === value ? 'text-primary-600' : 'text-slate-500'
                  )}
                >
                  {option.icon}
                </span>
              }
              className={cn(
                '!w-full !justify-start !px-3 !py-2 !rounded-none',
                option.type === value
                  ? '!bg-primary-50 !text-primary-700'
                  : '!text-slate-700 hover:!bg-slate-50'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionTypeSelector;
