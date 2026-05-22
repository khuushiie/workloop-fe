import React from 'react';
import { Star } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { TakeSurveyQuestion } from '../../types';
import Input from '../../../common/Input';
import { TextArea } from '../../../common/TextArea';
import DatePicker from '../../../common/DatePicker';
import { cn } from '../../../../utils/cn';

dayjs.extend(utc);

interface AnswerInputProps {
  question: TakeSurveyQuestion;
  value: string | string[] | number | null;
  onChange: (value: string | string[] | number | null) => void;
  disabled?: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  switch (question.type) {
    case 'short_text':
      return (
        <ShortTextInput
          value={(value as string) || ''}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case 'long_text':
      return (
        <LongTextInput
          value={(value as string) || ''}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case 'mcq':
      return (
        <MCQInput
          options={question.options || []}
          value={(value as string) || ''}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case 'checkbox':
      return (
        <CheckboxInput
          options={question.options || []}
          value={(value as string[]) || []}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case 'rating':
      return (
        <RatingInput
          maxRating={question.maxRating || 5}
          value={(value as number) || 0}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <DateInput
          value={(value as string) || ''}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case 'number':
      return (
        <NumberInput
          value={(value as number) || ''}
          onChange={onChange}
          disabled={disabled}
        />
      );

    default:
      return null;
  }
};

interface ShortTextInputProps {
  value: string;
  onChange: (value: string | null) => void;
  disabled: boolean;
}

const ShortTextInput: React.FC<ShortTextInputProps> = ({ value, onChange, disabled }) => (
  <Input
    type="text"
    value={value}
    onChange={(val: string | number) => {
      const str = String(val);
      onChange(str.trim() === '' ? null : str);
    }}
    placeholder="Type your answer here..."
    disabled={disabled}
    maxLength={200}
    size="lg"
    className="w-full"
  />
);

interface LongTextInputProps {
  value: string;
  onChange: (value: string | null) => void;
  disabled: boolean;
}

const LongTextInput: React.FC<LongTextInputProps> = ({ value, onChange, disabled }) => (
  <TextArea
    value={value}
    onChange={(val: string) => onChange(val.trim() === '' ? null : val)}
    placeholder="Type your answer here..."
    disabled={disabled}
    maxLength={1000}
    minRows={5}
    className="w-full"
  />
);

interface MCQInputProps {
  options: { _id?: string; tempId: string; text: string }[];
  value: string;
  onChange: (value: string | null) => void;
  disabled: boolean;
}

const MCQInput: React.FC<MCQInputProps> = ({ options, value, onChange, disabled }) => {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const optionId = option._id || option.tempId;
        const isSelected = value === optionId;

        return (
          <label
            key={optionId}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
              isSelected
                ? 'border-primary-500 bg-primary-50 shadow-soft'
                : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 bg-white',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                isSelected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-slate-300 bg-white'
              )}
            >
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <span className={cn(
              'text-base',
              isSelected ? 'text-primary-900 font-medium' : 'text-slate-700'
            )}>
              {option.text}
            </span>
            <input
              type="radio"
              name="mcq-answer"
              value={optionId}
              checked={isSelected}
              onChange={() => !disabled && onChange(isSelected ? null : optionId)}
              disabled={disabled}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
};

interface CheckboxInputProps {
  options: { _id?: string; tempId: string; text: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({ options, value, onChange, disabled }) => {
  const handleToggle = (optionId: string) => {
    if (disabled) return;

    const newValue = value.includes(optionId)
      ? value.filter(v => v !== optionId)
      : [...value, optionId];

    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const optionId = option._id || option.tempId;
        const isChecked = value.includes(optionId);

        return (
          <label
            key={optionId}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
              isChecked
                ? 'border-primary-500 bg-primary-50 shadow-soft'
                : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 bg-white',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                isChecked
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-slate-300 bg-white'
              )}
            >
              {isChecked && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={cn(
              'text-base',
              isChecked ? 'text-primary-900 font-medium' : 'text-slate-700'
            )}>
              {option.text}
            </span>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleToggle(optionId)}
              disabled={disabled}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
};

interface RatingInputProps {
  maxRating: number;
  value: number;
  onChange: (value: number | null) => void;
  disabled: boolean;
}

const RatingInput: React.FC<RatingInputProps> = ({ maxRating, value, onChange, disabled }) => {
  const [hoverValue, setHoverValue] = React.useState(0);

  const handleClick = (rating: number) => {
    if (disabled) return;
    onChange(rating === value ? null : rating);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {Array.from({ length: maxRating }, (_, index) => {
          const rating = index + 1;
          const isFilled = rating <= (hoverValue || value);

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => !disabled && setHoverValue(rating)}
              onMouseLeave={() => setHoverValue(0)}
              disabled={disabled}
              className={cn(
                'p-1.5 transition-all rounded-lg',
                !disabled && 'hover:scale-110 hover:bg-yellow-50',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <Star
                className={cn(
                  'w-10 h-10 sm:w-12 sm:h-12 transition-colors',
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-300'
                )}
              />
            </button>
          );
        })}
      </div>
      {value > 0 && (
        <span className="text-base text-slate-600 font-medium">
          {value} out of {maxRating}
        </span>
      )}
    </div>
  );
};

interface DateInputProps {
  value: string;
  onChange: (value: string | null) => void;
  disabled: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, disabled }) => {
  const dateValue = value ? dayjs.utc(value).local() : null;

  const handleChange = (date: Dayjs | null) => {
    if (date) {
      onChange(date.utc().toISOString());
    } else {
      onChange(null);
    }
  };

  return (
    <div className="max-w-md">
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        placeholder="Select a date..."
        disabled={disabled}
        format="DD/MM/YYYY"
      />
    </div>
  );
};

interface NumberInputProps {
  value: number | string;
  onChange: (value: number | null) => void;
  disabled: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, disabled }) => (
  <div className="max-w-md">
    <Input
      type="number"
      value={value}
      onChange={(val: string | number) => {
        const str = String(val).trim();
        onChange(str === '' ? null : Number(val));
      }}
      placeholder="Enter a number..."
      disabled={disabled}
      size="lg"
      className="w-full"
    />
  </div>
);

export default AnswerInput;
