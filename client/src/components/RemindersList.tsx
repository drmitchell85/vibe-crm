import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { api } from '../lib/api';
import { Reminder } from '../types';

interface RemindersListProps {
  contactId: string;
  onAddReminder?: () => void;
  onEditReminder?: (reminder: Reminder) => void;
}

/**
 * Format due date with relative time
 */
function formatDueDate(dueDate: string, isCompleted: boolean): { text: string; isOverdue: boolean } {
  const date = new Date(dueDate);
  const isOverdue = !isCompleted && isPast(date);

  if (isCompleted) {
    return { text: format(date, 'MMM d, yyyy'), isOverdue: false };
  }

  if (isOverdue) {
    return { text: `${formatDistanceToNow(date)} overdue`, isOverdue: true };
  }

  return { text: `Due ${formatDistanceToNow(date, { addSuffix: true })}`, isOverdue: false };
}

/**
 * Reminders List component - displays reminders for a contact
 */
export function RemindersList({ contactId, onAddReminder, onEditReminder }: RemindersListProps) {
  const queryClient = useQueryClient();

  const {
    data: reminders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['reminders', 'contact', contactId],
    queryFn: () => api.getRemindersForContact(contactId),
    enabled: !!contactId,
  });

  // Mark complete/incomplete mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      if (isCompleted) {
        return api.markReminderIncomplete(id);
      }
      return api.markReminderComplete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  // Sort reminders: incomplete first (by due date), then completed
  const sortedReminders = reminders ? [...reminders].sort((a, b) => {
    // Completed items go to the bottom
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // Within same completion status, sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }) : [];

  // Count overdue reminders
  const overdueCount = reminders?.filter(r => !r.isCompleted && isPast(new Date(r.dueDate))).length || 0;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Reminders</h2>
          {reminders && reminders.length > 0 && (
            <span className="text-sm text-gray-500">
              ({reminders.length})
            </span>
          )}
          {overdueCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {overdueCount} overdue
            </span>
          )}
        </div>
        {onAddReminder && (
          <button
            onClick={onAddReminder}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Reminder
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && <LoadingState />}
        {error && <ErrorState message={(error as any)?.error?.message || 'Failed to load reminders'} />}
        {!isLoading && !error && reminders && (
          sortedReminders.length === 0 ? (
            <EmptyState onAddReminder={onAddReminder} />
          ) : (
            <div className="space-y-3">
              {sortedReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onToggleComplete={() => toggleCompleteMutation.mutate({
                    id: reminder.id,
                    isCompleted: reminder.isCompleted
                  })}
                  onClick={onEditReminder ? () => onEditReminder(reminder) : undefined}
                  isToggling={toggleCompleteMutation.isPending}
                />
              ))}
            </div>
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
      <p className="mt-3 text-gray-600 text-sm">Loading reminders...</p>
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
function EmptyState({ onAddReminder }: { onAddReminder?: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">🔔</div>
      <h3 className="text-gray-900 font-medium mb-1">No reminders</h3>
      <p className="text-gray-500 text-sm mb-4">
        Set reminders to follow up with this contact.
      </p>
      {onAddReminder && (
        <button
          onClick={onAddReminder}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add your first reminder
        </button>
      )}
    </div>
  );
}

/**
 * Individual reminder card
 */
function ReminderCard({
  reminder,
  onToggleComplete,
  onClick,
  isToggling,
}: {
  reminder: Reminder;
  onToggleComplete: () => void;
  onClick?: () => void;
  isToggling: boolean;
}) {
  const { text: dueDateText, isOverdue } = formatDueDate(reminder.dueDate, reminder.isCompleted);

  // Determine card styling based on status
  const cardClasses = reminder.isCompleted
    ? 'border-gray-200 bg-gray-50'
    : isOverdue
    ? 'border-red-200 bg-red-50'
    : 'border-gray-200 bg-white';

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    onToggleComplete();
  };

  return (
    <div
      className={`border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer ${cardClasses}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          disabled={isToggling}
          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
            reminder.isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : isOverdue
              ? 'border-red-400 hover:border-red-500 hover:bg-red-100'
              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          } ${isToggling ? 'opacity-50' : ''}`}
          aria-label={reminder.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {reminder.isCompleted && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isToggling && (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className={`font-medium ${reminder.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {reminder.title}
          </h4>

          {/* Description */}
          {reminder.description && (
            <p className={`text-sm mt-1 line-clamp-2 ${reminder.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
              {reminder.description}
            </p>
          )}

          {/* Due date */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                reminder.isCompleted
                  ? 'text-gray-400'
                  : isOverdue
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {isOverdue && !reminder.isCompleted && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              {dueDateText}
            </span>
            {reminder.completedAt && (
              <span className="text-xs text-gray-400">
                • Completed {format(new Date(reminder.completedAt), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
