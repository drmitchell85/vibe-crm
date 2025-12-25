import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Modal } from '../components/Modal';
import { ReminderForm } from '../components/ReminderForm';
import { LoadingState, ErrorState, EmptyState } from '../components/ui';
import { formatRelativeTime, formatDisplayDate } from '../lib/dateUtils';
import type { ReminderWithContact, CreateReminderInput, UpdateReminderInput } from '../types';

type TabType = 'all' | 'upcoming' | 'overdue' | 'completed';

/**
 * Reminders page - displays all reminders with tab-based filtering
 */
export function RemindersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderWithContact | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch contacts for the dropdown
  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.getAllContacts(),
  });

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

  // Count overdue for badge
  const { data: overdueReminders } = useQuery({
    queryKey: ['reminders', 'overdue-count'],
    queryFn: () => api.getOverdueReminders(),
  });

  const overdueCount = overdueReminders?.length || 0;

  // Create reminder mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateReminderInput) => api.createReminder(selectedContactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setIsCreateModalOpen(false);
      setSelectedContactId('');
    },
  });

  // Update reminder mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderInput }) =>
      api.updateReminder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setSelectedReminder(null);
    },
  });

  // Delete reminder mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setSelectedReminder(null);
    },
  });

  // Mark complete/incomplete mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      isCompleted ? api.markReminderComplete(id) : api.markReminderIncomplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'upcoming', label: 'Upcoming', icon: '📅' },
    { key: 'overdue', label: 'Overdue', icon: '⚠️' },
    { key: 'completed', label: 'Completed', icon: '✅' },
    { key: 'all', label: 'All', icon: '📋' },
  ];

  const handleOpenCreateModal = () => {
    setSelectedContactId('');
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reminders</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
        >
          + Add Reminder
        </button>
      </div>

      {/* Create Reminder Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Reminder"
        size="lg"
      >
        <div className="space-y-6">
          {/* Contact Selector */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact <span className="text-red-500">*</span>
            </label>
            <select
              id="contact"
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a contact...</option>
              {contacts?.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                  {contact.company && ` (${contact.company})`}
                </option>
              ))}
            </select>
          </div>

          {/* Show form only when contact is selected */}
          {selectedContactId ? (
            <ReminderForm
              onSubmit={async (data) => {
                await createMutation.mutateAsync(data as CreateReminderInput);
              }}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={createMutation.isPending}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Please select a contact to create a reminder.
            </p>
          )}
        </div>
      </Modal>

      {/* Edit Reminder Modal */}
      <Modal
        isOpen={!!selectedReminder}
        onClose={() => setSelectedReminder(null)}
        title={`Edit Reminder for ${selectedReminder?.contact.firstName} ${selectedReminder?.contact.lastName}`}
        size="lg"
      >
        {selectedReminder && (
          <ReminderForm
            reminder={selectedReminder}
            onSubmit={async (data) => {
              await updateMutation.mutateAsync({
                id: selectedReminder.id,
                data: data as UpdateReminderInput,
              });
            }}
            onCancel={() => setSelectedReminder(null)}
            onDelete={() => deleteMutation.mutate(selectedReminder.id)}
            isLoading={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </Modal>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.key
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
          {isLoading && <LoadingState message="Loading reminders..." size="lg" />}

          {/* Error State */}
          {error && (
            <ErrorState
              title="Error Loading Reminders"
              message={(error as any)?.error?.message || 'Failed to load reminders. Please try again.'}
              size="md"
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && reminders && reminders.length === 0 && (
            <EmptyState
              icon={
                activeTab === 'upcoming' ? '📅' :
                activeTab === 'overdue' ? '🎉' :
                activeTab === 'completed' ? '📝' : '🔔'
              }
              title={
                activeTab === 'upcoming' ? 'No upcoming reminders' :
                activeTab === 'overdue' ? 'No overdue reminders' :
                activeTab === 'completed' ? 'No completed reminders' : 'No reminders yet'
              }
              description={
                activeTab === 'upcoming' ? "You're all caught up! No reminders due soon." :
                activeTab === 'overdue' ? "Great job! You don't have any overdue reminders." :
                activeTab === 'completed' ? "Completed reminders will appear here." :
                'Create your first reminder to get started.'
              }
              size="lg"
              action={activeTab === 'all' && (
                <button
                  onClick={handleOpenCreateModal}
                  className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                >
                  + Create Your First Reminder
                </button>
              )}
            />
          )}

          {/* Reminders List */}
          {!isLoading && !error && reminders && reminders.length > 0 && (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={() => setSelectedReminder(reminder)}
                  onToggleComplete={(isCompleted) =>
                    toggleCompleteMutation.mutate({ id: reminder.id, isCompleted })
                  }
                  isToggling={toggleCompleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && reminders && reminders.length > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Showing {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

/**
 * Individual reminder card component
 */
function ReminderCard({
  reminder,
  onEdit,
  onToggleComplete,
  isToggling,
}: {
  reminder: ReminderWithContact;
  onEdit: () => void;
  onToggleComplete: (isCompleted: boolean) => void;
  isToggling: boolean;
}) {
  const { text: relativeTime, isOverdue } = formatRelativeTime(reminder.dueDate);

  return (
    <div
      className={`
        border rounded-lg p-4 transition-colors
        ${reminder.isCompleted
          ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
          : isOverdue
            ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(!reminder.isCompleted)}
          disabled={isToggling}
          className={`
            mt-1 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
            ${reminder.isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
            }
            ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={reminder.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {reminder.isCompleted && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-center gap-2">
            {!reminder.isCompleted && isOverdue && (
              <span className="text-red-500">⚠️</span>
            )}
            <h3
              className={`font-medium truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${
                reminder.isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'
              }`}
              onClick={onEdit}
            >
              {reminder.title}
            </h3>
          </div>

          {/* Description */}
          {reminder.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {reminder.description}
            </p>
          )}

          {/* Contact Link */}
          <div className="mt-2 flex items-center gap-4 text-sm">
            <Link
              to={`/contacts/${reminder.contact.id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              {reminder.contact.firstName} {reminder.contact.lastName}
            </Link>
            <button
              onClick={onEdit}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Due Date */}
        <div className="text-right shrink-0">
          <div
            className={`text-sm font-medium ${
              reminder.isCompleted
                ? 'text-gray-500 dark:text-gray-400'
                : isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {formatDisplayDate(reminder.dueDate)}
          </div>
          <div
            className={`text-xs mt-1 ${
              reminder.isCompleted
                ? 'text-gray-400 dark:text-gray-500'
                : isOverdue
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {reminder.isCompleted ? 'Completed' : relativeTime}
          </div>
        </div>
      </div>
    </div>
  );
}
