import { useState, FormEvent } from 'react';
import { format } from 'date-fns';
import { Interaction, CreateInteractionInput, UpdateInteractionInput, InteractionType } from '../types';

interface InteractionFormProps {
  interaction?: Interaction; // If provided, form is in "edit" mode
  onSubmit: (data: CreateInteractionInput | UpdateInteractionInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void; // Only available in edit mode
  isLoading?: boolean;
  isDeleting?: boolean;
}

/**
 * Interaction type options with labels
 */
const INTERACTION_TYPES: { value: InteractionType; label: string; icon: string }[] = [
  { value: InteractionType.CALL, label: 'Phone Call', icon: '📞' },
  { value: InteractionType.MEETING, label: 'Meeting', icon: '🤝' },
  { value: InteractionType.EMAIL, label: 'Email', icon: '✉️' },
  { value: InteractionType.TEXT, label: 'Text Message', icon: '💬' },
  { value: InteractionType.COFFEE, label: 'Coffee', icon: '☕' },
  { value: InteractionType.LUNCH, label: 'Lunch', icon: '🍽️' },
  { value: InteractionType.EVENT, label: 'Event', icon: '🎉' },
  { value: InteractionType.OTHER, label: 'Other', icon: '📝' },
];

/**
 * Reusable interaction form component for creating and editing interactions
 */
export function InteractionForm({
  interaction,
  onSubmit,
  onCancel,
  onDelete,
  isLoading = false,
  isDeleting = false,
}: InteractionFormProps) {
  const isEditMode = !!interaction;

  // Format existing date for datetime-local input
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return format(new Date(), "yyyy-MM-dd'T'HH:mm");
    return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
  };

  // Form state
  const [formData, setFormData] = useState({
    type: interaction?.type || InteractionType.MEETING,
    subject: interaction?.subject || '',
    notes: interaction?.notes || '',
    date: formatDateForInput(interaction?.date),
    duration: interaction?.duration?.toString() || '',
    location: interaction?.location || '',
  });

  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'type' ? (value as InteractionType) : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData: CreateInteractionInput = {
        type: formData.type,
        subject: formData.subject || undefined,
        notes: formData.notes || undefined,
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
        duration: formData.duration ? parseInt(formData.duration, 10) : undefined,
        location: formData.location || undefined,
      };

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to save interaction');
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

      {/* Interaction Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
        >
          {INTERACTION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Brief description of the interaction"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 30"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Where did this take place?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Details about what was discussed, action items, follow-ups..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm mb-3">
            Are you sure you want to delete this interaction? This action cannot be undone.
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
            {isEditMode ? 'Update Interaction' : 'Log Interaction'}
          </button>
        </div>
      </div>
    </form>
  );
}
