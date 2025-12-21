import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  Interaction,
  CreateInteractionInput,
  UpdateInteractionInput,
  InteractionFilters,
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
   * Get a single contact by ID
   */
  async getContactById(id: string): Promise<Contact> {
    const response = await this.client.get<ApiResponse<Contact>>(`/contacts/${id}`);
    return response.data.data;
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

// Export singleton instance
export const api = new ApiClient();
