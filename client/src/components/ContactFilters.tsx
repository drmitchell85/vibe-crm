import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TagFilter } from './TagSelector';
import { Spinner } from './ui';
import type { ContactFilters as ContactFiltersType } from '../types';

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onChange: (filters: ContactFiltersType) => void;
}

/**
 * Advanced contact filters component
 *
 * Features:
 * - Company dropdown (populated from API)
 * - Date range filter (created date)
 * - Reminder filter toggles
 * - Integrated with existing TagFilter
 * - Collapsible filter panel
 * - Active filter count badge
 */
export function ContactFilters({ filters, onChange }: ContactFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch distinct companies for dropdown
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.getDistinctCompanies(),
    staleTime: 60000, // Cache for 1 minute
  });

  // Calculate active filter count
  const activeFilterCount = countActiveFilters(filters);

  // Close company dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle tag filter changes
  const handleTagChange = (tagIds: string[]) => {
    onChange({ ...filters, tags: tagIds.length > 0 ? tagIds : undefined });
  };

  // Handle company filter changes
  const handleCompanyChange = (company: string | undefined) => {
    onChange({ ...filters, company });
    setIsCompanyDropdownOpen(false);
  };

  // Handle date filter changes
  const handleDateChange = (field: 'createdAfter' | 'createdBefore', value: string) => {
    onChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  // Handle reminder filter toggles
  const handleReminderToggle = (field: 'hasReminders' | 'hasOverdueReminders') => {
    const newValue = !filters[field];
    const updates: Partial<ContactFiltersType> = { [field]: newValue || undefined };

    // If turning on hasOverdueReminders, turn off hasReminders (they're mutually exclusive in UI)
    if (field === 'hasOverdueReminders' && newValue) {
      updates.hasReminders = undefined;
    }
    // If turning on hasReminders, turn off hasOverdueReminders
    if (field === 'hasReminders' && newValue) {
      updates.hasOverdueReminders = undefined;
    }

    onChange({ ...filters, ...updates });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onChange({});
  };

  return (
    <div className="space-y-4">
      {/* Filter toggle bar */}
      <div className="flex items-center gap-3">
        {/* Expand/Collapse button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Tag filter (always visible) */}
        <TagFilter
          selectedTagIds={filters.tags || []}
          onChange={handleTagChange}
        />

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {isExpanded && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Company filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Company
              </label>
              <div className="relative" ref={companyDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className={filters.company ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                    {filters.company || 'All companies'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCompanyDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                    {isLoadingCompanies ? (
                      <div className="px-3 py-4 text-center">
                        <Spinner size="sm" />
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCompanyChange(undefined)}
                          className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            !filters.company ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          All companies
                        </button>
                        {companies.map((company) => (
                          <button
                            key={company}
                            type="button"
                            onClick={() => handleCompanyChange(company)}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              filters.company === company ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {company}
                          </button>
                        ))}
                        {companies.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No companies found
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Created after date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created after
              </label>
              <input
                type="date"
                value={filters.createdAfter ? filters.createdAfter.split('T')[0] : ''}
                onChange={(e) => handleDateChange('createdAfter', e.target.value ? `${e.target.value}T00:00:00.000Z` : '')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Created before date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created before
              </label>
              <input
                type="date"
                value={filters.createdBefore ? filters.createdBefore.split('T')[0] : ''}
                onChange={(e) => handleDateChange('createdBefore', e.target.value ? `${e.target.value}T23:59:59.999Z` : '')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Reminder toggles */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Reminders
              </label>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!filters.hasReminders}
                    onChange={() => handleReminderToggle('hasReminders')}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Has reminders</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!filters.hasOverdueReminders}
                    onChange={() => handleReminderToggle('hasOverdueReminders')}
                    className="w-4 h-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Has overdue</span>
                </label>
              </div>
            </div>
          </div>

          {/* Active filters summary */}
          {activeFilterCount > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <ActiveFiltersSummary filters={filters} onRemove={onChange} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Count the number of active filters
 */
function countActiveFilters(filters: ContactFiltersType): number {
  let count = 0;
  if (filters.tags && filters.tags.length > 0) count++;
  if (filters.company) count++;
  if (filters.createdAfter) count++;
  if (filters.createdBefore) count++;
  if (filters.hasReminders) count++;
  if (filters.hasOverdueReminders) count++;
  return count;
}

/**
 * Display active filters as removable chips
 */
function ActiveFiltersSummary({
  filters,
  onRemove,
}: {
  filters: ContactFiltersType;
  onRemove: (filters: ContactFiltersType) => void;
}) {
  const removeFilter = (key: keyof ContactFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onRemove(newFilters);
  };

  const chips: { key: keyof ContactFiltersType; label: string }[] = [];

  if (filters.company) {
    chips.push({ key: 'company', label: `Company: ${filters.company}` });
  }
  if (filters.createdAfter) {
    chips.push({
      key: 'createdAfter',
      label: `Created after: ${new Date(filters.createdAfter).toLocaleDateString()}`,
    });
  }
  if (filters.createdBefore) {
    chips.push({
      key: 'createdBefore',
      label: `Created before: ${new Date(filters.createdBefore).toLocaleDateString()}`,
    });
  }
  if (filters.hasReminders) {
    chips.push({ key: 'hasReminders', label: 'Has reminders' });
  }
  if (filters.hasOverdueReminders) {
    chips.push({ key: 'hasOverdueReminders', label: 'Has overdue reminders' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 py-1">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-full"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => removeFilter(chip.key)}
            className="hover:text-blue-900 dark:hover:text-blue-100"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}
