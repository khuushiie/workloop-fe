
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';

import {
  useGetMySurveysStatsQuery,
  useGetMySurveysQuery,
} from '../../../../store/apis/survey.api';

import {
  setMySurveysTab,
  type MySurveysTab,
} from '../../../../store/slices/surveySlice';

import { MySurvey, MySurveysStats, MySurveyTab } from '../../types';

interface UseMySurveysReturn {
  // Data
  stats: MySurveysStats | null;
  surveys: MySurvey[];
  activeTab: MySurveyTab;

  // Loading states
  isLoadingStats: boolean;
  isLoadingSurveys: boolean;

  // Actions
  setActiveTab: (tab: MySurveyTab) => void;
  refreshData: () => Promise<void>;

  // Computed
  tabCounts: Record<MySurveyTab, number>;
}

export const useMySurveys = (): UseMySurveysReturn => {
  const dispatch = useDispatch<AppDispatch>();

  const { mySurveysTab } = useSelector((state: RootState) => state.survey);

  const activeTab = mySurveysTab as MySurveyTab;

  const statsQuery = useGetMySurveysStatsQuery();
  const surveysQuery = useGetMySurveysQuery();

  const allSurveys = surveysQuery.data ?? [];

  const surveys = useMemo(() => {
    if (activeTab === 'all') return allSurveys;
    return allSurveys.filter((survey) => survey.status === activeTab);
  }, [allSurveys, activeTab]);

  // Calculate tab counts
  const tabCounts = useMemo((): Record<MySurveyTab, number> => ({
    pending: allSurveys.filter((s) => s.status === 'pending').length,
    inProgress: allSurveys.filter((s) => s.status === 'inProgress').length,
    completed: allSurveys.filter((s) => s.status === 'completed').length,
    all: allSurveys.length,
  }), [allSurveys]);


  const setActiveTabAction = useCallback((tab: MySurveyTab) => {
    dispatch(setMySurveysTab(tab as MySurveysTab));
  }, [dispatch]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      statsQuery.refetch(),
      surveysQuery.refetch(),
    ]);
  }, [statsQuery, surveysQuery]);


  return {
    stats: statsQuery.data ?? null,
    surveys,
    activeTab,
    isLoadingStats: statsQuery.isLoading,
    isLoadingSurveys: surveysQuery.isLoading,
    setActiveTab: setActiveTabAction,
    refreshData,
    tabCounts,
  };
};

export default useMySurveys;
