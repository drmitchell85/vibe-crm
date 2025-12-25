import { useState } from 'react';
import { Spinner } from './ui';
import {
  labelStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
  dangerButtonStyles,
} from '../lib/formStyles';
import type { Note, CreateNoteInput, UpdateNoteInput } from '../types';

interface NoteFormProps {
  note?: Note;
  onSubmit: (data: CreateNoteInput | UpdateNoteInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

/**
 * Form for creating or editing a note
 *
 * Features:
 * - Content textarea with character count
 * - Pin checkbox option
 * - Delete option for existing notes
 */
export function NoteForm({
  note,
  onSubmit,
  onCancel,
  onDelete,
  isLoading = false,
  isDeleting = false,
}: NoteFormProps) {
  const [content, setContent] = useState(note?.content || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!note;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      await onSubmit({ content: content.trim(), isPinned });
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to save note');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Note content */}
      <div>
        <label htmlFor="noteContent" className={labelStyles}>
          Note *
        </label>
        <textarea
          id="noteContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Write your note here..."
          disabled={isLoading}
          autoFocus
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {content.length} characters
        </p>
      </div>

      {/* Pin checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPinned"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 text-amber-600 border-gray-300 dark:border-gray-600 rounded focus:ring-amber-500"
        />
        <label htmlFor="isPinned" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <svg
            className="w-4 h-4 text-amber-500 dark:text-amber-400"
            fill={isPinned ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          Pin this note
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">(Pinned notes appear at the top)</span>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isLoading || isDeleting}
              className={dangerButtonStyles}
            >
              {isDeleting ? (
                <>
                  <Spinner size="xs" color="white" />
                  Deleting...
                </>
              ) : (
                'Delete Note'
              )}
            </button>
          )}
        </div>
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
            disabled={isLoading || isDeleting || !content.trim()}
            className={`${primaryButtonStyles} disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Spinner size="xs" color="white" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Note'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
