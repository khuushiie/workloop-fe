export interface SearchResult<T = unknown> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface SearchFilters {
  [key: string]: string | string[] | number | boolean | undefined;
}

export interface SearchSortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

export interface SearchConfiguration {
  searchableFields: string[];
  sortOptions?: SearchSortOption[];
  defaultSort?: SearchSortOption;
  filters?: SearchFilters;
  pagination?: {
    enabled: boolean;
    defaultLimit: number;
    maxLimit: number;
  };
}

export interface SearchState<T = unknown> {
  query: string;
  results: SearchResult<T>;
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
  sort: SearchSortOption | null;
  page: number;
  hasSearched: boolean;
}

export interface SearchValidationRule {
  type: 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value: string | number | RegExp | ((val: string) => boolean);
  message: string;
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

export interface AdvancedSearchOptions {
  fuzzySearch?: boolean;
  exactMatch?: boolean;
  caseSensitive?: boolean;
  searchInFields?: string[];
  excludeFields?: string[];
  boost?: { [field: string]: number };
}
