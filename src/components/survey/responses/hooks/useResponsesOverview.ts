import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import {
  useGetResponsesOverviewStatsQuery,
  useGetResponsesOverviewQuery,
} from '../../../../store/apis/survey.api';
import {
  setPage,
  setLimit,
  setSearchQuery,
  setStatusFilter,
  setDateRange,
  clearFilters as clearFiltersAction,
} from '../../../../store/slices/surveySlice';

import {
  ResponsesStats,
  SurveyResponseSummary,
  ResponsesFilters,
  PaginationParams,
  SurveyStatus,
} from '../types';

interface UseResponsesOverviewReturn {
  stats: ResponsesStats;
  statsLoading: boolean;

  surveys: SurveyResponseSummary[];
  surveysLoading: boolean;
  totalSurveys: number;

  filters: ResponsesFilters;
  pagination: PaginationParams;

  setFilters: (filters: ResponsesFilters) => void;
  setPagination: (pagination: PaginationParams) => void;
  clearFilters: () => void;
  refresh: () => void;
}

const defaultStats: ResponsesStats = {
  surveysCreated: 0,
  activeSurveys: 0,
  completedSurveys: 0,
};

export const useResponsesOverview = (): UseResponsesOverviewReturn => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    page,
    limit,
    searchQuery,
    statusFilter,
    dateRange,
  } = useSelector((state: RootState) => state.survey);


  const statsQuery = useGetResponsesOverviewStatsQuery();

  const surveysQuery = useGetResponsesOverviewQuery({
    search: searchQuery || undefined,
    status: statusFilter === 'published' ? 'active' :
      statusFilter === 'inactive' ? 'completed' : undefined,
    startDate: dateRange.from || undefined,
    endDate: dateRange.to || undefined,
    page,
    pageSize: limit,
  });

  const filters = useMemo((): ResponsesFilters => ({
    search: searchQuery,
    status: statusFilter === 'published' ? 'active' :
      statusFilter === 'inactive' ? 'completed' : '',
    dateRange: dateRange.from || dateRange.to ? {
      startDate: dateRange.from || '',
      endDate: dateRange.to || '',
    } : undefined,
  }), [searchQuery, statusFilter, dateRange]);
  const pagination = useMemo((): PaginationParams => ({
    page,
    pageSize: limit,
    limit,
  }), [page, limit]);

  const surveys = useMemo((): SurveyResponseSummary[] => {
    const data = surveysQuery.data?.data ?? [];
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      startDate: item.startDate,
      endDate: item.endDate,
      completed: item.completed,
      pending: item.pending,
      notStarted: item.notStarted,
      total: item.total,
      status: item.status as SurveyStatus,
      assignedTo: item.assignedTo,
    }));
  }, [surveysQuery.data]);

  const totalSurveys = surveysQuery.data?.pagination?.total ?? 0;

  const setFiltersAction = useCallback((newFilters: ResponsesFilters) => {
    dispatch(setSearchQuery(newFilters.search || ''));

    if (newFilters.status === 'active') {
      dispatch(setStatusFilter('published'));
    } else if (newFilters.status === 'completed') {
      dispatch(setStatusFilter('inactive'));
    } else {
      dispatch(setStatusFilter(null));
    }

    if (newFilters.dateRange) {
      dispatch(setDateRange({
        from: newFilters.dateRange.startDate || null,
        to: newFilters.dateRange.endDate || null,
      }));
    } else {
      dispatch(setDateRange({ from: null, to: null }));
    }

    dispatch(setPage(1));
  }, [dispatch]);

  const setPaginationAction = useCallback((newPagination: PaginationParams) => {
    dispatch(setPage(newPagination.page));
    const newLimit = newPagination.limit ?? newPagination.pageSize;
    if (newLimit !== limit) {
      dispatch(setLimit(newLimit));
    }
  }, [dispatch, limit]);

  const clearFiltersHandler = useCallback(() => {
    dispatch(clearFiltersAction());
  }, [dispatch]);

  const refresh = useCallback(() => {
    statsQuery.refetch();
    surveysQuery.refetch();
  }, [statsQuery, surveysQuery]);

  return {
    stats: statsQuery.data ?? defaultStats,
    statsLoading: statsQuery.isLoading,
    surveys,
    surveysLoading: surveysQuery.isLoading,
    totalSurveys,
    filters,
    pagination,
    setFilters: setFiltersAction,
    setPagination: setPaginationAction,
    clearFilters: clearFiltersHandler,
    refresh,
  };
};

export default useResponsesOverview;
