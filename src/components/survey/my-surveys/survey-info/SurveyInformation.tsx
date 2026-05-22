import React from 'react';
import { ArrowLeft, Info, FileText } from 'lucide-react';
import { useSurveyInfo } from '../hooks/useSurveyInfo';
import SurveyDetailsCard from './SurveyDetailsCard';
import Badge from '../../../common/Badge';
import Button from '../../../common/Button';

interface SurveyInformationProps {
  surveyId: string;
  onBack: () => void;
  onBeginSurvey: () => void;
}

const STATUS_BADGE_CONFIG = {
  active: { label: 'Active', variant: 'green' as const },
  upcoming: { label: 'Upcoming', variant: 'blue' as const },
  closed: { label: 'Closed', variant: 'gray' as const },
};

const SurveyInformation: React.FC<SurveyInformationProps> = ({
  surveyId,
  onBack,
  onBeginSurvey,
}) => {
  const { surveyInfo, isLoading, error } = useSurveyInfo(surveyId);

  if (isLoading) {
    return <SurveyInformationSkeleton onBack={onBack} />;
  }

  if (error || !surveyInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{error || 'Survey not found'}</p>
          <Button appearance="secondary" onClick={onBack}>
            Back to My Surveys
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_BADGE_CONFIG[surveyInfo.status];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto px-6 sm:px-6 lg:px-10 sm:py-12">
        <div className="flex justify-between mb-4 px-6 items-center">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0">
                {surveyInfo.title}
              </h1>
              <Badge variant={statusConfig.variant} size="middle">
                {statusConfig.label}
              </Badge>
            </div>
          <Button
            appearance="primary"
            size="middle"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={onBack}
          >
            Back to My Surveys
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-6 py-4">
          <div className="flex-1 lg:flex-[2] bg-white p-8 border border-slate-200 rounded-xl">
            
            <div className="mb-8">
              {
                surveyInfo.aboutText && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <h2 className="text-lg font-semibold text-slate-900 mb-0">About This Survey</h2>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                      <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">
                        {surveyInfo.aboutText}
                      </p>
                    </div>
                  </>
                )
              }
            </div>

            {/* Instructions Box */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              <div className="flex items-center gap-3 mb-5 sticky top-0 bg-primary-50 pb-2 -mt-1 pt-1 z-10">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Info className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Instructions</h3>
              </div>
              <ul className="space-y-3">
                {surveyInfo.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                      {index + 1}
                    </span>
                    <span className="text-base text-primary-800 pt-0.5 break-words overflow-wrap-anywhere">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Sidebar - 35% */}
          <div className="lg:flex-[1] lg:min-w-[320px] lg:max-w-[400px]">
            <SurveyDetailsCard
              surveyInfo={surveyInfo}
              onBeginSurvey={onBeginSurvey}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
interface SkeletonProps {
  onBack: () => void;
}

const SurveyInformationSkeleton: React.FC<SkeletonProps> = ({ onBack }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Back Button */}
      <div className="flex justify-end mb-4">
        <Button appearance="primary" size="middle" icon={<ArrowLeft className="w-4 h-4" />} onClick={onBack}>
          Back to My Surveys
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
        {/* Left Content */}
        <div className="flex-1 lg:w-[70%]">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 bg-slate-200 rounded w-2/3" />
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>

          {/* About Section */}
          <div className="mb-6">
            <div className="h-6 bg-slate-200 rounded w-40 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-slate-100 rounded-xl p-5">
            <div className="h-6 bg-slate-200 rounded w-32 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-4/5" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-[30%]">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 bg-slate-200 rounded w-32 mb-6" />
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-slate-100 rounded w-24 mb-2" />
                <div className="h-8 bg-slate-200 rounded w-12" />
              </div>
              <div>
                <div className="h-4 bg-slate-100 rounded w-20 mb-2" />
                <div className="h-8 bg-slate-200 rounded w-28" />
              </div>
              <div>
                <div className="h-4 bg-slate-100 rounded w-24 mb-2" />
                <div className="h-8 bg-slate-200 rounded w-24" />
              </div>
              <div className="h-12 bg-slate-200 rounded-lg w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SurveyInformation;
