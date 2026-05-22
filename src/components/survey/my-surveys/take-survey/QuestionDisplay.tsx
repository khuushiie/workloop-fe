import React from 'react';
import { TakeSurveyQuestion } from '../../types';
import AnswerInput from './AnswerInput';
import { cn } from '../../../../utils/cn';

interface QuestionDisplayProps {
  question: TakeSurveyQuestion;
  questionNumber: number;
  totalQuestions: number;
  value: string | string[] | number | null;
  onChange: (value: string | string[] | number | null) => void;
  disabled?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  totalQuestions,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 min-h-[400px]">
      {/* Question Number Badge */}
      <div className="mb-6">
        <span
          className={cn(
            'inline-flex items-center px-4 py-2 rounded-full',
            'text-sm font-semibold bg-primary-500 text-white'
          )}
        >
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question Text */}
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-8 leading-relaxed">
        {question.text}
        {question.isRequired && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </h2>

      {/* Answer Input */}
      <AnswerInput
        question={question}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default QuestionDisplay;
