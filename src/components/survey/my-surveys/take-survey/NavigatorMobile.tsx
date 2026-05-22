import React, { useState } from 'react';
import { Grid3X3, X, AlertTriangle } from 'lucide-react';
import { TakeSurveyQuestion, QuestionState } from '../../types';
import { cn } from '../../../../utils/cn';
const STATE_COLORS: Record<QuestionState, { bg: string; border: string; text: string }> = {
  answered: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
  },
  current: {
    bg: 'bg-primary-500',
    border: 'border-primary-500',
    text: 'text-white',
  },
  notVisited: {
    bg: 'bg-white',
    border: 'border-slate-300',
    text: 'text-slate-600',
  },
  notAnswered: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-800',
  },
};

interface NavigatorMobileProps {
  questions: TakeSurveyQuestion[];
  questionStates: Record<string, QuestionState>;
  currentIndex: number;
  answeredCount: number;
  requiredRemaining: number;
  onQuestionClick: (index: number) => void;
}

const NavigatorMobile: React.FC<NavigatorMobileProps> = ({
  questions,
  questionStates,
  currentIndex,
  answeredCount,
  requiredRemaining,
  onQuestionClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const totalQuestions = questions.length;

  const handleQuestionClick = (index: number) => {
    onQuestionClick(index);
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-40 lg:hidden',
          'w-14 h-14 rounded-full shadow-soft',
          'bg-primary-500 text-white',
          'flex items-center justify-center',
          'hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors'
        )}
        aria-label={`Open question navigator. ${requiredRemaining} required questions remaining`}
      >
        <Grid3X3 className="w-6 h-6" />
        {requiredRemaining > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {requiredRemaining}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 lg:hidden',
          'bg-white rounded-t-2xl shadow-soft-hover',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-semibold text-slate-900">Question Navigator</h3>
            <p className="text-sm text-slate-500">
              {answeredCount}/{totalQuestions} Answered
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {questions.map((question, index) => {
              const state = questionStates[question._id] || 'notVisited';
              const colors = STATE_COLORS[state];
              const isCurrent = index === currentIndex;

              return (
                <button
                  key={question._id}
                  onClick={() => handleQuestionClick(index)}
                  className={cn(
                    'relative w-full aspect-square rounded-lg border-2 flex items-center justify-center overflow-visible',
                    'text-sm font-medium transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    colors.bg,
                    colors.border,
                    colors.text,
                    isCurrent && 'ring-2 ring-primary-500 ring-offset-1'
                  )}
                  aria-label={`Question ${index + 1}${question.isRequired ? ' (Required)' : ''} - ${state}`}
                  aria-current={isCurrent ? 'true' : undefined}
                >
                  {index + 1}
                  {question.isRequired && state !== 'answered' && (
                    <span
                      className="absolute top-0 left-0 w-0 h-0"
                      style={{
                        borderTop: '10px solid #ef4444',
                        borderRight: '10px solid transparent',
                      }}
                      aria-label="Required question"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-green-100 border-green-300" />
              <span className="text-slate-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-white border-slate-300" />
              <span className="text-slate-600">Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-orange-100 border-orange-300" />
              <span className="text-slate-600">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-primary-500 border-primary-500" />
              <span className="text-slate-600">Current</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <span
                className="w-4 h-4 flex-shrink-0"
                style={{
                  background: 'linear-gradient(to bottom right, #ef4444 50%, transparent 50%)',
                }}
              />
              <span className="text-slate-600">Required</span>
            </div>
          </div>

          {/* Required Warning */}
          {requiredRemaining > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-sm text-yellow-700">
                {requiredRemaining} required question{requiredRemaining > 1 ? 's' : ''} remaining
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavigatorMobile;
