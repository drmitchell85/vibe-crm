import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { Spinner } from './ui/Spinner';
import type { SearchResult, SearchEntityType } from '../types';

// ============================================
// Local Storage Key
// ============================================
const RECENT_SEARCHES_KEY = 'fph-crm-recent-searches';
const MAX_RECENT_SEARCHES = 5;

// ============================================
// Entity Type Configuration
// ============================================
interface EntityConfig {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
}

const entityConfig: Record<SearchEntityType, EntityConfig> = {
  contact: {
    icon: '👤',
    label: 'Contact',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
  },
  note: {
    icon: '📝',
    label: 'Note',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
  },
  interaction: {
    icon: '💬',
    label: 'Interaction',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
  },
  reminder: {
    icon: '🔔',
    label: 'Reminder',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
  },
};

// ============================================
// Props Interface
// ============================================
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get stored recent searches from localStorage
 */
function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a search query to recent searches
 */
function saveRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (trimmed.length < 2) return;

  const recent = getRecentSearches();
  // Remove if already exists, then add to front
  const filtered = recent.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear all recent searches
 */
function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get the navigation path for a search result
 */
function getResultPath(result: SearchResult): string {
  switch (result.entityType) {
    case 'contact':
      return `/contacts/${result.id}`;
    case 'note':
    case 'interaction':
      // Notes and interactions navigate to the contact page
      return `/contacts/${result.contactId}`;
    case 'reminder':
      // Reminders go to the reminders page
      return '/reminders';
    default:
      return '/';
  }
}

// ============================================
// Command Palette Component
// ============================================
export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // State
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Search with debouncing
  const { data: searchData, isLoading, error } = useSearch(query, 10);

  // Load recent searches when opening
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setQuery('');
      setSelectedIndex(0);
      // Focus input after a brief delay to ensure modal is visible
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchData?.results]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(query);
      const path = getResultPath(result);
      onClose();
      navigate(path);
    },
    [query, onClose, navigate]
  );

  // Handle recent search click
  const handleRecentSearchClick = useCallback((recentQuery: string) => {
    setQuery(recentQuery);
  }, []);

  // Handle clear recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Get current items for keyboard navigation
  const results = searchData?.results ?? [];
  const hasResults = results.length > 0;
  const showRecent = query.trim().length < 2 && recentSearches.length > 0;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const itemCount = hasResults ? results.length : 0;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(itemCount, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + Math.max(itemCount, 1)) % Math.max(itemCount, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (hasResults && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [hasResults, results, selectedIndex, handleSelect, onClose]
  );

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-screen items-start justify-center pt-16 sm:pt-24 px-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search contacts, notes, interactions, reminders..."
              className="flex-1 outline-none text-gray-900 dark:text-gray-100 bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-lg"
              autoComplete="off"
              spellCheck="false"
            />
            {isLoading && <Spinner size="sm" color="gray" />}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded">
              ESC
            </kbd>
          </div>

          {/* Results Container */}
          <div
            ref={resultsRef}
            className="max-h-96 overflow-y-auto"
          >
            {/* Error State */}
            {error && (
              <div className="p-4 text-center text-red-600 dark:text-red-400">
                <p>Search failed. Please try again.</p>
              </div>
            )}

            {/* Recent Searches */}
            {showRecent && !error && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recent Searches
                  </span>
                  <button
                    onClick={handleClearRecent}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((recent) => (
                  <button
                    key={recent}
                    onClick={() => handleRecentSearchClick(recent)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{recent}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No Query State */}
            {query.trim().length < 2 && !showRecent && !error && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Type at least 2 characters to search</p>
              </div>
            )}

            {/* No Results State */}
            {query.trim().length >= 2 && !isLoading && !hasResults && !error && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No results found for "{query}"</p>
                <p className="mt-1 text-sm">Try a different search term</p>
              </div>
            )}

            {/* Search Results */}
            {hasResults && (
              <div className="p-2">
                <div className="px-3 py-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Results ({searchData?.totalResults})
                  </span>
                </div>
                {results.map((result, index) => {
                  const config = entityConfig[result.entityType];
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={`${result.entityType}-${result.id}`}
                      data-selected={isSelected}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-start gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {/* Entity Icon */}
                      <span
                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${config.bgColor}`}
                      >
                        {config.icon}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {result.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${config.bgColor} ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.preview}
                        </p>
                        {result.contactName && result.entityType !== 'contact' && (
                          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                            Contact: {result.contactName}
                          </p>
                        )}
                      </div>

                      {/* Arrow indicator for selected */}
                      {isSelected && (
                        <svg
                          className="flex-shrink-0 w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with keyboard hints */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">↓</kbd>
                <span className="ml-1">Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd>
                <span className="ml-1">Select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Esc</kbd>
                <span className="ml-1">Close</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
