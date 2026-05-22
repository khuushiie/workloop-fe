import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Save, Upload, Loader2, Check } from 'lucide-react';
import { useTakeSurvey } from '../hooks/useTakeSurvey';
import QuestionDisplay from './QuestionDisplay';
import QuestionNavigator from './QuestionNavigator';
import NavigatorMobile from './NavigatorMobile';
import SubmitConfirmationModal from './SubmitConfirmationModal';
import Button from '../../../common/Button';

interface TakeSurveyProps {
  surveyId: string;
  onBack: () => void;
  onComplete: () => void;
}

const TakeSurvey: React.FC<TakeSurveyProps> = ({ surveyId, onBack, onComplete }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const {
    surveyData,
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    questionStates,
    answeredCount,
    requiredRemaining,
    progress,
    isLoading,
    isSaving,
    isSubmitting,
    autoSaveStatus,
    setAnswer,
    goToQuestion,
    goToNext,
    goToPrevious,
    saveAndExit,
    submitSurvey,
    isFirstQuestion,
    isLastQuestion,
    canSubmit,
  } = useTakeSurvey(surveyId);

  const handleSaveAndExit = async () => {
    await saveAndExit();
    onBack();
  };

  const handleSubmit = async () => {
    const success = await submitSurvey();
    if (success) {
      setShowSubmitModal(false);
      onComplete();
    }
  };

  if (isLoading) {
    return <TakeSurveySkeleton />;
  }

  if (!surveyData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Survey not found or failed to load</p>
          <Button appearance="secondary" onClick={onBack}>
            Back to My Surveys
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Title & Progress Text */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                {surveyData.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {answeredCount} of {totalQuestions} questions answered
              </p>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-xs hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 whitespace-nowrap">{progress}% Complete</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isSaving ? (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Auto saving...
                </span>
              ) : autoSaveStatus === 'error' ? (
                <span className="text-xs text-red-600">Auto save failed</span>
              ) : (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}

              <Button
                appearance="secondary"
                size="small"
                icon={<Save className="w-4 h-4" />}
                onClick={handleSaveAndExit}
                loading={isSaving}
              >
                <span className="hidden sm:inline">Save & Exit</span>
                <span className="sm:hidden">Save</span>
              </Button>

              <Button
                appearance="primary"
                size="small"
                icon={<Upload className="w-4 h-4" />}
                onClick={() => setShowSubmitModal(true)}
                disabled={!canSubmit}
              >
                <span className="hidden sm:inline">Submit Survey</span>
                <span className="sm:hidden">Submit</span>
              </Button>
            </div>
          </div>

          <div className="mt-2 sm:hidden">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 lg:flex-[2]">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
              value={answers[currentQuestion._id] ?? null}
              onChange={(value) => setAnswer(currentQuestion._id, value)}
            />

            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex items-center justify-between">
              <Button
                appearance="ghost"
                size="middle"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={goToPrevious}
                disabled={isFirstQuestion}
              >
                Previous
              </Button>

              <Button
                appearance="primary"
                size="middle"
                onClick={goToNext}
                disabled={isLastQuestion}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="hidden lg:block lg:flex-[1] lg:max-w-[360px]">
            <QuestionNavigator
              questions={surveyData.questions}
              questionStates={questionStates}
              currentIndex={currentIndex}
              answeredCount={answeredCount}
              requiredRemaining={requiredRemaining}
              onQuestionClick={goToQuestion}
            />
          </div>
        </div>
      </div>

      <NavigatorMobile
        questions={surveyData.questions}
        questionStates={questionStates}
        currentIndex={currentIndex}
        answeredCount={answeredCount}
        requiredRemaining={requiredRemaining}
        onQuestionClick={goToQuestion}
      />

      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        requiredRemaining={requiredRemaining}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

// Loading Skeleton
const TakeSurveySkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50">
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="flex-1">
            <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
          </div>
          <div className="h-2 w-32 bg-slate-200 rounded-full hidden sm:block" />
          <div className="h-9 w-24 bg-slate-200 rounded-lg" />
          <div className="h-9 w-24 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
        <div className="flex-1 lg:w-[70%]">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-8 w-32 bg-slate-200 rounded-full mb-4" />
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-6" />
            <div className="space-y-3">
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
            </div>
          </div>
          <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 flex justify-between">
            <div className="h-10 w-24 bg-slate-200 rounded-lg" />
            <div className="h-10 w-24 bg-slate-200 rounded-lg" />
          </div>
        </div>

        <div className="hidden lg:block lg:w-[30%]">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="h-6 bg-slate-200 rounded w-2/3 mb-4" />
            <div className="grid grid-cols-5 gap-2 mb-6">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TakeSurvey;
