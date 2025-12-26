export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  socialMedia?: Record<string, string>; // { "twitter": "@user", "linkedin": "user", etc. }
  company?: string;
  jobTitle?: string;
  address?: string;
  birthday?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  socialMedia?: Record<string, string>;
  company?: string;
  jobTitle?: string;
  address?: string;
  birthday?: string;
}

export interface UpdateContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  socialMedia?: Record<string, string>;
  company?: string;
  jobTitle?: string;
  address?: string;
  birthday?: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  type: InteractionType;
  subject?: string;
  notes?: string;
  date: string;
  duration?: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export enum InteractionType {
  CALL = 'CALL',
  MEETING = 'MEETING',
  EMAIL = 'EMAIL',
  TEXT = 'TEXT',
  COFFEE = 'COFFEE',
  LUNCH = 'LUNCH',
  EVENT = 'EVENT',
  OTHER = 'OTHER',
}

export interface CreateInteractionInput {
  type: InteractionType;
  subject?: string;
  notes?: string;
  date?: string;
  duration?: number;
  location?: string;
}

export interface UpdateInteractionInput {
  type?: InteractionType;
  subject?: string;
  notes?: string;
  date?: string;
  duration?: number;
  location?: string;
}

export interface InteractionFilters {
  type?: InteractionType;
  startDate?: string;
  endDate?: string;
}

export interface Reminder {
  id: string;
  contactId: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderWithContact extends Reminder {
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  dueDate: string;
}

export interface UpdateReminderInput {
  title?: string;
  description?: string;
  dueDate?: string;
}

export interface ReminderFilters {
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Note {
  id: string;
  contactId: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteWithContact extends Note {
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateNoteInput {
  content: string;
  isPinned?: boolean;
}

export interface UpdateNoteInput {
  content?: string;
  isPinned?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  contactCount?: number;
}

export interface TagWithContacts extends Tag {
  contacts: Contact[];
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

export interface ContactWithTags extends Contact {
  tags?: Tag[];
}

// ============================================
// Contact Filters & Sorting Types
// ============================================

export type ContactSortField = 'name' | 'email' | 'company' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface ContactFilters {
  tags?: string[];
  company?: string;
  createdAfter?: string;
  createdBefore?: string;
  hasReminders?: boolean;
  hasOverdueReminders?: boolean;
}

export interface ContactSort {
  sortBy: ContactSortField;
  sortOrder: SortOrder;
}

export interface ContactQueryOptions extends ContactFilters {
  sortBy?: ContactSortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ============================================
// Search Types
// ============================================

export type SearchEntityType = 'contact' | 'note' | 'interaction' | 'reminder';

export interface SearchResult {
  id: string;
  entityType: SearchEntityType;
  title: string;
  preview: string;
  relevanceScore: number;
  contactId?: string;
  contactName?: string;
  createdAt: string;
}

export interface GlobalSearchResponse {
  query: string;
  totalResults: number;
  results: SearchResult[];
}

// ============================================
// Dashboard & Stats Types
// ============================================

export interface DashboardStats {
  totalContacts: number;
  contactsThisMonth: number;
  contactsLastMonth: number;
  totalInteractions: number;
  interactionsThisWeek: number;
  interactionsThisMonth: number;
  pendingReminders: number;
  overdueReminders: number;
}

export interface ContactGrowthData {
  month: string; // YYYY-MM format
  count: number;
  cumulative: number;
}

export interface InteractionBreakdown {
  type: string;
  count: number;
  label: string;
}

export type ActivityType = 'interaction' | 'note' | 'reminder';

export interface RecentActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  contactId: string;
  contactName: string;
  timestamp: string;
}
