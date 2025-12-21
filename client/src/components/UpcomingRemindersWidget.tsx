import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { api } from '../lib/api';
import { ReminderWithContact } from '../types';

/**
 * Dashboard widget showing upcoming reminders and overdue alerts
 */
export function UpcomingRemindersWidget() {
  const queryClient = useQueryClient();

  // Fetch upcoming reminders (limit 5)
  const {
    data: upcomingReminders,
    isLoading: isLoadingUpcoming,
    error: upcomingError,
  } = useQuery({
    queryKey: ['reminders', 'upcoming', 5],
    queryFn: () => api.getUpcomingReminders(5),
  });

  // Fetch overdue reminders for count
  const {
    data: overdueReminders,
    isLoading: isLoadingOverdue,
  } = useQuery({
    queryKey: ['reminders', 'overdue'],
    queryFn: () => api.getOverdueReminders(),
  });

  // Mark complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: (id: string) => api.markReminderComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const isLoading = isLoadingUpcoming || isLoadingOverdue;
  const overdueCount = overdueReminders?.length || 0;
  const hasReminders = (upcomingReminders && upcomingReminders.length > 0) || overdueCount > 0;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
        </div>
        <Link
          to="/reminders"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all →
        </Link>
      </div>

      {/* Overdue Alert Banner */}
      {overdueCount > 0 && (
        <Link
          to="/reminders?tab=overdue"
          className="block bg-red-50 border-b border-red-100 px-4 py-3 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-red-800 font-medium">
              {overdueCount} overdue reminder{overdueCount !== 1 ? 's' : ''}
            </span>
            <span className="text-red-600 text-sm">— Click to view</span>
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <LoadingState />
        ) : upcomingError ? (
          <ErrorState />
        ) : !hasReminders ? (
          <EmptyState />
        ) : upcomingReminders && upcomingReminders.length > 0 ? (
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                onMarkComplete={() => markCompleteMutation.mutate(reminder.id)}
                isMarking={markCompleteMutation.isPending}
              />
            ))}
          </div>
        ) : (
          // Has overdue but no upcoming
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No upcoming reminders</p>
            <Link
              to="/reminders"
              className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add a reminder
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading state
 */
function LoadingState() {
  return (
    <div className="text-center py-6">
      <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-2 text-gray-500 text-sm">Loading reminders...</p>
    </div>
  );
}

/**
 * Error state
 */
function ErrorState() {
  return (
    <div className="text-center py-6">
      <p className="text-red-600 text-sm">Failed to load reminders</p>
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState() {
  return (
    <div className="text-center py-6">
      <div className="text-3xl mb-2">✨</div>
      <p className="text-gray-600 font-medium">All caught up!</p>
      <p className="text-gray-500 text-sm mt-1">No upcoming reminders</p>
      <Link
        to="/reminders"
        className="inline-flex items-center gap-1 mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add a reminder
      </Link>
    </div>
  );
}

/**
 * Individual reminder item
 */
function ReminderItem({
  reminder,
  onMarkComplete,
  isMarking,
}: {
  reminder: ReminderWithContact;
  onMarkComplete: () => void;
  isMarking: boolean;
}) {
  const dueDate = new Date(reminder.dueDate);
  const isOverdue = isPast(dueDate);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        isOverdue
          ? 'border-red-200 bg-red-50'
          : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
      }`}
    >
      {/* Complete button */}
      <button
        onClick={onMarkComplete}
        disabled={isMarking}
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
          isOverdue
            ? 'border-red-400 hover:border-red-500 hover:bg-red-100'
            : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
        } ${isMarking ? 'opacity-50' : ''}`}
        aria-label="Mark as complete"
        title="Mark as complete"
      >
        {isMarking && (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/contacts/${reminder.contactId}`}
          className="font-medium text-gray-900 hover:text-blue-600 block truncate"
        >
          {reminder.title}
        </Link>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
            {isOverdue
              ? `${formatDistanceToNow(dueDate)} overdue`
              : `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`}
          </span>
          <span className="text-gray-300">•</span>
          <Link
            to={`/contacts/${reminder.contactId}`}
            className="text-gray-500 hover:text-blue-600 truncate"
          >
            {reminder.contact.firstName} {reminder.contact.lastName}
          </Link>
        </div>
      </div>

      {/* Due date badge */}
      <div
        className={`flex-shrink-0 text-xs px-2 py-1 rounded ${
          isOverdue
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {format(dueDate, 'MMM d')}
      </div>
    </div>
  );
}
