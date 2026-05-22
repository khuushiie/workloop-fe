import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Type, AlignLeft, ListChecks, CheckSquare, Star, Calendar, Hash } from 'lucide-react';
import { SurveyQuestion, QuestionType, QUESTION_TYPE_CONFIG } from '../types';
import OptionsList from './components/OptionsList';
import RatingConfig from './components/RatingConfig';
import Checkbox from './components/Checkbox';
import IconButton from './components/IconButton';
import Input from '../../common/Input';
import { SelectOption } from '../../common/Select';
import { Select } from '../../common';
import { cn } from '../../../utils/cn';

interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

// Question type icons
const typeIcons: Record<QuestionType, React.ReactNode> = {
  short_text: <Type className="w-3.5 h-3.5" />,
  long_text: <AlignLeft className="w-3.5 h-3.5" />,
  mcq: <ListChecks className="w-3.5 h-3.5" />,
  checkbox: <CheckSquare className="w-3.5 h-3.5" />,
  rating: <Star className="w-3.5 h-3.5" />,
  date: <Calendar className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
};

// Question type options for select
const questionTypeOptions: SelectOption[] = Object.values(QUESTION_TYPE_CONFIG).map((config) => ({
  value: config.type,
  label: config.shortLabel,
  icon: typeIcons[config.type],
}));

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  readOnly = false,
}) => {
  // DnD sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get config with fallback to short_text if type is unknown
  const config = QUESTION_TYPE_CONFIG[question.type] || QUESTION_TYPE_CONFIG.short_text;

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`question-${question.tempId}`}
      className={cn(
        'bg-white border rounded-lg transition-all',
        isDragging
          ? 'shadow-soft border-primary-300 ring-2 ring-primary-100 z-50'
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Card Header - Simple design matching Figma */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Drag Handle */}
        {!readOnly && (
          <IconButton
            variant="ghost"
            size="xs"
            className="flex-shrink-0 cursor-grab touch-none"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </IconButton>
        )}

        {/* Question Number - Q1, Q2 format */}
        <span className="flex-shrink-0 text-sm font-semibold text-slate-700">
          Q{index + 1}
        </span>

        {/* Question Type Selector */}
        <Select
          options={questionTypeOptions}
          value={question.type}
          onChange={(value: string | number | (string | number)[]) => {
            const newType = value as QuestionType;
            const oldType = question.type;
            const newConfig = QUESTION_TYPE_CONFIG[newType];
            const oldConfig = QUESTION_TYPE_CONFIG[oldType];
            
            // Bug #6 Fix: Preserve options when switching between option-based types
            const updates: Partial<SurveyQuestion> = { type: newType };
            
            // If switching from non-option to option type, initialize options
            if (newConfig.hasOptions && !oldConfig.hasOptions) {
              updates.options = [
                { tempId: `opt-${Date.now()}-1`, text: '' },
                { tempId: `opt-${Date.now()}-2`, text: '' },
              ];
            }
            // If switching from option to non-option type, clear options
            else if (!newConfig.hasOptions && oldConfig.hasOptions) {
              updates.options = null;
            }
            // If both have options, preserve existing options
            
            onUpdate(updates);
          }}
          size="sm"
          clearable={false}
          className="!w-24 sm:!w-28 flex-shrink-0"
          disabled={readOnly}
          aria-label="Question type"
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Delete Button - hidden in read-only mode */}
        {!readOnly && (
          <IconButton
            variant="danger"
            size="sm"
            onClick={onDelete}
            aria-label="Delete question"
            className="flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      {/* Card Content */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
        {/* Question Text Input */}
        <Input
          value={question.text}
          onChange={(value: string | number) => onUpdate({ text: String(value) })}
          placeholder="Enter your question..."
          size="md"
          disabled={readOnly}
        />

        {/* Options for MCQ/Checkbox */}
        {config.hasOptions && (
          <OptionsList
            options={question.options || []}
            onChange={(options) => onUpdate({ options })}
            questionType={question.type}
            readOnly={readOnly}
          />
        )}

        {/* Rating Config */}
        {question.type === 'rating' && (
          <RatingConfig
            maxRating={question.maxRating || 5}
            onChange={(maxRating: number) => onUpdate({ maxRating })}
            readOnly={readOnly}
          />
        )}

        {/* Required Checkbox */}
        <Checkbox
          checked={question.isRequired}
          onChange={(checked) => onUpdate({ isRequired: checked })}
          label="Required"
          size="md"
          disabled={readOnly}
        />
      </div>
    </div>
  );
};

export default QuestionCard;
