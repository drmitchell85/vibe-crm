/**
 * Unit Tests for Interaction Service
 *
 * Tests the business logic of the interaction service in isolation
 * by mocking the Prisma client.
 */

import { AppError } from '../../middleware/errorHandler';

// Mock Prisma Client
const mockPrismaContact = {
  findUnique: jest.fn(),
};

const mockPrismaInteraction = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock the contactService module which exports prisma
jest.mock('../contactService', () => ({
  prisma: {
    contact: mockPrismaContact,
    interaction: mockPrismaInteraction,
  },
}));

// Import after mocking
import { interactionService, InteractionFilters } from '../interactionService';

describe('interactionService', () => {
  // Sample test data
  const mockContact = {
    id: 'contact-1',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockInteraction = {
    id: 'interaction-1',
    contactId: 'contact-1',
    type: 'CALL',
    subject: 'Weekly check-in',
    notes: 'Discussed project progress',
    date: new Date('2025-12-20T10:00:00Z'),
    duration: 30,
    location: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInteractionWithContact = {
    ...mockInteraction,
    contact: {
      id: mockContact.id,
      firstName: mockContact.firstName,
      lastName: mockContact.lastName,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getInteractionsForContact Tests
  // ============================================
  describe('getInteractionsForContact', () => {
    beforeEach(() => {
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
    });

    it('should return an array of interactions ordered by date desc', async () => {
      const mockInteractions = [
        { ...mockInteraction, id: '1', date: new Date('2025-12-22') },
        { ...mockInteraction, id: '2', date: new Date('2025-12-20') },
      ];
      mockPrismaInteraction.findMany.mockResolvedValue(mockInteractions);

      const result = await interactionService.getInteractionsForContact('contact-1');

      expect(result).toEqual(mockInteractions);
      expect(mockPrismaContact.findUnique).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
      });
      expect(mockPrismaInteraction.findMany).toHaveBeenCalledWith({
        where: { contactId: 'contact-1' },
        orderBy: { date: 'desc' },
      });
    });

    it('should return empty array when contact has no interactions', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([]);

      const result = await interactionService.getInteractionsForContact('contact-1');

      expect(result).toEqual([]);
    });

    it('should throw 404 when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(interactionService.getInteractionsForContact('non-existent')).rejects.toThrow(AppError);
      await expect(interactionService.getInteractionsForContact('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should apply type filter when provided', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);

      const filters: InteractionFilters = { type: 'CALL' };
      await interactionService.getInteractionsForContact('contact-1', filters);

      expect(mockPrismaInteraction.findMany).toHaveBeenCalledWith({
        where: { contactId: 'contact-1', type: 'CALL' },
        orderBy: { date: 'desc' },
      });
    });

    it('should apply startDate filter when provided', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);
      const startDate = new Date('2025-12-01');

      const filters: InteractionFilters = { startDate };
      await interactionService.getInteractionsForContact('contact-1', filters);

      expect(mockPrismaInteraction.findMany).toHaveBeenCalledWith({
        where: {
          contactId: 'contact-1',
          date: { gte: startDate },
        },
        orderBy: { date: 'desc' },
      });
    });

    it('should apply endDate filter when provided', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);
      const endDate = new Date('2025-12-31');

      const filters: InteractionFilters = { endDate };
      await interactionService.getInteractionsForContact('contact-1', filters);

      expect(mockPrismaInteraction.findMany).toHaveBeenCalledWith({
        where: {
          contactId: 'contact-1',
          date: { lte: endDate },
        },
        orderBy: { date: 'desc' },
      });
    });

    it('should apply date range filter (startDate and endDate)', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);
      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');

      const filters: InteractionFilters = { startDate, endDate };
      await interactionService.getInteractionsForContact('contact-1', filters);

      expect(mockPrismaInteraction.findMany).toHaveBeenCalledWith({
        where: {
          contactId: 'contact-1',
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'desc' },
      });
    });

    it('should apply all filters together (type + date range)', async () => {
      mockPrismaInteraction.findMany.mockResolvedValue([mockInteraction]);
      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');

      const filters: InteractionFilters = { type: 'MEETING', startDate, endDate };
      await interactionService.getInteractionsForContact('contact-1', filters);

      expect(mockPrismaInteraction.findMany).toHaveBeenCalledWith({
        where: {
          contactId: 'contact-1',
          type: 'MEETING',
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'desc' },
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(interactionService.getInteractionsForContact('contact-1')).rejects.toThrow(AppError);
      await expect(interactionService.getInteractionsForContact('contact-1')).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_INTERACTIONS_ERROR',
      });
    });
  });

  // ============================================
  // getInteractionById Tests
  // ============================================
  describe('getInteractionById', () => {
    it('should return an interaction with contact relation when found', async () => {
      mockPrismaInteraction.findUnique.mockResolvedValue(mockInteractionWithContact);

      const result = await interactionService.getInteractionById('interaction-1');

      expect(result).toEqual(mockInteractionWithContact);
      expect(mockPrismaInteraction.findUnique).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });

    it('should throw 404 when interaction not found', async () => {
      mockPrismaInteraction.findUnique.mockResolvedValue(null);

      await expect(interactionService.getInteractionById('non-existent')).rejects.toThrow(AppError);
      await expect(interactionService.getInteractionById('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'INTERACTION_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaInteraction.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(interactionService.getInteractionById('interaction-1')).rejects.toThrow(AppError);
      await expect(interactionService.getInteractionById('interaction-1')).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_INTERACTION_ERROR',
      });
    });
  });

  // ============================================
  // createInteraction Tests
  // ============================================
  describe('createInteraction', () => {
    // Use valid UUID format for contactId (Zod validates UUID)
    const validContactId = '550e8400-e29b-41d4-a716-446655440000';

    const validCreateData = {
      contactId: validContactId,
      type: 'CALL' as const,
      subject: 'Check-in call',
      notes: 'Discussed upcoming plans',
      date: '2025-12-20T10:00:00.000Z',
      duration: 30,
      location: 'Phone',
    };

    beforeEach(() => {
      mockPrismaContact.findUnique.mockResolvedValue({ ...mockContact, id: validContactId });
    });

    it('should create and return a new interaction with all fields', async () => {
      const createdInteraction = { ...mockInteraction, ...validCreateData, id: 'new-id' };
      mockPrismaInteraction.create.mockResolvedValue(createdInteraction);

      const result = await interactionService.createInteraction(validCreateData);

      expect(result).toEqual(createdInteraction);
      expect(mockPrismaContact.findUnique).toHaveBeenCalledWith({
        where: { id: validCreateData.contactId },
      });
      expect(mockPrismaInteraction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          contactId: validCreateData.contactId,
          type: validCreateData.type,
          subject: validCreateData.subject,
          notes: validCreateData.notes,
          duration: validCreateData.duration,
          location: validCreateData.location,
        }),
      });
    });

    it('should create interaction with only required fields (type, contactId)', async () => {
      const minimalData = {
        contactId: validContactId,
        type: 'EMAIL' as const,
      };
      const createdInteraction = { ...mockInteraction, ...minimalData, id: 'new-id' };
      mockPrismaInteraction.create.mockResolvedValue(createdInteraction);

      const result = await interactionService.createInteraction(minimalData);

      expect(result).toEqual(createdInteraction);
      expect(mockPrismaInteraction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          contactId: minimalData.contactId,
          type: minimalData.type,
          subject: null,
          notes: null,
          duration: null,
          location: null,
        }),
      });
    });

    it('should throw 404 when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(interactionService.createInteraction(validCreateData)).rejects.toThrow(AppError);
      await expect(interactionService.createInteraction(validCreateData)).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should throw validation error when type is missing', async () => {
      const invalidData = { contactId: validContactId } as any;

      await expect(interactionService.createInteraction(invalidData)).rejects.toThrow();
    });

    it('should throw validation error when contactId is missing', async () => {
      const invalidData = { type: 'CALL' as const } as any;

      await expect(interactionService.createInteraction(invalidData)).rejects.toThrow();
    });

    it('should throw validation error for invalid type', async () => {
      const invalidData = { contactId: validContactId, type: 'INVALID_TYPE' as any };

      await expect(interactionService.createInteraction(invalidData)).rejects.toThrow();
    });

    it('should throw validation error for invalid contactId format', async () => {
      const invalidData = { contactId: 'not-a-uuid', type: 'CALL' as const };

      await expect(interactionService.createInteraction(invalidData)).rejects.toThrow();
    });

    it('should throw validation error for negative duration', async () => {
      const invalidData = { contactId: validContactId, type: 'CALL' as const, duration: -10 };

      await expect(interactionService.createInteraction(invalidData)).rejects.toThrow();
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaInteraction.create.mockRejectedValue(new Error('Database error'));

      await expect(interactionService.createInteraction(validCreateData)).rejects.toThrow(AppError);
      await expect(interactionService.createInteraction(validCreateData)).rejects.toMatchObject({
        statusCode: 500,
        code: 'CREATE_INTERACTION_ERROR',
      });
    });
  });

  // ============================================
  // updateInteraction Tests
  // ============================================
  describe('updateInteraction', () => {
    const updateData = {
      subject: 'Updated subject',
      notes: 'Updated notes',
    };

    beforeEach(() => {
      // Mock getInteractionById to return existing interaction
      mockPrismaInteraction.findUnique.mockResolvedValue(mockInteractionWithContact);
    });

    it('should update and return the interaction with valid data', async () => {
      const updatedInteraction = { ...mockInteraction, ...updateData };
      mockPrismaInteraction.update.mockResolvedValue(updatedInteraction);

      const result = await interactionService.updateInteraction('interaction-1', updateData);

      expect(result).toEqual(updatedInteraction);
      expect(mockPrismaInteraction.update).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
        data: expect.objectContaining({
          subject: updateData.subject,
          notes: updateData.notes,
        }),
      });
    });

    it('should throw 404 when interaction not found', async () => {
      mockPrismaInteraction.findUnique.mockResolvedValue(null);

      await expect(interactionService.updateInteraction('non-existent', updateData)).rejects.toThrow(AppError);
      await expect(interactionService.updateInteraction('non-existent', updateData)).rejects.toMatchObject({
        statusCode: 404,
        code: 'INTERACTION_NOT_FOUND',
      });
    });

    it('should allow partial update (single field)', async () => {
      const partialUpdate = { type: 'MEETING' as const };
      mockPrismaInteraction.update.mockResolvedValue({ ...mockInteraction, type: 'MEETING' });

      await interactionService.updateInteraction('interaction-1', partialUpdate);

      expect(mockPrismaInteraction.update).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
        data: expect.objectContaining({
          type: 'MEETING',
        }),
      });
    });

    it('should convert empty string subject to null', async () => {
      const updateWithEmptySubject = { subject: '' };
      mockPrismaInteraction.update.mockResolvedValue({ ...mockInteraction, subject: null });

      await interactionService.updateInteraction('interaction-1', updateWithEmptySubject);

      expect(mockPrismaInteraction.update).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
        data: expect.objectContaining({
          subject: null,
        }),
      });
    });

    it('should convert empty string notes to null', async () => {
      const updateWithEmptyNotes = { notes: '' };
      mockPrismaInteraction.update.mockResolvedValue({ ...mockInteraction, notes: null });

      await interactionService.updateInteraction('interaction-1', updateWithEmptyNotes);

      expect(mockPrismaInteraction.update).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
        data: expect.objectContaining({
          notes: null,
        }),
      });
    });

    it('should convert empty string location to null', async () => {
      const updateWithEmptyLocation = { location: '' };
      mockPrismaInteraction.update.mockResolvedValue({ ...mockInteraction, location: null });

      await interactionService.updateInteraction('interaction-1', updateWithEmptyLocation);

      expect(mockPrismaInteraction.update).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
        data: expect.objectContaining({
          location: null,
        }),
      });
    });

    it('should update date field correctly', async () => {
      const newDate = '2025-12-25T15:00:00.000Z';
      const updateWithDate = { date: newDate };
      mockPrismaInteraction.update.mockResolvedValue({ ...mockInteraction, date: new Date(newDate) });

      await interactionService.updateInteraction('interaction-1', updateWithDate);

      expect(mockPrismaInteraction.update).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
        data: expect.objectContaining({
          date: new Date(newDate),
        }),
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaInteraction.update.mockRejectedValue(new Error('Database error'));

      await expect(interactionService.updateInteraction('interaction-1', updateData)).rejects.toThrow(AppError);
      await expect(interactionService.updateInteraction('interaction-1', updateData)).rejects.toMatchObject({
        statusCode: 500,
        code: 'UPDATE_INTERACTION_ERROR',
      });
    });
  });

  // ============================================
  // deleteInteraction Tests
  // ============================================
  describe('deleteInteraction', () => {
    beforeEach(() => {
      mockPrismaInteraction.findUnique.mockResolvedValue(mockInteractionWithContact);
    });

    it('should delete and return the interaction', async () => {
      mockPrismaInteraction.delete.mockResolvedValue(mockInteraction);

      const result = await interactionService.deleteInteraction('interaction-1');

      expect(result).toEqual(mockInteraction);
      expect(mockPrismaInteraction.delete).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
      });
    });

    it('should throw 404 when interaction not found', async () => {
      mockPrismaInteraction.findUnique.mockResolvedValue(null);

      await expect(interactionService.deleteInteraction('non-existent')).rejects.toThrow(AppError);
      await expect(interactionService.deleteInteraction('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'INTERACTION_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaInteraction.delete.mockRejectedValue(new Error('Database error'));

      await expect(interactionService.deleteInteraction('interaction-1')).rejects.toThrow(AppError);
      await expect(interactionService.deleteInteraction('interaction-1')).rejects.toMatchObject({
        statusCode: 500,
        code: 'DELETE_INTERACTION_ERROR',
      });
    });
  });
});
