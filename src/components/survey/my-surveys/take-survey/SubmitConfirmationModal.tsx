import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SubmitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredCount: number;
  requiredRemaining: number;
  isSubmitting: boolean;
}

const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  requiredRemaining,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const canSubmit = requiredRemaining === 0;

  // Configuration based on state
  const config = canSubmit
    ? {
      icon: CheckCircle,
      color: 'text-green-500',
      title: 'Ready to Submit?',
      btnColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      btnText: 'Submit Survey'
    }
    : {
      icon: AlertCircle,
      color: 'text-red-500',
      title: 'Cannot Submit Yet',
      btnColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      btnText: 'Complete Required Questions'
    };

  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => !isSubmitting && e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-soft-hover w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 ${config.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-slate-900 mb-0">{config.title}</h3>
          </div>

          {/* Body */}
          <div className="mb-6">
            {canSubmit ? (
              <p className="text-sm text-slate-600">
                You have answered <span className="font-medium text-slate-900">{answeredCount} of {totalQuestions}</span> questions.
                Once submitted, you will not be able to edit your responses.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  You still have <span className="font-bold text-red-600">{requiredRemaining}</span> required question{requiredRemaining > 1 ? 's' : ''} that must be answered.
                </p>
                <p className="text-xs text-slate-500">
                  Please go back and complete all required fields marked with an asterisk (*).
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {canSubmit ? 'Cancel' : 'Close'}
            </button>

            <button
              type="button"
              onClick={canSubmit ? onConfirm : onClose}
              disabled={isSubmitting || (!canSubmit && true)} // Disable confirm if not canSubmit, though logic swaps button action to onClose usually
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${canSubmit ? config.btnColor : 'bg-slate-400 cursor-not-allowed'}`}
            >
              {isSubmitting ? 'Submitting...' : (canSubmit ? config.btnText : 'Return to Survey')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmationModal;