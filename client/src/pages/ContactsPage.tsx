import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { Modal } from '../components/Modal';
import { ContactForm } from '../components/ContactForm';
import { ContactFilters } from '../components/ContactFilters';
import { TagBadgeList } from '../components/TagBadge';
import { LoadingState, ErrorState, EmptyState } from '../components/ui';
import type {
  ContactWithTags,
  CreateContactInput,
  ContactFilters as ContactFiltersType,
  ContactSortField,
  SortOrder,
  ContactQueryOptions,
} from '../types';

// ============================================
// URL Parsing Helpers
// ============================================

/**
 * Parse URL search params into ContactFilters object
 */
function parseFiltersFromUrl(searchParams: URLSearchParams): ContactFiltersType {
  const filters: ContactFiltersType = {};

  const tags = searchParams.get('tags');
  if (tags) {
    filters.tags = tags.split(',').filter(Boolean);
  }

  const company = searchParams.get('company');
  if (company) {
    filters.company = company;
  }

  const createdAfter = searchParams.get('createdAfter');
  if (createdAfter) {
    filters.createdAfter = createdAfter;
  }

  const createdBefore = searchParams.get('createdBefore');
  if (createdBefore) {
    filters.createdBefore = createdBefore;
  }

  if (searchParams.get('hasReminders') === 'true') {
    filters.hasReminders = true;
  }

  if (searchParams.get('hasOverdueReminders') === 'true') {
    filters.hasOverdueReminders = true;
  }

  return filters;
}

/**
 * Parse sort options from URL search params
 */
function parseSortFromUrl(searchParams: URLSearchParams): { sortBy: ContactSortField; sortOrder: SortOrder } {
  const validSortFields: ContactSortField[] = ['name', 'email', 'company', 'createdAt', 'updatedAt'];
  const validSortOrders: SortOrder[] = ['asc', 'desc'];

  const sortByParam = searchParams.get('sortBy');
  const sortOrderParam = searchParams.get('sortOrder');

  const sortBy = sortByParam && validSortFields.includes(sortByParam as ContactSortField)
    ? (sortByParam as ContactSortField)
    : 'name';

  const sortOrder = sortOrderParam && validSortOrders.includes(sortOrderParam as SortOrder)
    ? (sortOrderParam as SortOrder)
    : 'asc';

  return { sortBy, sortOrder };
}

/**
 * Convert ContactFilters and sort options to URL search params
 */
function optionsToSearchParams(
  filters: ContactFiltersType,
  sortBy: ContactSortField,
  sortOrder: SortOrder
): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.tags && filters.tags.length > 0) {
    params.tags = filters.tags.join(',');
  }
  if (filters.company) {
    params.company = filters.company;
  }
  if (filters.createdAfter) {
    params.createdAfter = filters.createdAfter;
  }
  if (filters.createdBefore) {
    params.createdBefore = filters.createdBefore;
  }
  if (filters.hasReminders) {
    params.hasReminders = 'true';
  }
  if (filters.hasOverdueReminders) {
    params.hasOverdueReminders = 'true';
  }

  // Only include sort params if not default
  if (sortBy !== 'name') {
    params.sortBy = sortBy;
  }
  if (sortOrder !== 'asc') {
    params.sortOrder = sortOrder;
  }

  return params;
}

/**
 * Contacts list page - displays all contacts with search, filtering, and sorting
 */
export function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Parse all filters and sort options from URL
  const filters = useMemo(() => parseFiltersFromUrl(searchParams), [searchParams]);
  const { sortBy, sortOrder } = useMemo(() => parseSortFromUrl(searchParams), [searchParams]);

  const queryClient = useQueryClient();

  // Handle filter changes - update URL params (preserve sort)
  const handleFilterChange = (newFilters: ContactFiltersType) => {
    setSearchParams(optionsToSearchParams(newFilters, sortBy, sortOrder));
  };

  // Handle sort changes - update URL params (preserve filters)
  const handleSortChange = (field: ContactSortField) => {
    let newSortOrder: SortOrder = 'asc';
    // If clicking the same field, toggle direction
    if (field === sortBy) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSearchParams(optionsToSearchParams(filters, field, newSortOrder));
  };

  // Build query options
  const queryOptions: ContactQueryOptions = useMemo(() => ({
    ...filters,
    sortBy,
    sortOrder,
  }), [filters, sortBy, sortOrder]);

  // Fetch contacts based on search, filters, and sort
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts', debouncedSearch, queryOptions],
    queryFn: async (): Promise<ContactWithTags[]> => {
      if (debouncedSearch.trim()) {
        // Search doesn't support advanced filtering/sorting yet, return search results
        return api.searchContacts(debouncedSearch) as Promise<ContactWithTags[]>;
      }
      // Use advanced filtering and sorting
      return api.getContactsWithFilters(queryOptions);
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
        {/* Search input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search contacts by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Advanced filters */}
        <ContactFilters
          filters={filters}
          onChange={handleFilterChange}
        />
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
                <SortableHeader
                  field="name"
                  label="Name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSortChange}
                />
                <SortableHeader
                  field="email"
                  label="Email"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSortChange}
                />
                <SortableHeader
                  field="company"
                  label="Company"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSortChange}
                />
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
          {!searchQuery && Object.keys(filters).length > 0 && ' (filtered)'}
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

// ============================================
// Sortable Header Component
// ============================================

interface SortableHeaderProps {
  field: ContactSortField;
  label: string;
  currentSortBy: ContactSortField;
  currentSortOrder: SortOrder;
  onSort: (field: ContactSortField) => void;
}

/**
 * Sortable table header with visual indicator
 */
function SortableHeader({
  field,
  label,
  currentSortBy,
  currentSortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSortBy === field;

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className="flex flex-col">
          {/* Up arrow */}
          <svg
            className={`w-3 h-3 -mb-1 ${
              isActive && currentSortOrder === 'asc'
                ? 'text-blue-600'
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {/* Down arrow */}
          <svg
            className={`w-3 h-3 -mt-1 ${
              isActive && currentSortOrder === 'desc'
                ? 'text-blue-600'
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </th>
  );
}
