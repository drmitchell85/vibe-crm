import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { ReminderWithContact } from '../types';

type TabType = 'all' | 'upcoming' | 'overdue' | 'completed';

/**
 * Format a date as relative time (e.g., "in 2 days", "3 days ago")
 */
function formatRelativeTime(dateString: string): { text: string; isOverdue: boolean } {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

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

  if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false };
  }

  if (diffDays === -1) {
    return { text: '1 day overdue', isOverdue: true };
  }

  if (diffDays > 1 && diffDays <= 7) {
    return { text: `in ${diffDays} days`, isOverdue: false };
  }

  if (diffDays > 7) {
    const weeks = Math.floor(diffDays / 7);
    return { text: `in ${weeks} week${weeks !== 1 ? 's' : ''}`, isOverdue: false };
  }

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

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Reminders page - displays all reminders with tab-based filtering
 */
export function RemindersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Fetch reminders based on active tab
  const { data: reminders, isLoading, error } = useQuery({
    queryKey: ['reminders', activeTab],
    queryFn: async () => {
      switch (activeTab) {
        case 'upcoming':
          return api.getUpcomingReminders(50);
        case 'overdue':
          return api.getOverdueReminders();
        case 'completed':
          return api.getAllReminders({ isCompleted: true });
        case 'all':
        default:
          return api.getAllReminders();
      }
    },
  });

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'upcoming', label: 'Upcoming', icon: '📅' },
    { key: 'overdue', label: 'Overdue', icon: '⚠️' },
    { key: 'completed', label: 'Completed', icon: '✅' },
    { key: 'all', label: 'All', icon: '📋' },
  ];

  // Count overdue for badge
  const { data: overdueReminders } = useQuery({
    queryKey: ['reminders', 'overdue-count'],
    queryFn: () => api.getOverdueReminders(),
  });

  const overdueCount = overdueReminders?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.key === 'overdue' && overdueCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {overdueCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading reminders...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-red-900 font-semibold mb-2">Error Loading Reminders</h3>
              <p className="text-red-700">
                {(error as any)?.error?.message || 'Failed to load reminders. Please try again.'}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && reminders && reminders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'upcoming' && '📅'}
                {activeTab === 'overdue' && '🎉'}
                {activeTab === 'completed' && '📝'}
                {activeTab === 'all' && '🔔'}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === 'upcoming' && 'No upcoming reminders'}
                {activeTab === 'overdue' && 'No overdue reminders'}
                {activeTab === 'completed' && 'No completed reminders'}
                {activeTab === 'all' && 'No reminders yet'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'upcoming' && "You're all caught up! No reminders due soon."}
                {activeTab === 'overdue' && "Great job! You don't have any overdue reminders."}
                {activeTab === 'completed' && "Completed reminders will appear here."}
                {activeTab === 'all' && 'Create reminders from a contact page to get started.'}
              </p>
            </div>
          )}

          {/* Reminders List */}
          {!isLoading && !error && reminders && reminders.length > 0 && (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && reminders && reminders.length > 0 && (
        <p className="text-sm text-gray-600 text-center">
          Showing {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

/**
 * Individual reminder card component
 */
function ReminderCard({ reminder }: { reminder: ReminderWithContact }) {
  const { text: relativeTime, isOverdue } = formatRelativeTime(reminder.dueDate);

  return (
    <div
      className={`
        border rounded-lg p-4 transition-colors
        ${reminder.isCompleted
          ? 'bg-gray-50 border-gray-200'
          : isOverdue
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-gray-200 hover:border-blue-300'
        }
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-center gap-2">
            {reminder.isCompleted ? (
              <span className="text-green-600">✓</span>
            ) : isOverdue ? (
              <span className="text-red-500">⚠️</span>
            ) : (
              <span className="text-blue-500">🔔</span>
            )}
            <h3
              className={`font-medium truncate ${
                reminder.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}
            >
              {reminder.title}
            </h3>
          </div>

          {/* Description */}
          {reminder.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {reminder.description}
            </p>
          )}

          {/* Contact Link */}
          <div className="mt-2 flex items-center gap-4 text-sm">
            <Link
              to={`/contacts/${reminder.contact.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {reminder.contact.firstName} {reminder.contact.lastName}
            </Link>
          </div>
        </div>

        {/* Due Date */}
        <div className="text-right shrink-0">
          <div
            className={`text-sm font-medium ${
              reminder.isCompleted
                ? 'text-gray-500'
                : isOverdue
                  ? 'text-red-600'
                  : 'text-gray-900'
            }`}
          >
            {formatDate(reminder.dueDate)}
          </div>
          <div
            className={`text-xs mt-1 ${
              reminder.isCompleted
                ? 'text-gray-400'
                : isOverdue
                  ? 'text-red-500'
                  : 'text-gray-500'
            }`}
          >
            {reminder.isCompleted ? 'Completed' : relativeTime}
          </div>
        </div>
      </div>
    </div>
  );
}
