import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { api } from '../lib/api';
import { Interaction, InteractionType, InteractionFilters } from '../types';

interface InteractionTimelineProps {
  contactId: string;
  onAddInteraction?: () => void;
  onEditInteraction?: (interaction: Interaction) => void;
}

/**
 * Interaction type configuration with icons and colors
 */
const INTERACTION_TYPE_CONFIG: Record<
  InteractionType,
  { icon: string; label: string; bgColor: string; textColor: string }
> = {
  [InteractionType.CALL]: { icon: '📞', label: 'Call', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  [InteractionType.MEETING]: { icon: '🤝', label: 'Meeting', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  [InteractionType.EMAIL]: { icon: '✉️', label: 'Email', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  [InteractionType.TEXT]: { icon: '💬', label: 'Text', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
  [InteractionType.COFFEE]: { icon: '☕', label: 'Coffee', bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
  [InteractionType.LUNCH]: { icon: '🍽️', label: 'Lunch', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  [InteractionType.EVENT]: { icon: '🎉', label: 'Event', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
  [InteractionType.OTHER]: { icon: '📝', label: 'Other', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
};

/**
 * All interaction types for the filter dropdown
 */
const ALL_INTERACTION_TYPES = Object.values(InteractionType);

type SortOrder = 'newest' | 'oldest';

/**
 * Format a date into a human-readable group label
 */
function getDateGroupLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
  if (isThisYear(date)) return format(date, 'MMMM d'); // Month Day
  return format(date, 'MMMM d, yyyy'); // Full date
}

/**
 * Group interactions by date
 */
function groupInteractionsByDate(interactions: Interaction[]): Map<string, Interaction[]> {
  const groups = new Map<string, Interaction[]>();

  for (const interaction of interactions) {
    const date = new Date(interaction.date);
    const label = getDateGroupLabel(date);

    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(interaction);
  }

  return groups;
}

/**
 * Format duration in minutes to a readable string
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Interaction Timeline component - displays chronological list of interactions
 */
export function InteractionTimeline({ contactId, onAddInteraction, onEditInteraction }: InteractionTimelineProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filter state from URL params
  const typeFilter = searchParams.get('type') as InteractionType | null;
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const sortOrder = (searchParams.get('sort') as SortOrder) || 'newest';

  // Track if filters panel is expanded (collapsed by default on mobile)
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Build API filters from URL params
  const apiFilters: InteractionFilters = useMemo(() => {
    const filters: InteractionFilters = {};
    if (typeFilter) filters.type = typeFilter;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    return filters;
  }, [typeFilter, startDate, endDate]);

  const hasActiveFilters = typeFilter || startDate || endDate;

  const {
    data: interactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['interactions', contactId, apiFilters],
    queryFn: () => api.getInteractionsForContact(contactId, apiFilters),
    enabled: !!contactId,
  });

  // Apply client-side sorting
  const sortedInteractions = useMemo(() => {
    if (!interactions) return [];
    const sorted = [...interactions];
    sorted.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [interactions, sortOrder]);

  // Update URL params helper
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('type');
    newParams.delete('startDate');
    newParams.delete('endDate');
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Interactions</h2>
          {interactions && interactions.length > 0 && (
            <span className="text-sm text-gray-500">
              ({sortedInteractions.length}{hasActiveFilters ? ' filtered' : ''})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filter toggle button */}
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {[typeFilter, startDate, endDate].filter(Boolean).length}
              </span>
            )}
          </button>

          {onAddInteraction && (
            <button
              onClick={onAddInteraction}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Interaction
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {filtersExpanded && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-end gap-4">
            {/* Type Filter */}
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="type-filter" className="block text-xs font-medium text-gray-600 mb-1">
                Type
              </label>
              <select
                id="type-filter"
                value={typeFilter || ''}
                onChange={(e) => updateFilter('type', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">All Types</option>
                {ALL_INTERACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {INTERACTION_TYPE_CONFIG[type].icon} {INTERACTION_TYPE_CONFIG[type].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="start-date" className="block text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => updateFilter('startDate', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* End Date Filter */}
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="end-date" className="block text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => updateFilter('endDate', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Sort Order */}
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="sort-order" className="block text-xs font-medium text-gray-600 mb-1">
                Sort
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => updateFilter('sort', e.target.value === 'newest' ? null : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!filtersExpanded && hasActiveFilters && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-blue-700 font-medium">Active filters:</span>
          {typeFilter && (
            <FilterBadge
              label={`Type: ${INTERACTION_TYPE_CONFIG[typeFilter].label}`}
              onRemove={() => updateFilter('type', null)}
            />
          )}
          {startDate && (
            <FilterBadge
              label={`From: ${format(new Date(startDate), 'MMM d, yyyy')}`}
              onRemove={() => updateFilter('startDate', null)}
            />
          )}
          {endDate && (
            <FilterBadge
              label={`To: ${format(new Date(endDate), 'MMM d, yyyy')}`}
              onRemove={() => updateFilter('endDate', null)}
            />
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {isLoading && <LoadingState />}
        {error && <ErrorState message={(error as any)?.error?.message || 'Failed to load interactions'} />}
        {!isLoading && !error && interactions && (
          sortedInteractions.length === 0 ? (
            hasActiveFilters ? (
              <NoResultsState onClearFilters={clearAllFilters} />
            ) : (
              <EmptyState onAddInteraction={onAddInteraction} />
            )
          ) : (
            <InteractionList interactions={sortedInteractions} onEditInteraction={onEditInteraction} />
          )
        )}
      </div>
    </div>
  );
}

/**
 * Filter badge component
 */
function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="text-center py-8">
      <div className="inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-3 text-gray-600 text-sm">Loading interactions...</p>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  );
}

/**
 * Empty state component (no interactions at all)
 */
function EmptyState({ onAddInteraction }: { onAddInteraction?: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">📅</div>
      <h3 className="text-gray-900 font-medium mb-1">No interactions yet</h3>
      <p className="text-gray-500 text-sm mb-4">
        Start tracking your conversations and meetings with this contact.
      </p>
      {onAddInteraction && (
        <button
          onClick={onAddInteraction}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log your first interaction
        </button>
      )}
    </div>
  );
}

/**
 * No results state (filters applied but no matches)
 */
function NoResultsState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">🔍</div>
      <h3 className="text-gray-900 font-medium mb-1">No matching interactions</h3>
      <p className="text-gray-500 text-sm mb-4">
        Try adjusting your filters to see more results.
      </p>
      <button
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        Clear all filters
      </button>
    </div>
  );
}

/**
 * Main interaction list with date grouping
 */
function InteractionList({
  interactions,
  onEditInteraction,
}: {
  interactions: Interaction[];
  onEditInteraction?: (interaction: Interaction) => void;
}) {
  const groupedInteractions = groupInteractionsByDate(interactions);

  return (
    <div className="space-y-6">
      {Array.from(groupedInteractions.entries()).map(([dateLabel, dayInteractions]) => (
        <div key={dateLabel}>
          {/* Date group header */}
          <h3 className="text-sm font-medium text-gray-500 mb-3">{dateLabel}</h3>

          {/* Interactions for this date */}
          <div className="space-y-3">
            {dayInteractions.map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                onClick={onEditInteraction ? () => onEditInteraction(interaction) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Individual interaction card
 */
function InteractionCard({
  interaction,
  onClick,
}: {
  interaction: Interaction;
  onClick?: () => void;
}) {
  const config = INTERACTION_TYPE_CONFIG[interaction.type];

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Type badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
        >
          <span>{config.icon}</span>
          {config.label}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Subject */}
          {interaction.subject && (
            <h4 className="text-gray-900 font-medium truncate">{interaction.subject}</h4>
          )}

          {/* Notes preview */}
          {interaction.notes && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{interaction.notes}</p>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {/* Time */}
            <span>{format(new Date(interaction.date), 'h:mm a')}</span>

            {/* Duration */}
            {interaction.duration && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatDuration(interaction.duration)}
              </span>
            )}

            {/* Location */}
            {interaction.location && (
              <span className="flex items-center gap-1 truncate">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate">{interaction.location}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
