import { Spinner } from './Spinner';

interface DeleteConfirmationProps {
  /** Whether to show the confirmation dialog */
  show: boolean;
  /** Type of item being deleted (e.g., "interaction", "reminder") */
  itemType: string;
  /** Called when user confirms deletion */
  onConfirm: () => void;
  /** Called when user cancels deletion */
  onCancel: () => void;
  /** Whether deletion is in progress */
  isDeleting?: boolean;
}

/**
 * Inline delete confirmation component for forms
 * Shows a warning message with confirm/cancel buttons
 */
export function DeleteConfirmation({
  show,
  itemType,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmationProps) {
  if (!show) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <p className="text-red-800 dark:text-red-300 text-sm mb-3">
        Are you sure you want to delete this {itemType}? This action cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {isDeleting && <Spinner size="xs" color="white" />}
          Yes, Delete
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
