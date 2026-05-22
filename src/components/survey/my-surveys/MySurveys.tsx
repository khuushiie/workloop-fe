import React, { useState, useCallback } from 'react';
import { FileQuestion, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useMySurveys } from './hooks/useMySurveys';
import { StatsCards, StatCardConfig } from '../common';
import SurveyCard from './components/SurveyCard';
import SurveyCardSkeleton from './components/SurveyCardSkeleton';
import ViewResponseModal from './components/ViewResponseModal';
import SurveyInformation from './survey-info/SurveyInformation';
import TakeSurvey from './take-survey/TakeSurvey';
import { MySurveyTab } from '../types';
import { scrollToTop } from '../hooks';

type MySurveysView = 'list' | 'info' | 'take';

const TABS: { key: MySurveyTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const statsCardsConfig: StatCardConfig[] = [
  { key: 'totalAssigned', label: 'Total Assigned', color: 'bg-primary-500', icon: FileText },
  { key: 'completed', label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  { key: 'pending', label: 'Pending', color: 'bg-orange-500', icon: Clock },
  { key: 'inProgress', label: 'In Progress', color: 'bg-purple-500', icon: ArrowRight },
];

interface SurveyListViewProps {
  onViewInfo: (surveyId: string) => void;
  onViewResponse: (surveyId: string) => void;
}

const SurveyListView: React.FC<SurveyListViewProps> = ({ onViewInfo, onViewResponse }) => {
  const {
    stats,
    surveys,
    activeTab,
    isLoadingStats,
    isLoadingSurveys,
    setActiveTab,
    tabCounts,
  } = useMySurveys();

  const [responseModalId, setResponseModalId] = useState<string | null>(null);

  const handleViewResponse = useCallback((responseId: string) => {
    setResponseModalId(responseId);
    onViewResponse(responseId);
  }, [onViewResponse]);

  const handleCloseResponseModal = useCallback(() => {
    setResponseModalId(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className=" mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">My Surveys</h1>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6">
          <StatsCards stats={stats} cards={statsCardsConfig} loading={isLoadingStats} />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-lg md:rounded-full shadow-soft px-1.5 py-1.5 flex flex-wrap gap-1">
              {TABS.map((tab) => {
                const count = tabCounts[tab.key];
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${isActive
                      ? "bg-primary-600 text-white shadow"
                      : "text-slate-600 hover:text-primary-600 hover:bg-primary-50"
                      }`}
                  >
                    {tab.label}
                    <span
                      className={`text-xs sm:pt-[3px] ${isActive ? 'text-primary-100' : 'text-slate-400'
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isLoadingSurveys ? (
          <SurveyCardSkeleton count={4} />
        ) : surveys.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {surveys.map((survey) => (
              <SurveyCard
                key={survey._id}
                survey={survey}
                onViewInfo={onViewInfo}
                onViewResponse={handleViewResponse}
              />
            ))}
          </div>
        )}
      </div>

      {/* View Response Modal */}
      <ViewResponseModal
        surveyId={responseModalId || ''}
        isOpen={!!responseModalId}
        onClose={handleCloseResponseModal}
      />
    </div>
  );
};

const MySurveys: React.FC = () => {
  const [currentView, setCurrentView] = useState<MySurveysView>('list');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  const handleViewSurveyInfo = useCallback((surveyId: string) => {
    setSelectedSurveyId(surveyId);
    setCurrentView('info');
    scrollToTop();
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedSurveyId(null);
    setCurrentView('list');
    scrollToTop();
  }, []);

  const handleBeginFromInfo = useCallback(() => {
    if (selectedSurveyId) {
      setCurrentView('take');
      scrollToTop();
    }
  }, [selectedSurveyId]);

  const handleViewResponse = useCallback((_responseId: string) => { }, []);

  if (currentView === 'info' && selectedSurveyId) {
    return (
      <SurveyInformation
        surveyId={selectedSurveyId}
        onBack={handleBackToList}
        onBeginSurvey={handleBeginFromInfo}
      />
    );
  }

  if (currentView === 'take' && selectedSurveyId) {
    return (
      <TakeSurvey
        surveyId={selectedSurveyId}
        onBack={handleBackToList}
        onComplete={handleBackToList}
      />
    );
  }

  return (
    <SurveyListView
      onViewInfo={handleViewSurveyInfo}
      onViewResponse={handleViewResponse}
    />
  );
};

interface EmptyStateProps {
  activeTab: MySurveyTab;
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeTab }) => {
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'pending':
        return 'No pending surveys. You\'re all caught up!';
      case 'inProgress':
        return 'No surveys in progress.';
      case 'completed':
        return 'No completed surveys yet.';
      default:
        return 'No surveys assigned to you.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
      </div>
      <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-1">
        No Surveys Found
      </h3>
      <p className="text-sm text-slate-500 max-w-sm">
        {getEmptyMessage()}
      </p>
    </div>
  );
};

export default MySurveys;
