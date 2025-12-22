import { useState, FormEvent } from 'react';
import { Reminder, CreateReminderInput, UpdateReminderInput } from '../types';
import { formatDateForInput } from '../lib/dateUtils';
import { FormError, DeleteConfirmation } from './ui';
import {
  inputStyles,
  textareaStyles,
  labelStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
  dangerButtonStyles,
} from '../lib/formStyles';

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
      <FormError message={error} />

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelStyles}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What do you need to remember?"
          className={inputStyles}
          autoFocus
        />
      </div>

      {/* Due Date and Time */}
      <div>
        <label htmlFor="dueDate" className={labelStyles}>
          Due Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className={inputStyles}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelStyles}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Additional details about this reminder..."
          className={textareaStyles}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        show={showDeleteConfirm}
        itemType="reminder"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDeleting={isDeleting}
      />

      {/* Form Actions */}
      <div className="flex justify-between pt-4 border-t">
        {/* Delete button (only in edit mode) */}
        <div>
          {isEditMode && onDelete && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading || isDeleting}
              className={dangerButtonStyles}
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
            className={secondaryButtonStyles}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isDeleting}
            className={primaryButtonStyles}
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
