import { format, isToday, isYesterday, isThisWeek, isThisYear, isPast, formatDistanceToNow } from 'date-fns';

/**
 * Format a date string for use in datetime-local input fields
 * @param dateString - ISO date string to format
 * @param defaultToTomorrow - If true and no dateString, defaults to tomorrow at 9 AM (for reminders)
 */
export function formatDateForInput(dateString?: string, defaultToTomorrow = false): string {
  if (dateString) {
    return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
  }

  if (defaultToTomorrow) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return format(tomorrow, "yyyy-MM-dd'T'HH:mm");
  }

  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

/**
 * Format a date for display in cards and lists
 * Shows weekday, month, day, and year only if different from current year
 */
export function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format a date into a human-readable group label for timeline grouping
 * Returns: "Today", "Yesterday", day name for this week, "Month Day" for this year, or full date
 */
export function getDateGroupLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE'); // Day name (e.g., "Monday")
  if (isThisYear(date)) return format(date, 'MMMM d'); // Month Day (e.g., "December 22")
  return format(date, 'MMMM d, yyyy'); // Full date
}

/**
 * Format duration in minutes to a readable string
 * @example formatDuration(90) // "1h 30m"
 * @example formatDuration(45) // "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format a due date with relative time and overdue status
 * Uses date-fns formatDistanceToNow for natural language
 */
export function formatDueDate(
  dueDate: string,
  isCompleted: boolean
): { text: string; isOverdue: boolean } {
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
 * Format a date as relative time with custom overdue detection
 * Returns human-friendly text like "Due today", "in 2 days", "3 days overdue"
 */
export function formatRelativeTime(dateString: string): { text: string; isOverdue: boolean } {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // Same day logic
  if (diffDays === 0) {
    if (diffHours < 0) {
      const hoursAgo = Math.abs(diffHours);
      if (hoursAgo < 24) {
        return { text: `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} overdue`, isOverdue: true };
      }
    }
    if (diffHours >= 0 && diffHours < 24) {
      return { text: 'Due today', isOverdue: false };
    }
  }

  // Tomorrow
  if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false };
  }

  // Yesterday (1 day overdue)
  if (diffDays === -1) {
    return { text: '1 day overdue', isOverdue: true };
  }

  // Within a week (future)
  if (diffDays > 1 && diffDays <= 7) {
    return { text: `in ${diffDays} days`, isOverdue: false };
  }

  // More than a week (future)
  if (diffDays > 7) {
    const weeks = Math.floor(diffDays / 7);
    return { text: `in ${weeks} week${weeks !== 1 ? 's' : ''}`, isOverdue: false };
  }

  // Overdue (past)
  if (diffDays < -1) {
    const daysOverdue = Math.abs(diffDays);
    if (daysOverdue <= 7) {
      return { text: `${daysOverdue} days overdue`, isOverdue: true };
    }
    const weeks = Math.floor(daysOverdue / 7);
    return { text: `${weeks} week${weeks !== 1 ? 's' : ''} overdue`, isOverdue: true };
  }

  return { text: 'Due today', isOverdue: false };
}
