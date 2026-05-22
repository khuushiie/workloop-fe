import { useState, useCallback, useEffect } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '../utils/debounce';

export interface UseGenericSearchOptions {
  debounceDelay?: number;
  minSearchLength?: number;
  initialQuery?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
}

export interface UseGenericSearchReturn {
  query: string;
  debouncedQuery: string;
  isSearching: boolean;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  handleSearch: (query: string) => void;
}

export const useGenericSearch = (options: UseGenericSearchOptions = {}): UseGenericSearchReturn => {
  const {
    debounceDelay = DEBOUNCE_DELAYS.SEARCH,
    minSearchLength = 0,
    initialQuery = '',
    onSearch,
    onClear,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced query for API calls
  const debouncedQuery = useDebounce(query, debounceDelay);

  // Handle search with validation
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length >= minSearchLength) {
      setIsSearching(true);
      onSearch?.(searchQuery.trim());
    } else if (searchQuery.trim().length === 0) {
      setIsSearching(false);
      onClear?.();
    }
  }, [minSearchLength, onSearch, onClear]);

  // Clear query
  const clearQuery = useCallback(() => {
    setQuery('');
    setIsSearching(false);
    onClear?.();
  }, [onClear]);

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedQuery.trim().length >= minSearchLength) {
      setIsSearching(true);
      onSearch?.(debouncedQuery.trim());
    } else if (debouncedQuery.trim().length === 0) {
      setIsSearching(false);
      onClear?.();
    }
  }, [debouncedQuery, minSearchLength, onSearch, onClear]);

  return {
    query,
    debouncedQuery,
    isSearching,
    setQuery,
    clearQuery,
    handleSearch,
  };
};
