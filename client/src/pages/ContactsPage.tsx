import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import type { Contact } from '../types';

/**
 * Contacts list page - displays all contacts with search functionality
 */
export function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Fetch contacts based on debounced search query
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts', debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.trim()) {
        return api.searchContacts(debouncedSearch);
      }
      return api.getAllContacts();
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + Add Contact
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search contacts by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Contacts</h3>
          <p className="text-red-700">
            {(error as any)?.error?.message || 'Failed to load contacts. Please try again.'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && contacts && contacts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search.`
              : 'Get started by adding your first contact.'}
          </p>
          {!searchQuery && (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              + Add Your First Contact
            </button>
          )}
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
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Social
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
function ContactRow({ contact }: { contact: Contact }) {
  const socialPlatforms = contact.socialMedia
    ? Object.keys(contact.socialMedia).slice(0, 2) // Show first 2 platforms
    : [];

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
        <span className="text-sm text-gray-900">{contact.phone || '-'}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{contact.company || '-'}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {socialPlatforms.length > 0 ? (
          <div className="flex gap-1">
            {socialPlatforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                title={`${platform}: ${contact.socialMedia![platform]}`}
              >
                {platform}
              </span>
            ))}
            {contact.socialMedia && Object.keys(contact.socialMedia).length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                +{Object.keys(contact.socialMedia).length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          to={`/contacts/${contact.id}`}
          className="text-blue-600 hover:text-blue-900 mr-4"
        >
          View
        </Link>
        <button className="text-gray-600 hover:text-gray-900">Edit</button>
      </td>
    </tr>
  );
}
