import { useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { api } from '../lib/api';
import type { Interaction, InteractionType } from '../types';

interface InteractionTimelineProps {
  contactId: string;
  onAddInteraction?: () => void;
}

/**
 * Interaction type configuration with icons and colors
 */
const INTERACTION_TYPE_CONFIG: Record<
  InteractionType,
  { icon: string; label: string; bgColor: string; textColor: string }
> = {
  CALL: { icon: '📞', label: 'Call', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  MEETING: { icon: '🤝', label: 'Meeting', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  EMAIL: { icon: '✉️', label: 'Email', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  TEXT: { icon: '💬', label: 'Text', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
  COFFEE: { icon: '☕', label: 'Coffee', bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
  LUNCH: { icon: '🍽️', label: 'Lunch', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  EVENT: { icon: '🎉', label: 'Event', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
  OTHER: { icon: '📝', label: 'Other', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
};

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
export function InteractionTimeline({ contactId, onAddInteraction }: InteractionTimelineProps) {
  const {
    data: interactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['interactions', contactId],
    queryFn: () => api.getInteractionsForContact(contactId),
    enabled: !!contactId,
  });

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Interactions</h2>
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

      {/* Content */}
      <div className="p-6">
        {isLoading && <LoadingState />}
        {error && <ErrorState message={(error as any)?.error?.message || 'Failed to load interactions'} />}
        {!isLoading && !error && interactions && (
          interactions.length === 0 ? (
            <EmptyState onAddInteraction={onAddInteraction} />
          ) : (
            <InteractionList interactions={interactions} />
          )
        )}
      </div>
    </div>
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
 * Empty state component
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
 * Main interaction list with date grouping
 */
function InteractionList({ interactions }: { interactions: Interaction[] }) {
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
              <InteractionCard key={interaction.id} interaction={interaction} />
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
function InteractionCard({ interaction }: { interaction: Interaction }) {
  const config = INTERACTION_TYPE_CONFIG[interaction.type];

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
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
