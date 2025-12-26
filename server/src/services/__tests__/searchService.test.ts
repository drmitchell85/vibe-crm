/**
 * Unit Tests for Search Service
 *
 * Tests the global search functionality across contacts, notes, interactions, and reminders.
 * Prisma is mocked to isolate service logic from database.
 */

import { AppError } from '../../middleware/errorHandler';

// Mock Prisma client
const mockPrismaContact = {
  findMany: jest.fn(),
};

const mockPrismaNote = {
  findMany: jest.fn(),
};

const mockPrismaInteraction = {
  findMany: jest.fn(),
};

const mockPrismaReminder = {
  findMany: jest.fn(),
};

jest.mock('../contactService', () => ({
  prisma: {
    contact: mockPrismaContact,
    note: mockPrismaNote,
    interaction: mockPrismaInteraction,
    reminder: mockPrismaReminder,
  },
}));

// Import after mocking
import { searchService } from '../searchService';

describe('searchService', () => {
  // Sample test data
  const mockContact = {
    id: 'contact-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    jobTitle: 'Engineer',
    createdAt: new Date('2025-01-01'),
  };

  const mockNote = {
    id: 'note-1',
    content: 'Discussion about project John mentioned',
    isPinned: false,
    createdAt: new Date('2025-01-02'),
    contact: {
      id: 'contact-1',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const mockInteraction = {
    id: 'interaction-1',
    type: 'MEETING',
    subject: 'Project review with John',
    notes: 'Discussed timeline and deliverables',
    location: 'Conference Room A',
    date: new Date('2025-01-03'),
    createdAt: new Date('2025-01-03'),
    contact: {
      id: 'contact-1',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const mockReminder = {
    id: 'reminder-1',
    title: 'Follow up with John',
    description: 'Send the proposal document',
    dueDate: new Date('2025-01-10'),
    isCompleted: false,
    createdAt: new Date('2025-01-04'),
    contact: {
      id: 'contact-1',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to returning empty arrays
    mockPrismaContact.findMany.mockResolvedValue([]);
    mockPrismaNote.findMany.mockResolvedValue([]);
    mockPrismaInteraction.findMany.mockResolvedValue([]);
    mockPrismaReminder.findMany.mockResolvedValue([]);
  });

  // ============================================
  // globalSearch - Input Validation
  // ============================================
  describe('globalSearch - Input Validation', () => {
    it('should throw error when query is empty', async () => {
      await expect(searchService.globalSearch('')).rejects.toThrow(AppError);
      await expect(searchService.globalSearch('')).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_QUERY',
      });
    });

    it('should throw error when query is too short', async () => {
      await expect(searchService.globalSearch('a')).rejects.toThrow(AppError);
      await expect(searchService.globalSearch('a')).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_QUERY',
      });
    });

    it('should throw error when query is only whitespace', async () => {
      await expect(searchService.globalSearch('   ')).rejects.toThrow(AppError);
    });

    it('should accept query with exactly 2 characters', async () => {
      const result = await searchService.globalSearch('jo');

      expect(result.query).toBe('jo');
      expect(result.results).toEqual([]);
    });

    it('should trim whitespace from query', async () => {
      const result = await searchService.globalSearch('  john  ');

      expect(result.query).toBe('john');
    });
  });

  // ============================================
  // globalSearch - Contact Search
  // ============================================
  describe('globalSearch - Contact Search', () => {
    it('should find contacts by firstName', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);

      const result = await searchService.globalSearch('john');

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        entityType: 'contact',
        title: 'John Doe',
        id: 'contact-1',
      });
      expect(mockPrismaContact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { firstName: { contains: 'john', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should find contacts by lastName', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);

      const result = await searchService.globalSearch('doe');

      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('John Doe');
    });

    it('should find contacts by email', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);

      const result = await searchService.globalSearch('example.com');

      expect(result.results).toHaveLength(1);
    });

    it('should find contacts by company', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);

      const result = await searchService.globalSearch('acme');

      expect(result.results).toHaveLength(1);
      expect(result.results[0].preview).toContain('Acme Corp');
    });

    it('should include company and job title in preview', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);

      const result = await searchService.globalSearch('john');

      expect(result.results[0].preview).toContain('Acme Corp');
      expect(result.results[0].preview).toContain('Engineer');
    });
  });

  // ============================================
  // globalSearch - Note Search
  // ============================================
  describe('globalSearch - Note Search', () => {
    it('should find notes by content', async () => {
      mockPrismaNote.findMany.mockResolvedValue([mockNote]);

      const result = await searchService.globalSearch('project');

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        entityType: 'note',
        contactId: 'contact-1',
        contactName: 'John Doe',
      });
    });

    it('should include contact name in note title', async () => {
      mockPrismaNote.findMany.mockResolvedValue([mockNote]);

      const result = await searchService.globalSearch('discussion');

      expect(result.results[0].title).toBe('Note for John Doe');
    });

    it('should create preview from note content', async () => {
      mockPrismaNote.findMany.mockResolvedValue([mockNote]);

      const result = await searchService.globalSearch('discussion');

      expect(result.results[0].preview).toContain('Discussion about project');
    });

    it('should truncate long note content in preview', async () => {
      const longNote = {
        ...mockNote,
        content: 'A'.repeat(200),
      };
      mockPrismaNote.findMany.mockResolvedValue([longNote]);

      const result = await searchService.globalSearch('AA');

      expect(result.results[0].preview.length).toBeLessThanOrEqual(103); // 100 + '...'
      expect(result.results[0].preview).toContain('...');
    });
  });

  // ============================================
  // globalSearch - Interaction Search
  // ============================================
  describe('globalSearch - Interaction Search', () => {
    it('should find interactions by subject', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);

      const result = await searchService.globalSearch('review');

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        entityType: 'interaction',
        title: 'Project review with John',
      });
    });

    it('should find interactions by notes', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);

      const result = await searchService.globalSearch('timeline');

      expect(result.results).toHaveLength(1);
      expect(result.results[0].preview).toContain('timeline');
    });

    it('should find interactions by location', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);

      const result = await searchService.globalSearch('Conference');

      expect(result.results).toHaveLength(1);
    });

    it('should use interaction type in title when subject is missing', async () => {
      const interactionNoSubject = {
        ...mockInteraction,
        subject: null,
      };
      mockPrismaInteraction.findMany.mockResolvedValue([interactionNoSubject]);

      const result = await searchService.globalSearch('timeline');

      expect(result.results[0].title).toBe('MEETING with John Doe');
    });
  });

  // ============================================
  // globalSearch - Reminder Search
  // ============================================
  describe('globalSearch - Reminder Search', () => {
    it('should find reminders by title', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      const result = await searchService.globalSearch('follow');

      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        entityType: 'reminder',
        title: 'Follow up with John',
      });
    });

    it('should find reminders by description', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      const result = await searchService.globalSearch('proposal');

      expect(result.results).toHaveLength(1);
      expect(result.results[0].preview).toContain('proposal');
    });

    it('should include contact information', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      const result = await searchService.globalSearch('follow');

      expect(result.results[0].contactId).toBe('contact-1');
      expect(result.results[0].contactName).toBe('John Doe');
    });
  });

  // ============================================
  // globalSearch - Combined Results
  // ============================================
  describe('globalSearch - Combined Results', () => {
    it('should return results from all entity types', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);
      mockPrismaNote.findMany.mockResolvedValue([mockNote]);
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      const result = await searchService.globalSearch('john');

      expect(result.totalResults).toBe(4);
      const entityTypes = result.results.map(r => r.entityType);
      expect(entityTypes).toContain('contact');
      expect(entityTypes).toContain('note');
      expect(entityTypes).toContain('interaction');
      expect(entityTypes).toContain('reminder');
    });

    it('should sort results by relevance score descending', async () => {
      // Contact with exact match in name should score higher
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);
      // Note with match only in content should score lower
      mockPrismaNote.findMany.mockResolvedValue([mockNote]);

      const result = await searchService.globalSearch('john');

      // Contact should appear before note due to higher relevance
      const contactIndex = result.results.findIndex(r => r.entityType === 'contact');
      const noteIndex = result.results.findIndex(r => r.entityType === 'note');
      expect(contactIndex).toBeLessThan(noteIndex);
    });

    it('should respect the limit parameter per entity type', async () => {
      const multipleContacts = [
        mockContact,
        { ...mockContact, id: 'contact-2', firstName: 'Johnny' },
        { ...mockContact, id: 'contact-3', firstName: 'Johnson' },
      ];
      mockPrismaContact.findMany.mockResolvedValue(multipleContacts);

      await searchService.globalSearch('john', 2);

      expect(mockPrismaContact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 2 })
      );
    });

    it('should return correct query in response', async () => {
      const result = await searchService.globalSearch('test query');

      expect(result.query).toBe('test query');
    });

    it('should return empty results when no matches found', async () => {
      const result = await searchService.globalSearch('xyznonexistent');

      expect(result.totalResults).toBe(0);
      expect(result.results).toEqual([]);
    });
  });

  // ============================================
  // globalSearch - Error Handling
  // ============================================
  describe('globalSearch - Error Handling', () => {
    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findMany.mockRejectedValue(new Error('DB connection failed'));

      await expect(searchService.globalSearch('test')).rejects.toThrow(AppError);
      await expect(searchService.globalSearch('test')).rejects.toMatchObject({
        statusCode: 500,
        code: 'SEARCH_ERROR',
      });
    });

    it('should handle partial database failures gracefully', async () => {
      // One query fails, others succeed
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);
      mockPrismaNote.findMany.mockRejectedValue(new Error('Note query failed'));

      // The whole search should fail due to Promise.all
      await expect(searchService.globalSearch('john')).rejects.toThrow(AppError);
    });
  });

  // ============================================
  // Relevance Scoring
  // ============================================
  describe('Relevance Scoring', () => {
    it('should give higher score to exact name match', async () => {
      const exactMatch = { ...mockContact, firstName: 'John', lastName: 'Doe' };
      mockPrismaContact.findMany.mockResolvedValue([exactMatch]);

      const result = await searchService.globalSearch('John Doe');

      expect(result.results[0].relevanceScore).toBeGreaterThan(50);
    });

    it('should give higher score when query starts the field', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);

      const result = await searchService.globalSearch('Joh');

      // Starts with 'Joh' in firstName should score well
      expect(result.results[0].relevanceScore).toBeGreaterThan(0);
    });
  });
});
