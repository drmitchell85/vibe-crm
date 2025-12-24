import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { NoteCard } from './NoteCard';
import { LoadingState, ErrorState, EmptyState } from './ui';
import type { Note } from '../types';

interface NotesListProps {
  contactId: string;
  onAddNote?: () => void;
  onEditNote?: (note: Note) => void;
}

/**
 * Notes List component - displays notes for a contact
 *
 * Features:
 * - Fetches notes from API (pinned first, then by date)
 * - Pin/unpin toggle with optimistic updates
 * - Add and edit callbacks for modal handling
 */
export function NotesList({ contactId, onAddNote, onEditNote }: NotesListProps) {
  const queryClient = useQueryClient();

  const {
    data: notes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notes', contactId],
    queryFn: () => api.getNotesForContact(contactId),
    enabled: !!contactId,
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: (noteId: string) => api.toggleNotePin(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', contactId] });
    },
  });

  // Count pinned notes
  const pinnedCount = notes?.filter(n => n.isPinned).length || 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
          {notes && notes.length > 0 && (
            <span className="text-sm text-gray-500">
              ({notes.length})
            </span>
          )}
          {pinnedCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              {pinnedCount} pinned
            </span>
          )}
        </div>
        {onAddNote && (
          <button
            onClick={onAddNote}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Note
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <LoadingState message="Loading notes..." size="md" />
      )}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Error Loading Notes"
          message={(error as any)?.error?.message || 'Failed to load notes'}
          size="sm"
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && notes && notes.length === 0 && (
        <EmptyState
          icon="📝"
          title="No notes yet"
          description="Add notes to keep track of important details about this contact."
          size="md"
          action={onAddNote && (
            <button
              onClick={onAddNote}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Your First Note
            </button>
          )}
        />
      )}

      {/* Notes Grid */}
      {!isLoading && !error && notes && notes.length > 0 && (
        <div className="p-6 space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => onEditNote?.(note)}
              onTogglePin={() => togglePinMutation.mutate(note.id)}
              isPinning={togglePinMutation.isPending && togglePinMutation.variables === note.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
