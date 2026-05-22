import React from 'react';
import { Eye, Type, AlignLeft, ListChecks, CheckSquare, Star, Calendar, Hash, X, PanelRightOpen, PanelLeftOpen, Edit, Trash2 } from 'lucide-react';
import { SurveyQuestion, QuestionType, QUESTION_TYPE_CONFIG } from '../types';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import { IconButton } from './components';
import { cn } from '../../../utils/cn';

interface QuestionOverviewPanelProps {
  questions: SurveyQuestion[];
  onQuestionClick: (tempId: string) => void;
  onDeleteQuestion: (tempId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
  short_text: <Type className="w-3.5 h-3.5" />,
  long_text: <AlignLeft className="w-3.5 h-3.5" />,
  mcq: <ListChecks className="w-3.5 h-3.5" />,
  checkbox: <CheckSquare className="w-3.5 h-3.5" />,
  rating: <Star className="w-3.5 h-3.5" />,
  date: <Calendar className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
};

const QuestionOverviewPanel: React.FC<QuestionOverviewPanelProps> = ({
  questions,
  onQuestionClick,
  onDeleteQuestion,
  isOpen,
  onToggle,
}) => {
  if (questions.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile Toggle Button - Fixed at bottom right */}
      {!isOpen && (
        <Button
          appearance="primary"
          size="middle"
          onClick={onToggle}
          icon={<PanelRightOpen className="w-4 h-4" />}
          className="!fixed !bottom-4 !right-4 !z-40 lg:!hidden !rounded-full !shadow-soft"
          aria-label="Toggle question overview"
        >
          <span className="text-sm font-medium">Overview</span>
          <Badge variant="gray" size="small" className="!bg-white/20 !text-white ml-2">
            {questions.length}
          </Badge>
        </Button>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Panel Container - Single flex child with toggle button */}
      <div
        className={cn(
          'flex-shrink-0 h-full relative transition-all duration-300 ease-in-out',
          // Desktop: width animation
          isOpen ? 'lg:w-80 xl:w-80' : 'lg:w-10'
        )}
      >
        {/* Desktop Toggle Button - Always visible */}
        <IconButton
          variant="default"
          size="sm"
          onClick={onToggle}
          className="hidden lg:flex absolute top-3 left-3 z-10 shadow-soft rounded-l-lg rounded-r-none"
          aria-label={isOpen ? 'Close panel' : 'Open panel'}
        >
          {isOpen ? <PanelRightOpen className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </IconButton>

        {/* Panel Content */}
        <div
          className={cn(
            'bg-white h-full overflow-hidden',
            // Mobile: fixed slide-in from right
            'fixed inset-y-0 right-0 w-[85vw] max-w-sm z-50',
            'transform transition-transform duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : 'translate-x-full',
            // Desktop: relative with full size
            'lg:relative lg:inset-auto lg:z-auto lg:w-full lg:max-w-none lg:transform-none',
            isOpen ? 'lg:border-l lg:border-slate-200' : 'lg:opacity-0 lg:pointer-events-none'
          )}
        >
          <div className="h-full flex flex-col lg:pl-8">
            {/* Panel Header */}
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3.5 border-b border-slate-100">
              <Eye className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-medium text-slate-900 mb-0">Question Overview</h3>
              <Badge variant="gray" size="small" className="ml-auto">
                {questions.length}
              </Badge>
              {/* Close button for mobile */}
              <IconButton
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </IconButton>
            </div>

            {/* Questions List - Redesigned */}
            <div className="flex-1 overflow-y- p-3 space-y-2 ">
              {questions.map((question, index) => (
                <div
                  key={question.tempId}
                  className={cn(
                    'group p-2.5 rounded-lg border transition-all',
                    'hover:border-primary-300 hover:bg-primary-50/50',
                    'border-slate-200 bg-slate-50/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {/* Question Number Badge */}
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                      {index + 1}
                    </span>

                    {/* Type Icon */}
                    <span className="flex-shrink-0 text-slate-400">
                      {questionTypeIcons[question.type] || <Type className="w-3.5 h-3.5" />}
                    </span>

                    {/* Type Label */}
                    <span className="flex-shrink-0 text-xs font-medium text-slate-500 min-w-[40px]">
                      {(QUESTION_TYPE_CONFIG[question.type] || QUESTION_TYPE_CONFIG.short_text).shortLabel}
                    </span>

                    {/* Separator */}
                    <span className="flex-shrink-0 text-slate-300">|</span>

                    {/* Question Text - Clickable */}
                    <button
                      type="button"
                      onClick={() => {
                        onQuestionClick(question.tempId);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className="flex-1 min-w-0 text-left text-sm text-slate-700 truncate hover:text-primary-600 focus:outline-none"
                      title={question.text || 'Untitled Question'}
                    >
                      {question.text || 'Untitled Question'}
                    </button>

                    {/* Required indicator */}
                    {question.isRequired && (
                      <span className="flex-shrink-0 text-red-500 text-xs font-bold">*</span>
                    )}

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconButton
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          onQuestionClick(question.tempId);
                          if (window.innerWidth < 1024) onToggle();
                        }}
                        aria-label="Edit question"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </IconButton>
                      <IconButton
                        variant="danger"
                        size="xs"
                        onClick={() => onDeleteQuestion(question.tempId)}
                        aria-label="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionOverviewPanel;
