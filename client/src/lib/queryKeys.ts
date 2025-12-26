/**
 * Centralized query key factory for React Query.
 *
 * Benefits:
 * - Consistent cache key structure across the app
 * - Easy to invalidate related queries
 * - Type-safe query key generation
 * - Hierarchical invalidation (e.g., invalidate all contacts queries)
 */

import type { ContactQueryOptions, InteractionFilters, ReminderFilters } from '../types';

export const queryKeys = {
  // Contacts
  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (options?: ContactQueryOptions) => [...queryKeys.contacts.lists(), options] as const,
    search: (query: string) => [...queryKeys.contacts.all, 'search', query] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
    companies: () => [...queryKeys.contacts.all, 'companies'] as const,
  },

  // Tags
  tags: {
    all: ['tags'] as const,
    lists: () => [...queryKeys.tags.all, 'list'] as const,
    list: () => [...queryKeys.tags.lists()] as const,
    details: () => [...queryKeys.tags.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tags.details(), id] as const,
    contacts: (tagId: string) => [...queryKeys.tags.all, 'contacts', tagId] as const,
  },

  // Interactions
  interactions: {
    all: ['interactions'] as const,
    forContact: (contactId: string) => [...queryKeys.interactions.all, 'contact', contactId] as const,
    list: (contactId: string, filters?: InteractionFilters) =>
      [...queryKeys.interactions.forContact(contactId), filters] as const,
    details: () => [...queryKeys.interactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.interactions.details(), id] as const,
  },

  // Reminders
  reminders: {
    all: ['reminders'] as const,
    lists: () => [...queryKeys.reminders.all, 'list'] as const,
    list: (filters?: ReminderFilters) => [...queryKeys.reminders.lists(), filters] as const,
    forContact: (contactId: string) => [...queryKeys.reminders.all, 'contact', contactId] as const,
    upcoming: (limit?: number) => [...queryKeys.reminders.all, 'upcoming', limit] as const,
    overdue: () => [...queryKeys.reminders.all, 'overdue'] as const,
    details: () => [...queryKeys.reminders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reminders.details(), id] as const,
  },

  // Notes
  notes: {
    all: ['notes'] as const,
    forContact: (contactId: string) => [...queryKeys.notes.all, 'contact', contactId] as const,
    details: () => [...queryKeys.notes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.notes.details(), id] as const,
  },

  // Search
  search: {
    all: ['search'] as const,
    global: (query: string, limit?: number) => [...queryKeys.search.all, 'global', query, limit] as const,
  },

  // Stats/Dashboard
  stats: {
    all: ['stats'] as const,
    dashboard: () => [...queryKeys.stats.all, 'dashboard'] as const,
    growth: () => [...queryKeys.stats.all, 'growth'] as const,
    interactions: () => [...queryKeys.stats.all, 'interactions'] as const,
    activity: (limit?: number) => [...queryKeys.stats.all, 'activity', limit] as const,
  },
} as const;
