import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import { InsightsStats, InsightsTabKey } from '../types';
import { useGetSurveyInsightsQuery } from '../../../../store/apis/survey.api';
import { setResponsesTab } from '../../../../store/slices/surveySlice';

interface UseSurveyInsightsReturn {
  stats: InsightsStats;
  loading: boolean;
  error: string | null;
  activeTab: InsightsTabKey;
  setActiveTab: (tab: InsightsTabKey) => void;
  refresh: () => void;
}

const defaultStats: InsightsStats = {
  totalAssigned: 0,
  completed: 0,
  pending: 0,
  notStarted: 0,
  completionRate: 0,
  surveyTitle: '',
  startDate: '',
  endDate: '',
};

export const useSurveyInsights = (surveyId: string): UseSurveyInsightsReturn => {
  const dispatch = useDispatch<AppDispatch>();

  const { responsesTab } = useSelector((state: RootState) => state.survey);

  const { data, isLoading, error, refetch } = useGetSurveyInsightsQuery(
    surveyId,
    { skip: !surveyId }
  );

  const setActiveTab = useCallback((tab: InsightsTabKey) => {
    dispatch(setResponsesTab(tab));
  }, [dispatch]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    stats: data ?? defaultStats,
    loading: isLoading,
    error: error ? 'Failed to load survey insights. Please try again.' : null,
    activeTab: responsesTab as InsightsTabKey,
    setActiveTab,
    refresh,
  };
};

export default useSurveyInsights;
