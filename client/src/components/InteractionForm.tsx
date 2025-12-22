import { useState, FormEvent } from 'react';
import { Interaction, CreateInteractionInput, UpdateInteractionInput, InteractionType } from '../types';
import { formatDateForInput } from '../lib/dateUtils';
import { INTERACTION_TYPES_LIST } from '../constants/interactionTypes';
import { FormError, DeleteConfirmation } from './ui';
import {
  inputStyles,
  selectStyles,
  textareaStyles,
  labelStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
  dangerButtonStyles,
} from '../lib/formStyles';

interface InteractionFormProps {
  interaction?: Interaction; // If provided, form is in "edit" mode
  onSubmit: (data: CreateInteractionInput | UpdateInteractionInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void; // Only available in edit mode
  isLoading?: boolean;
  isDeleting?: boolean;
}

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
      <FormError message={error} />

      {/* Interaction Type */}
      <div>
        <label htmlFor="type" className={labelStyles}>
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className={selectStyles}
        >
          {INTERACTION_TYPES_LIST.map((config) => (
            <option key={config.type} value={config.type}>
              {config.icon} {config.formLabel}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className={labelStyles}>
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Brief description of the interaction"
          className={inputStyles}
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className={labelStyles}>
            Date & Time
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={inputStyles}
          />
        </div>

        <div>
          <label htmlFor="duration" className={labelStyles}>
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
            className={inputStyles}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className={labelStyles}>
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Where did this take place?"
          className={inputStyles}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelStyles}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Details about what was discussed, action items, follow-ups..."
          className={textareaStyles}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        show={showDeleteConfirm}
        itemType="interaction"
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
            {isEditMode ? 'Update Interaction' : 'Log Interaction'}
          </button>
        </div>
      </div>
    </form>
  );
}
