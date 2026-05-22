import React from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { SurveyInfo } from '../../types';
import Button from '../../../common/Button';

interface SurveyDetailsCardProps {
  surveyInfo: SurveyInfo;
  onBeginSurvey: () => void;
  isLoading?: boolean;
}

const SurveyDetailsCard: React.FC<SurveyDetailsCardProps> = ({
  surveyInfo,
  onBeginSurvey,
  isLoading = false,
}) => {
  const { userProgress, totalQuestions, isConfidential } = surveyInfo;

  const getButtonText = () => {
    if (userProgress.status === 'completed') return 'View Response';
    if (userProgress.status === 'inProgress') return 'Continue Survey';
    return 'Begin Survey';
  };

  const getProgressText = () => {
    if (userProgress.status === 'completed') return 'Completed';
    if (userProgress.status === 'inProgress') return 'In Progress';
    return 'Not Started';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-soft flex flex-col h-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh] lg:sticky lg:top-6 transition-all duration-300">
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900">Survey Details</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-1">
            <span>Total Questions</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalQuestions}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Your Progress</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{getProgressText()}</p>
          <p className="text-sm text-slate-500 mt-1">
            {userProgress.answeredCount}/{userProgress.totalQuestions} questions answered
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-slate-100">
        <Button
          appearance="primary"
          size="large"
          className="w-full h-12 text-base font-semibold shadow-soft hover:shadow-soft active:scale-[0.98] transition-all mb-3"
          onClick={onBeginSurvey}
          loading={isLoading}
          disabled={userProgress.status === 'completed'}
        >
          {getButtonText()}
        </Button>

        {isConfidential && (
          <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
            <Shield className="w-3.5 h-3.5" />
            <span className="italic">Your responses are confidential</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyDetailsCard;
