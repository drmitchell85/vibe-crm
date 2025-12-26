import { format, formatDistanceToNow } from 'date-fns';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit?: () => void;
  onTogglePin?: () => void;
  isPinning?: boolean;
}

/**
 * Displays a single note card with pin indicator and timestamps
 *
 * Features:
 * - Pin indicator icon for pinned notes
 * - Clickable to edit
 * - Relative time display for recent notes
 * - Full timestamp on hover
 */
export function NoteCard({ note, onEdit, onTogglePin, isPinning = false }: NoteCardProps) {
  const createdDate = new Date(note.createdAt);
  const updatedDate = new Date(note.updatedAt);
  const wasEdited = note.updatedAt !== note.createdAt;

  // Format relative time for recent notes (e.g., "2 hours ago")
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });
  // Format full timestamp for tooltip
  const fullTimestamp = format(createdDate, 'PPpp');
  const editedTimestamp = wasEdited ? format(updatedDate, 'PPpp') : null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow ${
        note.isPinned ? 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Header with pin and actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Pin indicator/toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin?.();
            }}
            disabled={isPinning}
            className={`p-1 rounded transition-colors ${
              note.isPinned
                ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            } ${isPinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <svg
              className="w-4 h-4"
              fill={note.isPinned ? 'currentColor' : 'none'}
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
          </button>
          {note.isPinned && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pinned</span>
          )}
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Edit note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Note content */}
      <div
        className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words cursor-pointer"
        onClick={onEdit}
      >
        {note.content}
      </div>

      {/* Timestamp */}
      <div className="mt-3 text-xs text-gray-400 dark:text-gray-500" title={fullTimestamp}>
        {relativeTime}
        {wasEdited && (
          <span className="ml-2" title={`Edited ${editedTimestamp}`}>
            (edited)
          </span>
        )}
      </div>
    </div>
  );
}
