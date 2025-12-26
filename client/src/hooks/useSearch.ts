import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useDebounce } from './useDebounce';
import type { GlobalSearchResponse } from '../types';

/**
 * Custom hook for global search functionality
 *
 * Uses debouncing (300ms) to prevent excessive API calls while typing.
 * Only triggers search when query is at least 2 characters.
 *
 * @param query - The search query string
 * @param limit - Maximum number of results to return (default: 10)
 * @returns React Query result with search data, loading, and error states
 */
export function useSearch(query: string, limit: number = 10) {
  // Debounce the query to avoid API calls on every keystroke
  const debouncedQuery = useDebounce(query, 300);

  // Only search if we have at least 2 characters
  const shouldSearch = debouncedQuery.trim().length >= 2;

  return useQuery<GlobalSearchResponse>({
    queryKey: ['search', debouncedQuery, limit],
    queryFn: () => api.globalSearch(debouncedQuery, limit),
    enabled: shouldSearch,
    staleTime: 30000, // Cache results for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });
}
