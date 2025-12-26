import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Modal } from '../components/Modal';
import { TagForm } from '../components/TagForm';
import { TagBadge } from '../components/TagBadge';
import { LoadingState, ErrorState, EmptyState, Spinner } from '../components/ui';
import type { Tag, CreateTagInput, UpdateTagInput } from '../types';

/**
 * Tags management page - displays all tags with CRUD operations
 *
 * Features:
 * - List all tags with contact counts
 * - Create new tags with color picker
 * - Edit existing tags
 * - Delete tags with confirmation
 */
export function TagsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const queryClient = useQueryClient();

  // Fetch all tags
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.getAllTags(),
  });

  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTagInput) => api.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsCreateModalOpen(false);
    },
  });

  // Update tag mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagInput }) =>
      api.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setEditingTag(null);
    },
  });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeletingTag(null);
      setEditingTag(null);
    },
  });

  const handleCreateSubmit = async (data: CreateTagInput | UpdateTagInput) => {
    await createMutation.mutateAsync(data as CreateTagInput);
  };

  const handleUpdateSubmit = async (data: CreateTagInput | UpdateTagInput) => {
    if (editingTag) {
      await updateMutation.mutateAsync({ id: editingTag.id, data: data as UpdateTagInput });
    }
  };

  const handleDelete = () => {
    if (editingTag) {
      setDeletingTag(editingTag);
    }
  };

  const confirmDelete = () => {
    if (deletingTag) {
      deleteMutation.mutate(deletingTag.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tags</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Organize your contacts with custom tags
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
        >
          + Create Tag
        </button>
      </div>

      {/* Create Tag Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Tag"
        size="md"
      >
        <TagForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Tag Modal */}
      <Modal
        isOpen={!!editingTag && !deletingTag}
        onClose={() => setEditingTag(null)}
        title="Edit Tag"
        size="md"
      >
        {editingTag && (
          <TagForm
            tag={editingTag}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingTag(null)}
            onDelete={handleDelete}
            isLoading={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTag}
        onClose={() => setDeletingTag(null)}
        title="Delete Tag"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the tag{' '}
            <strong>"{deletingTag?.name}"</strong>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This will remove the tag from all contacts. The contacts themselves
            will not be deleted.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingTag(null)}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {deleteMutation.isPending && <Spinner size="xs" color="white" />}
              Delete Tag
            </button>
          </div>
        </div>
      </Modal>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <LoadingState message="Loading tags..." size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Error Loading Tags"
          message={(error as any)?.error?.message || 'Failed to load tags. Please try again.'}
          size="md"
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && tags && tags.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <EmptyState
            icon="🏷️"
            title="No tags yet"
            description="Create your first tag to start organizing your contacts."
            size="lg"
            action={
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                + Create Your First Tag
              </button>
            }
          />
        </div>
      )}

      {/* Tags Grid */}
      {!isLoading && !error && tags && tags.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onClick={() => setEditingTag(tag)}
            />
          ))}
        </div>
      )}

      {/* Tags Count */}
      {!isLoading && tags && tags.length > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {tags.length} tag{tags.length !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  );
}

/**
 * Individual tag card component
 */
function TagCard({ tag, onClick }: { tag: Tag; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-start justify-between">
        <TagBadge tag={tag} />
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {tag.contactCount !== undefined ? (
          <span>
            {tag.contactCount} contact{tag.contactCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">—</span>
        )}
      </div>
    </button>
  );
}
