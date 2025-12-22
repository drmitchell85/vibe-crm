import { useState, FormEvent } from 'react';
import { Reminder, CreateReminderInput, UpdateReminderInput } from '../types';
import { formatDateForInput } from '../lib/dateUtils';

interface ReminderFormProps {
  reminder?: Reminder; // If provided, form is in "edit" mode
  onSubmit: (data: CreateReminderInput | UpdateReminderInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void; // Only available in edit mode
  isLoading?: boolean;
  isDeleting?: boolean;
}

/**
 * Reusable reminder form component for creating and editing reminders
 */
export function ReminderForm({
  reminder,
  onSubmit,
  onCancel,
  onDelete,
  isLoading = false,
  isDeleting = false,
}: ReminderFormProps) {
  const isEditMode = !!reminder;

  // Form state - use defaultToTomorrow for new reminders
  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    description: reminder?.description || '',
    dueDate: formatDateForInput(reminder?.dueDate, true), // Default to tomorrow at 9 AM
  });

  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      const submitData: CreateReminderInput = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to save reminder');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What do you need to remember?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          autoFocus
        />
      </div>

      {/* Due Date and Time */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Additional details about this reminder..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm mb-3">
            Are you sure you want to delete this reminder? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Yes, Delete
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-between pt-4 border-t">
        {/* Delete button (only in edit mode) */}
        <div>
          {isEditMode && onDelete && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading || isDeleting}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>

        {/* Submit/Cancel buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading || isDeleting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isDeleting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isEditMode ? 'Update Reminder' : 'Create Reminder'}
          </button>
        </div>
      </div>
    </form>
  );
}
