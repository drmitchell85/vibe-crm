/**
 * Integration Tests for Interaction Controller
 *
 * Tests the HTTP layer of the interactions API using supertest.
 * The service layer is mocked to isolate controller behavior.
 */

import request from 'supertest';
import { AppError } from '../../middleware/errorHandler';

// Mock the interaction service
const mockInteractionService = {
  getInteractionsForContact: jest.fn(),
  getInteractionById: jest.fn(),
  createInteraction: jest.fn(),
  updateInteraction: jest.fn(),
  deleteInteraction: jest.fn(),
};

jest.mock('../../services/interactionService', () => ({
  interactionService: mockInteractionService,
}));

// Import app after mocking
import app from '../../app';

describe('Interaction Controller - Integration Tests', () => {
  // Valid UUIDs for test data
  const validContactId = '550e8400-e29b-41d4-a716-446655440000';
  const validInteractionId = '660e8400-e29b-41d4-a716-446655440001';

  // Sample test data
  const mockInteraction = {
    id: validInteractionId,
    contactId: validContactId,
    type: 'MEETING',
    subject: 'Quarterly catch-up',
    notes: 'Discussed project timeline',
    date: new Date('2025-12-20T14:00:00.000Z').toISOString(),
    duration: 60,
    location: 'Coffee Shop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockInteractionWithContact = {
    ...mockInteraction,
    contact: {
      id: validContactId,
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/contacts/:contactId/interactions
  // ============================================
  describe('GET /api/contacts/:contactId/interactions', () => {
    it('should return 200 with array of interactions', async () => {
      const interactions = [
        mockInteraction,
        { ...mockInteraction, id: '770e8400-e29b-41d4-a716-446655440002', type: 'CALL' },
      ];
      mockInteractionService.getInteractionsForContact.mockResolvedValue(interactions);

      const response = await request(app).get(`/api/contacts/${validContactId}/interactions`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: interactions,
      });
      expect(mockInteractionService.getInteractionsForContact).toHaveBeenCalledWith(
        validContactId,
        {}
      );
    });

    it('should return 200 with empty array when no interactions exist', async () => {
      mockInteractionService.getInteractionsForContact.mockResolvedValue([]);

      const response = await request(app).get(`/api/contacts/${validContactId}/interactions`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should apply type filter from query params', async () => {
      mockInteractionService.getInteractionsForContact.mockResolvedValue([mockInteraction]);

      const response = await request(app).get(
        `/api/contacts/${validContactId}/interactions?type=MEETING`
      );

      expect(response.status).toBe(200);
      expect(mockInteractionService.getInteractionsForContact).toHaveBeenCalledWith(
        validContactId,
        { type: 'MEETING' }
      );
    });

    it('should apply date range filters from query params', async () => {
      mockInteractionService.getInteractionsForContact.mockResolvedValue([mockInteraction]);
      const startDate = '2025-12-01T00:00:00.000Z';
      const endDate = '2025-12-31T23:59:59.000Z';

      const response = await request(app).get(
        `/api/contacts/${validContactId}/interactions?startDate=${startDate}&endDate=${endDate}`
      );

      expect(response.status).toBe(200);
      expect(mockInteractionService.getInteractionsForContact).toHaveBeenCalledWith(
        validContactId,
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }
      );
    });

    it('should return 400 for invalid interaction type', async () => {
      const response = await request(app).get(
        `/api/contacts/${validContactId}/interactions?type=INVALID_TYPE`
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TYPE');
    });

    it('should return 404 when contact not found', async () => {
      mockInteractionService.getInteractionsForContact.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app).get(`/api/contacts/${validContactId}/interactions`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockInteractionService.getInteractionsForContact.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_INTERACTIONS_ERROR')
      );

      const response = await request(app).get(`/api/contacts/${validContactId}/interactions`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/interactions/:id
  // ============================================
  describe('GET /api/interactions/:id', () => {
    it('should return 200 with interaction when found', async () => {
      mockInteractionService.getInteractionById.mockResolvedValue(mockInteractionWithContact);

      const response = await request(app).get(`/api/interactions/${validInteractionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockInteractionWithContact,
      });
      expect(mockInteractionService.getInteractionById).toHaveBeenCalledWith(validInteractionId);
    });

    it('should return 404 when interaction not found', async () => {
      mockInteractionService.getInteractionById.mockRejectedValue(
        new AppError('Interaction not found', 404, 'INTERACTION_NOT_FOUND')
      );

      const response = await request(app).get('/api/interactions/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERACTION_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockInteractionService.getInteractionById.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_INTERACTION_ERROR')
      );

      const response = await request(app).get(`/api/interactions/${validInteractionId}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // POST /api/contacts/:contactId/interactions
  // ============================================
  describe('POST /api/contacts/:contactId/interactions', () => {
    const validCreateData = {
      type: 'COFFEE',
      subject: 'Networking catch-up',
      notes: 'Discussed career plans',
      date: '2025-12-20T10:00:00.000Z',
      duration: 45,
      location: 'Blue Bottle Coffee',
    };

    it('should return 201 with created interaction on success', async () => {
      const createdInteraction = {
        ...mockInteraction,
        ...validCreateData,
        id: '880e8400-e29b-41d4-a716-446655440003',
      };
      mockInteractionService.createInteraction.mockResolvedValue(createdInteraction);

      const response = await request(app)
        .post(`/api/contacts/${validContactId}/interactions`)
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: createdInteraction,
      });
      expect(mockInteractionService.createInteraction).toHaveBeenCalledWith({
        ...validCreateData,
        contactId: validContactId,
      });
    });

    it('should return 201 with minimal data (type only)', async () => {
      const minimalData = { type: 'CALL' };
      const createdInteraction = {
        ...mockInteraction,
        ...minimalData,
        subject: null,
        notes: null,
        location: null,
      };
      mockInteractionService.createInteraction.mockResolvedValue(createdInteraction);

      const response = await request(app)
        .post(`/api/contacts/${validContactId}/interactions`)
        .send(minimalData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 on validation error (missing type)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          message: 'Required',
          path: ['type'],
        },
      ]);
      mockInteractionService.createInteraction.mockRejectedValue(zodError);

      const response = await request(app)
        .post(`/api/contacts/${validContactId}/interactions`)
        .send({ subject: 'Missing type field' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (invalid type enum)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_enum_value',
          options: ['CALL', 'MEETING', 'EMAIL', 'TEXT', 'COFFEE', 'LUNCH', 'EVENT', 'OTHER'],
          received: 'INVALID',
          message: 'Invalid interaction type',
          path: ['type'],
        },
      ]);
      mockInteractionService.createInteraction.mockRejectedValue(zodError);

      const response = await request(app)
        .post(`/api/contacts/${validContactId}/interactions`)
        .send({ type: 'INVALID' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (invalid duration)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'number',
          inclusive: true,
          exact: false,
          message: 'Duration must be at least 1 minute',
          path: ['duration'],
        },
      ]);
      mockInteractionService.createInteraction.mockRejectedValue(zodError);

      const response = await request(app)
        .post(`/api/contacts/${validContactId}/interactions`)
        .send({ type: 'CALL', duration: 0 })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when contact not found', async () => {
      mockInteractionService.createInteraction.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app)
        .post(`/api/contacts/${validContactId}/interactions`)
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });
  });

  // ============================================
  // PUT /api/interactions/:id
  // ============================================
  describe('PUT /api/interactions/:id', () => {
    const updateData = {
      subject: 'Updated subject',
      notes: 'Updated notes with additional details',
      duration: 90,
    };

    it('should return 200 with updated interaction on success', async () => {
      const updatedInteraction = { ...mockInteraction, ...updateData };
      mockInteractionService.updateInteraction.mockResolvedValue(updatedInteraction);

      const response = await request(app)
        .put(`/api/interactions/${validInteractionId}`)
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: updatedInteraction,
      });
      expect(mockInteractionService.updateInteraction).toHaveBeenCalledWith(
        validInteractionId,
        updateData
      );
    });

    it('should return 200 with partial update (single field)', async () => {
      const partialUpdate = { location: 'New Location' };
      const updatedInteraction = { ...mockInteraction, ...partialUpdate };
      mockInteractionService.updateInteraction.mockResolvedValue(updatedInteraction);

      const response = await request(app)
        .put(`/api/interactions/${validInteractionId}`)
        .send(partialUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 200 when changing interaction type', async () => {
      const typeUpdate = { type: 'CALL' };
      const updatedInteraction = { ...mockInteraction, ...typeUpdate };
      mockInteractionService.updateInteraction.mockResolvedValue(updatedInteraction);

      const response = await request(app)
        .put(`/api/interactions/${validInteractionId}`)
        .send(typeUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when interaction not found', async () => {
      mockInteractionService.updateInteraction.mockRejectedValue(
        new AppError('Interaction not found', 404, 'INTERACTION_NOT_FOUND')
      );

      const response = await request(app)
        .put('/api/interactions/non-existent-id')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERACTION_NOT_FOUND');
    });

    it('should return 400 on validation error (invalid duration)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'number',
          inclusive: true,
          exact: false,
          message: 'Duration must be at least 1 minute',
          path: ['duration'],
        },
      ]);
      mockInteractionService.updateInteraction.mockRejectedValue(zodError);

      const response = await request(app)
        .put(`/api/interactions/${validInteractionId}`)
        .send({ duration: -5 })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (invalid type enum)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_enum_value',
          options: ['CALL', 'MEETING', 'EMAIL', 'TEXT', 'COFFEE', 'LUNCH', 'EVENT', 'OTHER'],
          received: 'INVALID',
          message: 'Invalid interaction type',
          path: ['type'],
        },
      ]);
      mockInteractionService.updateInteraction.mockRejectedValue(zodError);

      const response = await request(app)
        .put(`/api/interactions/${validInteractionId}`)
        .send({ type: 'INVALID' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ============================================
  // DELETE /api/interactions/:id
  // ============================================
  describe('DELETE /api/interactions/:id', () => {
    it('should return 200 with success message on delete', async () => {
      mockInteractionService.deleteInteraction.mockResolvedValue(mockInteraction);

      const response = await request(app).delete(`/api/interactions/${validInteractionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { message: 'Interaction deleted successfully' },
      });
      expect(mockInteractionService.deleteInteraction).toHaveBeenCalledWith(validInteractionId);
    });

    it('should return 404 when interaction not found', async () => {
      mockInteractionService.deleteInteraction.mockRejectedValue(
        new AppError('Interaction not found', 404, 'INTERACTION_NOT_FOUND')
      );

      const response = await request(app).delete('/api/interactions/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERACTION_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockInteractionService.deleteInteraction.mockRejectedValue(
        new AppError('Database error', 500, 'DELETE_INTERACTION_ERROR')
      );

      const response = await request(app).delete(`/api/interactions/${validInteractionId}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle all 8 interaction types', async () => {
      const types = ['CALL', 'MEETING', 'EMAIL', 'TEXT', 'COFFEE', 'LUNCH', 'EVENT', 'OTHER'];

      for (const type of types) {
        mockInteractionService.getInteractionsForContact.mockResolvedValue([
          { ...mockInteraction, type },
        ]);

        const response = await request(app).get(
          `/api/contacts/${validContactId}/interactions?type=${type}`
        );

        expect(response.status).toBe(200);
        expect(mockInteractionService.getInteractionsForContact).toHaveBeenCalledWith(
          validContactId,
          { type }
        );
      }
    });

    it('should handle combined filters (type + date range)', async () => {
      mockInteractionService.getInteractionsForContact.mockResolvedValue([mockInteraction]);
      const startDate = '2025-12-01T00:00:00.000Z';
      const endDate = '2025-12-31T23:59:59.000Z';

      const response = await request(app).get(
        `/api/contacts/${validContactId}/interactions?type=MEETING&startDate=${startDate}&endDate=${endDate}`
      );

      expect(response.status).toBe(200);
      expect(mockInteractionService.getInteractionsForContact).toHaveBeenCalledWith(
        validContactId,
        {
          type: 'MEETING',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }
      );
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post(`/api/contacts/${validContactId}/interactions`)
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });
});
