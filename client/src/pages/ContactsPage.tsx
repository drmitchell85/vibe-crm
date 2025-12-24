import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { Modal } from '../components/Modal';
import { ContactForm } from '../components/ContactForm';
import { TagFilter } from '../components/TagSelector';
import { TagBadgeList } from '../components/TagBadge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui';
import type { ContactWithTags, CreateContactInput } from '../types';

/**
 * Contacts list page - displays all contacts with search and tag filtering
 */
export function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get tag filter from URL
  const tagFilterParam = searchParams.get('tags');
  const selectedTagIds = tagFilterParam ? tagFilterParam.split(',').filter(Boolean) : [];

  const queryClient = useQueryClient();

  // Handle tag filter changes
  const handleTagFilterChange = (tagIds: string[]) => {
    if (tagIds.length > 0) {
      setSearchParams({ tags: tagIds.join(',') });
    } else {
      setSearchParams({});
    }
  };

  // Fetch contacts based on search and tag filters
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts', debouncedSearch, selectedTagIds],
    queryFn: async (): Promise<ContactWithTags[]> => {
      if (debouncedSearch.trim()) {
        // Search doesn't support tag filtering yet, return search results
        return api.searchContacts(debouncedSearch) as Promise<ContactWithTags[]>;
      }
      // Use tag filtering if tags are selected
      if (selectedTagIds.length > 0) {
        return api.getContactsWithTags(selectedTagIds);
      }
      return api.getContactsWithTags();
    },
  });

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateContactInput) => api.createContact(data),
    onSuccess: () => {
      // Invalidate and refetch contacts
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsCreateModalOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Contact
        </button>
      </div>

      {/* Create Contact Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Contact"
        size="xl"
      >
        <ContactForm
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data as CreateContactInput);
          }}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search contacts by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <TagFilter
            selectedTagIds={selectedTagIds}
            onChange={handleTagFilterChange}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow">
          <LoadingState message="Loading contacts..." size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Error Loading Contacts"
          message={(error as any)?.error?.message || 'Failed to load contacts. Please try again.'}
          size="md"
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && contacts && contacts.length === 0 && (
        <div className="bg-white rounded-lg shadow">
          <EmptyState
            icon="👥"
            title={searchQuery ? 'No contacts found' : 'No contacts yet'}
            description={
              searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : 'Get started by adding your first contact.'
            }
            size="lg"
            action={!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Add Your First Contact
              </button>
            )}
          />
        </div>
      )}

      {/* Contacts List */}
      {!isLoading && !error && contacts && contacts.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <ContactRow key={contact.id} contact={contact} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && contacts && contacts.length > 0 && (
        <p className="text-sm text-gray-600 text-center">
          Showing {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      )}
    </div>
  );
}

/**
 * Individual contact row component
 */
function ContactRow({ contact }: { contact: ContactWithTags }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          to={`/contacts/${contact.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {contact.firstName} {contact.lastName}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{contact.email || '-'}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{contact.company || '-'}</span>
      </td>
      <td className="px-6 py-4">
        {contact.tags && contact.tags.length > 0 ? (
          <TagBadgeList tags={contact.tags} size="sm" maxDisplay={3} />
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          to={`/contacts/${contact.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
