import React from 'react';
import { Plus, FileText, AlignLeft, Circle, CheckSquare, Star, Calendar, Hash } from 'lucide-react';
import { QuestionType } from '../../types';
import { QuestionTypeButton } from './';
import { cn } from '../../../../utils/cn';

interface AddQuestionTooltipProps {
  onSelect: (type: QuestionType) => void;
  isEmpty?: boolean;
}

interface QuestionTypeOption {
  type: QuestionType;
  label: string;
  icon: React.ReactNode;
}

const questionTypeOptions: QuestionTypeOption[] = [
  {
    type: 'short_text',
    label: 'Short',
    icon: <FileText />,
  },
  {
    type: 'long_text',
    label: 'Long',
    icon: <AlignLeft />,
  },
  {
    type: 'mcq',
    label: 'MCQ',
    icon: <Circle />,
  },
  {
    type: 'checkbox',
    label: 'Check',
    icon: <CheckSquare />,
  },
  {
    type: 'rating',
    label: 'Rating',
    icon: <Star />,
  },
  {
    type: 'date',
    label: 'Date',
    icon: <Calendar />,
  },
  {
    type: 'number',
    label: 'Number',
    icon: <Hash />,
  },
];

const AddQuestionTooltip: React.FC<AddQuestionTooltipProps> = ({
  onSelect,
  isEmpty = false,
}) => {
  return (
    <div
      className={cn(
        'w-full border-2 border-dashed border-slate-300 rounded-lg',
        'bg-slate-50/50 py-4 sm:py-6 px-4',
        'flex flex-col items-center gap-3 sm:gap-4',
        'transition-colors hover:border-slate-400 hover:bg-slate-50'
      )}
    >
      {/* Empty State Message - only when no questions */}
      {isEmpty && (
        <p className="text-sm text-slate-500 text-center">
          No questions added yet. Click below to add your first question.
        </p>
      )}

      {/* Add Question Label */}
      <div className="flex items-center gap-1.5 text-primary-600">
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Add Question</span>
      </div>

      {/* Question Type Buttons - Using reusable QuestionTypeButton */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {questionTypeOptions.map((option) => (
          <QuestionTypeButton
            key={option.type}
            icon={option.icon}
            label={option.label}
            onClick={() => onSelect(option.type)}
            size="md"
          />
        ))}
      </div>
    </div>
  );
};

export default AddQuestionTooltip;
