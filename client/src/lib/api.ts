import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Contact,
  ContactWithTags,
  CreateContactInput,
  UpdateContactInput,
  ContactQueryOptions,
  PaginationMeta,
  Interaction,
  CreateInteractionInput,
  UpdateInteractionInput,
  InteractionFilters,
  Reminder,
  ReminderWithContact,
  CreateReminderInput,
  UpdateReminderInput,
  ReminderFilters,
  Tag,
  CreateTagInput,
  UpdateTagInput,
  Note,
  NoteWithContact,
  CreateNoteInput,
  UpdateNoteInput,
  GlobalSearchResponse,
  DashboardStats,
  ContactGrowthData,
  InteractionBreakdown,
  RecentActivityItem,
} from '../types';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  pagination?: PaginationMeta;
}

/**
 * Paginated contacts response
 */
export interface PaginatedContactsResponse {
  contacts: ContactWithTags[];
  pagination: PaginationMeta;
}

/**
 * API Client class for making requests to the FPH CRM backend
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Response interceptor to unwrap data
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        return response;
      },
      (error) => {
        // Handle errors gracefully
        if (error.response?.data) {
          throw error.response.data;
        }
        throw {
          success: false,
          error: {
            message: error.message || 'An unexpected error occurred',
            code: 'NETWORK_ERROR',
          },
        };
      }
    );
  }

  // ============================================
  // Contact Endpoints
  // ============================================

  /**
   * Get all contacts
   */
  async getAllContacts(): Promise<Contact[]> {
    const response = await this.client.get<ApiResponse<Contact[]>>('/contacts');
    return response.data.data;
  }

  /**
   * Get a single contact by ID (with tags normalized)
   */
  async getContactById(id: string): Promise<ContactWithTags> {
    const response = await this.client.get<ApiResponse<any>>(`/contacts/${id}`);
    return normalizeContactTags(response.data.data);
  }

  /**
   * Create a new contact
   */
  async createContact(data: CreateContactInput): Promise<Contact> {
    const response = await this.client.post<ApiResponse<Contact>>('/contacts', data);
    return response.data.data;
  }

  /**
   * Update an existing contact
   */
  async updateContact(id: string, data: UpdateContactInput): Promise<Contact> {
    const response = await this.client.put<ApiResponse<Contact>>(`/contacts/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a contact
   */
  async deleteContact(id: string): Promise<void> {
    await this.client.delete(`/contacts/${id}`);
  }

  /**
   * Search contacts by query string
   */
  async searchContacts(query: string): Promise<Contact[]> {
    const response = await this.client.get<ApiResponse<Contact[]>>('/contacts/search', {
      params: { q: query },
    });
    return response.data.data;
  }

  // ============================================
  // Interaction Endpoints
  // ============================================

  /**
   * Get all interactions for a contact with optional filters
   */
  async getInteractionsForContact(
    contactId: string,
    filters?: InteractionFilters
  ): Promise<Interaction[]> {
    const params: Record<string, string> = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const response = await this.client.get<ApiResponse<Interaction[]>>(
      `/contacts/${contactId}/interactions`,
      { params }
    );
    return response.data.data;
  }

  /**
   * Get a single interaction by ID
   */
  async getInteractionById(id: string): Promise<Interaction> {
    const response = await this.client.get<ApiResponse<Interaction>>(
      `/interactions/${id}`
    );
    return response.data.data;
  }

  /**
   * Create a new interaction for a contact
   */
  async createInteraction(
    contactId: string,
    data: CreateInteractionInput
  ): Promise<Interaction> {
    const response = await this.client.post<ApiResponse<Interaction>>(
      `/contacts/${contactId}/interactions`,
      data
    );
    return response.data.data;
  }

  /**
   * Update an existing interaction
   */
  async updateInteraction(
    id: string,
    data: UpdateInteractionInput
  ): Promise<Interaction> {
    const response = await this.client.put<ApiResponse<Interaction>>(
      `/interactions/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete an interaction
   */
  async deleteInteraction(id: string): Promise<void> {
    await this.client.delete(`/interactions/${id}`);
  }

  // ============================================
  // Reminder Endpoints
  // ============================================

  /**
   * Get all reminders for a contact with optional filters
   */
  async getRemindersForContact(
    contactId: string,
    filters?: ReminderFilters
  ): Promise<Reminder[]> {
    const params: Record<string, string> = {};
    if (filters?.isCompleted !== undefined) params.isCompleted = String(filters.isCompleted);
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const response = await this.client.get<ApiResponse<Reminder[]>>(
      `/contacts/${contactId}/reminders`,
      { params }
    );
    return response.data.data;
  }

  /**
   * Get all reminders with optional filters (for reminders page)
   */
  async getAllReminders(filters?: ReminderFilters): Promise<ReminderWithContact[]> {
    const params: Record<string, string> = {};
    if (filters?.isCompleted !== undefined) params.isCompleted = String(filters.isCompleted);
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const response = await this.client.get<ApiResponse<ReminderWithContact[]>>(
      '/reminders',
      { params }
    );
    return response.data.data;
  }

  /**
   * Get upcoming incomplete reminders (for dashboard widget)
   */
  async getUpcomingReminders(limit?: number): Promise<ReminderWithContact[]> {
    const params: Record<string, string> = {};
    if (limit !== undefined) params.limit = String(limit);

    const response = await this.client.get<ApiResponse<ReminderWithContact[]>>(
      '/reminders/upcoming',
      { params }
    );
    return response.data.data;
  }

  /**
   * Get overdue incomplete reminders
   */
  async getOverdueReminders(): Promise<ReminderWithContact[]> {
    const response = await this.client.get<ApiResponse<ReminderWithContact[]>>(
      '/reminders/overdue'
    );
    return response.data.data;
  }

  /**
   * Get a single reminder by ID
   */
  async getReminderById(id: string): Promise<ReminderWithContact> {
    const response = await this.client.get<ApiResponse<ReminderWithContact>>(
      `/reminders/${id}`
    );
    return response.data.data;
  }

  /**
   * Create a new reminder for a contact
   */
  async createReminder(
    contactId: string,
    data: CreateReminderInput
  ): Promise<Reminder> {
    const response = await this.client.post<ApiResponse<Reminder>>(
      `/contacts/${contactId}/reminders`,
      data
    );
    return response.data.data;
  }

  /**
   * Update an existing reminder
   */
  async updateReminder(
    id: string,
    data: UpdateReminderInput
  ): Promise<Reminder> {
    const response = await this.client.put<ApiResponse<Reminder>>(
      `/reminders/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Mark a reminder as complete
   */
  async markReminderComplete(id: string): Promise<Reminder> {
    const response = await this.client.patch<ApiResponse<Reminder>>(
      `/reminders/${id}/complete`,
      { isCompleted: true }
    );
    return response.data.data;
  }

  /**
   * Mark a reminder as incomplete
   */
  async markReminderIncomplete(id: string): Promise<Reminder> {
    const response = await this.client.patch<ApiResponse<Reminder>>(
      `/reminders/${id}/complete`,
      { isCompleted: false }
    );
    return response.data.data;
  }

  /**
   * Delete a reminder
   */
  async deleteReminder(id: string): Promise<void> {
    await this.client.delete(`/reminders/${id}`);
  }

  // ============================================
  // Tag Endpoints
  // ============================================

  /**
   * Get all tags with contact counts
   */
  async getAllTags(): Promise<Tag[]> {
    const response = await this.client.get<ApiResponse<Tag[]>>('/tags');
    return response.data.data;
  }

  /**
   * Get a single tag by ID
   */
  async getTagById(id: string): Promise<Tag> {
    const response = await this.client.get<ApiResponse<Tag>>(`/tags/${id}`);
    return response.data.data;
  }

  /**
   * Create a new tag
   */
  async createTag(data: CreateTagInput): Promise<Tag> {
    const response = await this.client.post<ApiResponse<Tag>>('/tags', data);
    return response.data.data;
  }

  /**
   * Update an existing tag
   */
  async updateTag(id: string, data: UpdateTagInput): Promise<Tag> {
    const response = await this.client.put<ApiResponse<Tag>>(`/tags/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: string): Promise<void> {
    await this.client.delete(`/tags/${id}`);
  }

  /**
   * Get all contacts with a specific tag
   */
  async getContactsByTag(tagId: string): Promise<Contact[]> {
    const response = await this.client.get<ApiResponse<Contact[]>>(`/tags/${tagId}/contacts`);
    return response.data.data;
  }

  /**
   * Add a tag to a contact (returns normalized contact with tags)
   */
  async addTagToContact(contactId: string, tagId: string): Promise<ContactWithTags> {
    const response = await this.client.post<ApiResponse<any>>(
      `/contacts/${contactId}/tags`,
      { tagId }
    );
    return normalizeContactTags(response.data.data);
  }

  /**
   * Remove a tag from a contact (returns normalized contact with tags)
   */
  async removeTagFromContact(contactId: string, tagId: string): Promise<ContactWithTags> {
    const response = await this.client.delete<ApiResponse<any>>(
      `/contacts/${contactId}/tags/${tagId}`
    );
    return normalizeContactTags(response.data.data);
  }

  /**
   * Get all contacts with optional filters, sorting, and pagination (returns normalized contacts with tags)
   * When page and limit are provided, returns paginated response with metadata
   */
  async getContactsWithFilters(options?: ContactQueryOptions): Promise<ContactWithTags[]>;
  async getContactsWithFilters(options: ContactQueryOptions & { page: number; limit: number }): Promise<PaginatedContactsResponse>;
  async getContactsWithFilters(options?: ContactQueryOptions): Promise<ContactWithTags[] | PaginatedContactsResponse> {
    const params: Record<string, string> = {};

    if (options) {
      if (options.tags && options.tags.length > 0) {
        params.tags = options.tags.join(',');
      }
      if (options.company) {
        params.company = options.company;
      }
      if (options.createdAfter) {
        params.createdAfter = options.createdAfter;
      }
      if (options.createdBefore) {
        params.createdBefore = options.createdBefore;
      }
      if (options.hasReminders) {
        params.hasReminders = 'true';
      }
      if (options.hasOverdueReminders) {
        params.hasOverdueReminders = 'true';
      }
      if (options.sortBy) {
        params.sortBy = options.sortBy;
      }
      if (options.sortOrder) {
        params.sortOrder = options.sortOrder;
      }
      if (options.page !== undefined) {
        params.page = String(options.page);
      }
      if (options.limit !== undefined) {
        params.limit = String(options.limit);
      }
    }

    const response = await this.client.get<ApiResponse<any[]>>('/contacts', { params });
    const contacts = normalizeContactsArray(response.data.data);

    // Return paginated response if pagination metadata is present
    if (response.data.pagination) {
      return {
        contacts,
        pagination: response.data.pagination
      };
    }

    return contacts;
  }

  /**
   * Get all contacts with optional tag filter (legacy method, use getContactsWithFilters instead)
   */
  async getContactsWithTags(tagIds?: string[]): Promise<ContactWithTags[]> {
    return this.getContactsWithFilters({ tags: tagIds });
  }

  /**
   * Get all distinct company names for filter dropdown
   */
  async getDistinctCompanies(): Promise<string[]> {
    const response = await this.client.get<ApiResponse<string[]>>('/contacts/companies');
    return response.data.data;
  }

  // ============================================
  // Note Endpoints
  // ============================================

  /**
   * Get all notes for a contact (pinned first, then by date)
   */
  async getNotesForContact(contactId: string): Promise<Note[]> {
    const response = await this.client.get<ApiResponse<Note[]>>(
      `/contacts/${contactId}/notes`
    );
    return response.data.data;
  }

  /**
   * Get a single note by ID (with contact info)
   */
  async getNoteById(id: string): Promise<NoteWithContact> {
    const response = await this.client.get<ApiResponse<NoteWithContact>>(
      `/notes/${id}`
    );
    return response.data.data;
  }

  /**
   * Create a new note for a contact
   */
  async createNote(contactId: string, data: CreateNoteInput): Promise<Note> {
    const response = await this.client.post<ApiResponse<Note>>(
      `/contacts/${contactId}/notes`,
      data
    );
    return response.data.data;
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, data: UpdateNoteInput): Promise<Note> {
    const response = await this.client.put<ApiResponse<Note>>(
      `/notes/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Toggle pin status of a note
   */
  async toggleNotePin(id: string): Promise<Note> {
    const response = await this.client.patch<ApiResponse<Note>>(
      `/notes/${id}/pin`
    );
    return response.data.data;
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    await this.client.delete(`/notes/${id}`);
  }

  // ============================================
  // Search Endpoints
  // ============================================

  /**
   * Global search across contacts, notes, interactions, and reminders
   */
  async globalSearch(query: string, limit: number = 10): Promise<GlobalSearchResponse> {
    const response = await this.client.get<ApiResponse<GlobalSearchResponse>>('/search', {
      params: { q: query, limit },
    });
    return response.data.data;
  }

  // ============================================
  // Stats Endpoints
  // ============================================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<ApiResponse<DashboardStats>>('/stats');
    return response.data.data;
  }

  /**
   * Get contact growth data for the last 12 months
   */
  async getContactGrowth(): Promise<ContactGrowthData[]> {
    const response = await this.client.get<ApiResponse<ContactGrowthData[]>>('/stats/growth');
    return response.data.data;
  }

  /**
   * Get interaction breakdown by type
   */
  async getInteractionBreakdown(): Promise<InteractionBreakdown[]> {
    const response = await this.client.get<ApiResponse<InteractionBreakdown[]>>('/stats/interactions');
    return response.data.data;
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivityItem[]> {
    const response = await this.client.get<ApiResponse<RecentActivityItem[]>>('/stats/activity', {
      params: { limit },
    });
    return response.data.data;
  }

  // ============================================
  // Health Check
  // ============================================

  /**
   * Check if API is healthy
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await this.client.get('/../health'); // Goes up to root
    return response.data;
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Transform contact data from API format to frontend format.
 * Prisma returns tags as nested join table objects:
 *   { tags: [{ contactId, tagId, tag: { id, name, color } }] }
 * Frontend expects flat tag objects:
 *   { tags: [{ id, name, color }] }
 */
interface RawContactTag {
  contactId: string;
  tagId: string;
  tag: Tag;
}

interface RawContact extends Omit<ContactWithTags, 'tags'> {
  tags?: RawContactTag[] | Tag[];
}

function normalizeContactTags<T extends RawContact>(contact: T): ContactWithTags {
  if (!contact.tags || contact.tags.length === 0) {
    return { ...contact, tags: [] } as ContactWithTags;
  }

  // Check if tags are already flattened (have 'name' property directly)
  const firstTag = contact.tags[0];
  if ('name' in firstTag) {
    // Already flat format
    return contact as unknown as ContactWithTags;
  }

  // Transform nested format to flat format
  const flatTags = (contact.tags as RawContactTag[]).map(ct => ct.tag);
  return { ...contact, tags: flatTags } as ContactWithTags;
}

function normalizeContactsArray(contacts: RawContact[]): ContactWithTags[] {
  return contacts.map(normalizeContactTags);
}

// Export singleton instance
export const api = new ApiClient();
