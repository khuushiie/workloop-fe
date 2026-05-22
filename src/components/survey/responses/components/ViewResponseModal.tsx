import React, { useEffect } from 'react';
import { Star, CheckSquare, Calendar } from 'lucide-react';
import { ResponseAnswer } from '../types';
import { cn } from '../../../../utils/cn';
import { formatDate } from '../../../../utils/timeUtils';
import { useLazyGetResponseDetailQuery } from '../../../../store/apis/survey.api';
import Modal from '../../../../components/common/Modal';

interface ViewResponseModalProps {
  responseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ViewResponseModal: React.FC<ViewResponseModalProps> = ({
  responseId,
  isOpen,
  onClose,
}) => {
  const [fetchResponse, { data: response, isLoading }] = useLazyGetResponseDetailQuery();

  useEffect(() => {
    if (isOpen && responseId) {
      fetchResponse({ responseId });
    }
  }, [isOpen, responseId, fetchResponse]);

  const getInitials = (name: string) =>
    name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';

  const ModalHeaderContent = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-soft">
        {response?.employee ? getInitials(response.employee.name) : 'U'}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-0">
          {response?.employee?.name || 'Loading...'}
        </h3>
        {response?.surveyTitle && (
          <p className="text-xs text-slate-500 mt-0.5 mb-0">{response.surveyTitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ModalHeaderContent as React.ReactNode}
      size="2xl"
      loading={isLoading}
      centered
      bodyClassName="p-0"
      headerClassName="py-4 px-6"
    >
      {response?.submittedAt && (
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center">
          <span className="text-sm text-primary-600 font-medium">
            Submitted On: {formatDate(response.submittedAt)}
          </span>
        </div>
      )}

      <div className="px-4 sm:px-6 py-4 space-y-6">
        {!isLoading && response?.answers && response.answers.length > 0 ? (
          response.answers.map((answer: ResponseAnswer, index: number) => (
            <AnswerDisplay
              key={answer.questionId}
              answer={answer}
              isLast={index === response.answers.length - 1}
            />
          ))
        ) : (
          !isLoading && (
            <div className="text-center py-10">
              <p className="text-slate-400 italic">No answers found for this response.</p>
            </div>
          )
        )}
      </div>
    </Modal>
  );
};

const AnswerDisplay: React.FC<{ answer: ResponseAnswer; isLast: boolean }> = ({ answer, isLast }) => {
  const type = answer?.questionType ?? 'short_text';
  const rawAnswer = answer?.answer;

  const renderAnswer = () => {
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
            {selections.length > 0 ? selections.map((opt: string, i: number) => (
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
      <h4 className="font-bold text-slate-900 text-base mb-1">
        Q{answer?.questionNumber ?? ''}. {answer?.questionText ?? ''}
      </h4>
      {renderAnswer()}
    </div>
  );
};

export default ViewResponseModal;