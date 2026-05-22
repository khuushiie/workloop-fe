import { useState, useCallback, useEffect } from 'react';
import { SurveyFilters } from '../types';
import { DEBOUNCE_DELAYS, useDebounce } from '../../../../utils/debounce';

const initialFilters: SurveyFilters = {
  search: '',
  status: '',
  fromDate: null,
  toDate: null,
};

export const useSurveyFilters = () => {
  const [filters, setFilters] = useState<SurveyFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState('');

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAYS.SEARCH);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  const updateSearch = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const updateStatus = useCallback((status: '' | 'active' | 'inactive') => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const updateFromDate = useCallback((date: string | null) => {
    setFilters((prev) => ({ ...prev, fromDate: date }));
  }, []);

  const updateToDate = useCallback((date: string | null) => {
    setFilters((prev) => ({ ...prev, toDate: date }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchInput('');
  }, []);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== '' ||
    filters.fromDate !== null ||
    filters.toDate !== null;

  return {
    filters,
    searchInput,
    updateSearch,
    updateStatus,
    updateFromDate,
    updateToDate,
    clearFilters,
    hasActiveFilters,
  };
};

export default useSurveyFilters;
