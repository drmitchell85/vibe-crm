/**
 * Integration Tests for Search Controller
 *
 * Tests the HTTP layer of the search API using supertest.
 * The service layer is mocked to isolate controller behavior.
 */

import request from 'supertest';
import { AppError } from '../../middleware/errorHandler';

// Mock the search service
const mockSearchService = {
  globalSearch: jest.fn(),
};

jest.mock('../../services/searchService', () => ({
  searchService: mockSearchService,
}));

// Import app after mocking
import app from '../../app';

describe('Search Controller - Integration Tests', () => {
  // Sample test data
  // Results pre-sorted by relevance (descending) as returned by the service
  const mockSearchResponse = {
    query: 'john',
    totalResults: 3,
    results: [
      {
        id: 'contact-1',
        entityType: 'contact',
        title: 'John Doe',
        preview: 'Acme Corp • Software Engineer',
        relevanceScore: 80,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'reminder-1',
        entityType: 'reminder',
        title: 'Follow up with John',
        preview: 'Send proposal document',
        relevanceScore: 60,
        contactId: 'contact-1',
        contactName: 'John Doe',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'note-1',
        entityType: 'note',
        title: 'Note for John Doe',
        preview: 'Discussed project timeline...',
        relevanceScore: 30,
        contactId: 'contact-1',
        contactName: 'John Doe',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/search
  // ============================================
  describe('GET /api/search', () => {
    it('should return 200 with search results for valid query', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockSearchResponse);

      const response = await request(app).get('/api/search?q=john');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockSearchResponse,
      });
      expect(mockSearchService.globalSearch).toHaveBeenCalledWith('john', 10);
    });

    it('should return 200 with empty results when no matches', async () => {
      const emptyResponse = {
        query: 'nonexistent',
        totalResults: 0,
        results: [],
      };
      mockSearchService.globalSearch.mockResolvedValue(emptyResponse);

      const response = await request(app).get('/api/search?q=nonexistent');

      expect(response.status).toBe(200);
      expect(response.body.data.totalResults).toBe(0);
      expect(response.body.data.results).toEqual([]);
    });

    it('should respect custom limit parameter', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockSearchResponse);

      await request(app).get('/api/search?q=john&limit=5');

      expect(mockSearchService.globalSearch).toHaveBeenCalledWith('john', 5);
    });

    it('should use default limit of 10 when not specified', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockSearchResponse);

      await request(app).get('/api/search?q=john');

      expect(mockSearchService.globalSearch).toHaveBeenCalledWith('john', 10);
    });

    it('should return results sorted by relevance', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockSearchResponse);

      const response = await request(app).get('/api/search?q=john');

      const scores = response.body.data.results.map(
        (r: { relevanceScore: number }) => r.relevanceScore
      );
      // Verify scores are in descending order
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    });
  });

  // ============================================
  // GET /api/search - Error Handling
  // ============================================
  describe('GET /api/search - Error Handling', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/api/search');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Search query parameter "q" is required',
          code: 'MISSING_QUERY',
        },
      });
    });

    it('should return 400 when query is empty string', async () => {
      const response = await request(app).get('/api/search?q=');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when query is too short (1 char)', async () => {
      mockSearchService.globalSearch.mockRejectedValue(
        new AppError('Search query must be at least 2 characters', 400, 'INVALID_QUERY')
      );

      const response = await request(app).get('/api/search?q=a');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_QUERY');
    });

    it('should return 400 when limit is not a number', async () => {
      const response = await request(app).get('/api/search?q=john&limit=abc');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_LIMIT');
    });

    it('should return 400 when limit is less than 1', async () => {
      const response = await request(app).get('/api/search?q=john&limit=0');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_LIMIT');
    });

    it('should return 400 when limit exceeds 50', async () => {
      const response = await request(app).get('/api/search?q=john&limit=100');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_LIMIT');
    });

    it('should return 500 on database error', async () => {
      mockSearchService.globalSearch.mockRejectedValue(
        new AppError('Search failed', 500, 'SEARCH_ERROR')
      );

      const response = await request(app).get('/api/search?q=john');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SEARCH_ERROR');
    });
  });

  // ============================================
  // GET /api/search - Entity Type Filtering
  // ============================================
  describe('GET /api/search - Result Types', () => {
    it('should return contact results with correct structure', async () => {
      const contactOnlyResponse = {
        query: 'john',
        totalResults: 1,
        results: [
          {
            id: 'contact-1',
            entityType: 'contact',
            title: 'John Doe',
            preview: 'Acme Corp • Software Engineer',
            relevanceScore: 80,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockSearchService.globalSearch.mockResolvedValue(contactOnlyResponse);

      const response = await request(app).get('/api/search?q=john');

      expect(response.status).toBe(200);
      const result = response.body.data.results[0];
      expect(result.entityType).toBe('contact');
      expect(result).not.toHaveProperty('contactId'); // Contacts don't have contactId
    });

    it('should return note results with contact reference', async () => {
      const noteOnlyResponse = {
        query: 'project',
        totalResults: 1,
        results: [
          {
            id: 'note-1',
            entityType: 'note',
            title: 'Note for John Doe',
            preview: 'Discussed project timeline...',
            relevanceScore: 30,
            contactId: 'contact-1',
            contactName: 'John Doe',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockSearchService.globalSearch.mockResolvedValue(noteOnlyResponse);

      const response = await request(app).get('/api/search?q=project');

      expect(response.status).toBe(200);
      const result = response.body.data.results[0];
      expect(result.entityType).toBe('note');
      expect(result.contactId).toBe('contact-1');
      expect(result.contactName).toBe('John Doe');
    });

    it('should return interaction results with contact reference', async () => {
      const interactionOnlyResponse = {
        query: 'meeting',
        totalResults: 1,
        results: [
          {
            id: 'interaction-1',
            entityType: 'interaction',
            title: 'Project Meeting',
            preview: 'Discussed Q1 goals...',
            relevanceScore: 60,
            contactId: 'contact-1',
            contactName: 'John Doe',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockSearchService.globalSearch.mockResolvedValue(interactionOnlyResponse);

      const response = await request(app).get('/api/search?q=meeting');

      expect(response.status).toBe(200);
      const result = response.body.data.results[0];
      expect(result.entityType).toBe('interaction');
      expect(result.contactId).toBeDefined();
    });

    it('should return reminder results with contact reference', async () => {
      const reminderOnlyResponse = {
        query: 'follow up',
        totalResults: 1,
        results: [
          {
            id: 'reminder-1',
            entityType: 'reminder',
            title: 'Follow up with client',
            preview: 'Send proposal by Friday',
            relevanceScore: 70,
            contactId: 'contact-1',
            contactName: 'John Doe',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockSearchService.globalSearch.mockResolvedValue(reminderOnlyResponse);

      const response = await request(app).get('/api/search?q=follow%20up');

      expect(response.status).toBe(200);
      const result = response.body.data.results[0];
      expect(result.entityType).toBe('reminder');
      expect(result.contactId).toBeDefined();
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle special characters in query', async () => {
      mockSearchService.globalSearch.mockResolvedValue({
        query: 'john@example.com',
        totalResults: 0,
        results: [],
      });

      const response = await request(app).get(
        '/api/search?q=' + encodeURIComponent('john@example.com')
      );

      expect(response.status).toBe(200);
      expect(mockSearchService.globalSearch).toHaveBeenCalledWith('john@example.com', 10);
    });

    it('should handle unicode characters in query', async () => {
      mockSearchService.globalSearch.mockResolvedValue({
        query: 'José',
        totalResults: 0,
        results: [],
      });

      const response = await request(app).get(
        '/api/search?q=' + encodeURIComponent('José')
      );

      expect(response.status).toBe(200);
      expect(mockSearchService.globalSearch).toHaveBeenCalledWith('José', 10);
    });

    it('should handle query with spaces', async () => {
      mockSearchService.globalSearch.mockResolvedValue({
        query: 'john doe',
        totalResults: 0,
        results: [],
      });

      const response = await request(app).get('/api/search?q=john%20doe');

      expect(response.status).toBe(200);
      expect(mockSearchService.globalSearch).toHaveBeenCalledWith('john doe', 10);
    });

    it('should accept limit at boundary (50)', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockSearchResponse);

      const response = await request(app).get('/api/search?q=john&limit=50');

      expect(response.status).toBe(200);
      expect(mockSearchService.globalSearch).toHaveBeenCalledWith('john', 50);
    });

    it('should accept limit at boundary (1)', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockSearchResponse);

      const response = await request(app).get('/api/search?q=john&limit=1');

      expect(response.status).toBe(200);
      expect(mockSearchService.globalSearch).toHaveBeenCalledWith('john', 1);
    });
  });
});
