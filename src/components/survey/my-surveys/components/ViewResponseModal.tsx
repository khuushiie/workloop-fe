import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Star, CheckSquare, Calendar } from 'lucide-react';
import { ResponseAnswer } from '../../types';
import { cn } from '../../../../utils/cn';
import { formatDate } from '../../../../utils/timeUtils';

import { useLazyGetMyResponseQuery } from '../../../../store/apis/survey.api';

interface ViewResponseModalProps {
  surveyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ViewResponseModal: React.FC<ViewResponseModalProps> = ({ surveyId, isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  const [fetchResponse, { data: response, isLoading }] = useLazyGetMyResponseQuery();

  useEffect(() => {
    if (isOpen && surveyId) {
      setCurrentPage(0);
      fetchResponse(surveyId);
    }
  }, [isOpen, surveyId, fetchResponse]);

  if (!isOpen) return null;

  const totalPages = response ? Math.ceil((response.answers?.length ?? 0) / questionsPerPage) : 0;
  const paginatedAnswers = response?.answers?.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  ) ?? [];

  const handlePrevious = () => setCurrentPage(p => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-lg shadow-soft-hover w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
              {response?.employeeInitials || 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-0">
                {response?.employeeName || 'Loading...'}
              </h3>
              {response?.surveyTitle && (
                <p className="text-xs text-slate-500 mt-0.5 mb-0">{response.surveyTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {response?.submittedAt && (
          <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-sm text-primary-600 font-medium mb-0">
              Submitted On: {formatDate(response.submittedAt)}
            </p>
          </div>
        )}

        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <ResponseSkeleton />
          ) : paginatedAnswers.length > 0 ? (
            <div className="space-y-6">
              {paginatedAnswers.map((answer, index) => (
                <AnswerDisplay
                  key={answer.questionId}
                  answer={answer}
                  isLast={index === paginatedAnswers.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400 italic">No answers found for this response.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-200 bg-slate-50">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={cn(
                'flex items-center gap-1 text-sm font-medium transition-colors',
                currentPage === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-sm text-slate-500">
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className={cn(
                'flex items-center gap-1 text-sm font-medium transition-colors',
                currentPage >= totalPages - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AnswerDisplay: React.FC<{ answer: ResponseAnswer; isLast: boolean }> = ({ answer, isLast }) => {
  const renderAnswer = () => {
    const type = answer?.questionType ?? 'short_text';
    const rawAnswer = answer?.answer;

    switch (type) {
      case 'rating': {
        const rating = typeof rawAnswer === 'number'
          ? rawAnswer
          : parseInt(String(rawAnswer), 10) || 0;
        const maxRating = answer?.maxRating || 5;
        return (
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: maxRating }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-5 h-5 transition-colors',
                  i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'
                )}
              />
            ))}
            <span className="text-sm text-slate-400 ml-2 font-medium">
              ({rating}/{maxRating})
            </span>
          </div>
        );
      }

      case 'checkbox': {
        const selections = Array.isArray(rawAnswer) ? rawAnswer : (rawAnswer ? [String(rawAnswer)] : []);
        return (
          <div className="mt-2 space-y-2">
            {selections.length > 0 ? selections.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-700">
                <CheckSquare className="w-5 h-5 text-green-500" />
                <span className="text-sm">{opt}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-400 italic">No selection made</p>
            )}
          </div>
        );
      }

      case 'mcq':
        return (
          <div className="mt-2 inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium border border-primary-100">
            {String(rawAnswer || 'No response')}
          </div>
        );

      case 'date': {
        const dateVal = rawAnswer ? new Date(String(rawAnswer)) : null;
        const formatted = dateVal && !isNaN(dateVal.getTime())
          ? formatDate(String(rawAnswer))
          : String(rawAnswer || 'No response');
        return (
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-900 font-medium bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatted}
          </div>
        );
      }

      case 'short_text':
      case 'long_text':
        return (
          <div className="mt-2 bg-slate-50 rounded-lg p-3 text-sm text-slate-800 border border-slate-100">
            {String(rawAnswer || '') || <span className="text-slate-400 italic">No response</span>}
          </div>
        );

      default:
        return (
          <p className="mt-2 text-sm text-slate-700">
            {String(rawAnswer || 'No response')}
          </p>
        );
    }
  };

  return (
    <div className={cn('pb-5', !isLast && 'border-b border-slate-100')}>
      <h4 className="font-semibold text-slate-900 text-base mb-1">
        Q{answer?.questionNumber ?? ''}. {answer?.questionText ?? ''}
      </h4>
      {renderAnswer()}
    </div>
  );
};

// ── Loading Skeleton ──────────────────────────────────────────────
const ResponseSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i}>
        <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
      </div>
    ))}
  </div>
);

export default ViewResponseModal;
