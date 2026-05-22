import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { TakeSurveyQuestion, QuestionState } from '../../types';
import { cn } from '../../../../utils/cn';

interface QuestionNavigatorProps {
  questions: TakeSurveyQuestion[];
  questionStates: Record<string, QuestionState>;
  currentIndex: number;
  answeredCount: number;
  requiredRemaining: number;
  onQuestionClick: (index: number) => void;
}

// Color configuration for question states
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

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  questionStates,
  currentIndex,
  answeredCount,
  requiredRemaining,
  onQuestionClick,
}) => {
  const totalQuestions = questions.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 shadow-soft sticky top-24 overflow-hidden">
      {/* Header */}
      <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-2">Question Navigator</h2>
      <p className="text-xs lg:text-sm text-slate-500 mb-4 lg:mb-6">
        Progress: {answeredCount}/{totalQuestions} Answered
      </p>

      {/* Question Grid - Responsive with auto-fit */}
      <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 mb-6 lg:mb-8">
        {questions.map((question, index) => {
          const state = questionStates[question._id] || 'notVisited';
          const colors = STATE_COLORS[state];
          const isCurrent = index === currentIndex;

          return (
            <button
              key={question._id}
              onClick={() => onQuestionClick(index)}
              className={cn(
                'relative w-full aspect-square border-2 flex items-center justify-center overflow-visible',
                'text-xs lg:text-sm font-semibold transition-all hover:scale-105 hover:shadow-soft',
                colors.bg,
                colors.border,
                colors.text,
                isCurrent && 'ring-2 ring-primary-500 ring-offset-1 lg:ring-offset-2'
              )}
            >
              {index + 1}
              {/* Required indicator (inverted triangle at top-left corner) */}
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
      <NavigatorLegend />

      {/* Required Warning */}
      {requiredRemaining > 0 && (
        <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 lg:gap-3">
          <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600 flex-shrink-0" />
          <span className="text-xs lg:text-sm font-medium text-yellow-700">
            {requiredRemaining} required question{requiredRemaining > 1 ? 's' : ''} remaining
          </span>
        </div>
      )}
    </div>
  );
};

// Legend component - vertical layout
const NavigatorLegend: React.FC = () => {
  const legendItems = [
    { label: 'Answered', color: 'bg-green-100 border-green-300' },
    { label: 'Not Visited', color: 'bg-white border-slate-300' },
    { label: 'Not Answered', color: 'bg-orange-100 border-orange-300' },
    { label: 'Current', color: 'bg-primary-500 border-primary-500' },
  ];

  return (
    <div className="pt-3 lg:pt-4 border-t border-slate-100 space-y-2">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={cn(
              'w-4 h-4 rounded border-2 flex-shrink-0',
              item.color
            )}
          />
          <span className="text-xs lg:text-sm text-slate-600">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span
          className="w-4 h-4 flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(to bottom right, #ef4444 50%, transparent 50%)',
          }}
        />
        <span className="text-xs lg:text-sm text-slate-600">Required</span>
      </div>
    </div>
  );
};

export default QuestionNavigator;
