/**
 * Integration Tests for Tag Controller
 *
 * Tests the HTTP layer of the tags API using supertest.
 * The service layer is mocked to isolate controller behavior.
 */

import request from 'supertest';
import { AppError } from '../../middleware/errorHandler';

// Mock the tag service
const mockTagService = {
  getAllTags: jest.fn(),
  getTagById: jest.fn(),
  createTag: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
};

jest.mock('../../services/tagService', () => ({
  tagService: mockTagService,
}));

// Import app after mocking
import app from '../../app';

describe('Tag Controller - Integration Tests', () => {
  // Sample test data
  const mockTag = {
    id: 'tag-123',
    name: 'Backgammon',
    color: '#FF5733',
    createdAt: new Date().toISOString(),
    contactCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/tags
  // ============================================
  describe('GET /api/tags', () => {
    it('should return 200 with array of tags', async () => {
      const tags = [mockTag, { ...mockTag, id: 'tag-456', name: 'Tech' }];
      mockTagService.getAllTags.mockResolvedValue(tags);

      const response = await request(app).get('/api/tags');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: tags,
      });
      expect(mockTagService.getAllTags).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with empty array when no tags exist', async () => {
      mockTagService.getAllTags.mockResolvedValue([]);

      const response = await request(app).get('/api/tags');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 500 when service throws error', async () => {
      mockTagService.getAllTags.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_TAGS_ERROR')
      );

      const response = await request(app).get('/api/tags');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FETCH_TAGS_ERROR');
    });
  });

  // ============================================
  // GET /api/tags/:id
  // ============================================
  describe('GET /api/tags/:id', () => {
    it('should return 200 with tag when found', async () => {
      mockTagService.getTagById.mockResolvedValue(mockTag);

      const response = await request(app).get('/api/tags/tag-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockTag,
      });
      expect(mockTagService.getTagById).toHaveBeenCalledWith('tag-123');
    });

    it('should return 404 when tag not found', async () => {
      mockTagService.getTagById.mockRejectedValue(
        new AppError('Tag not found', 404, 'TAG_NOT_FOUND')
      );

      const response = await request(app).get('/api/tags/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TAG_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockTagService.getTagById.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_TAG_ERROR')
      );

      const response = await request(app).get('/api/tags/tag-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // POST /api/tags
  // ============================================
  describe('POST /api/tags', () => {
    const validCreateData = {
      name: 'New Tag',
      color: '#00FF00',
    };

    it('should return 201 with created tag on success', async () => {
      const createdTag = { ...mockTag, name: 'New Tag', color: '#00FF00' };
      mockTagService.createTag.mockResolvedValue(createdTag);

      const response = await request(app)
        .post('/api/tags')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: createdTag,
      });
      expect(mockTagService.createTag).toHaveBeenCalledWith(validCreateData);
    });

    it('should return 201 with minimal data (name only)', async () => {
      const minimalData = { name: 'Minimal Tag' };
      const createdTag = { ...mockTag, name: 'Minimal Tag', color: '#6B7280' };
      mockTagService.createTag.mockResolvedValue(createdTag);

      const response = await request(app)
        .post('/api/tags')
        .send(minimalData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 on validation error (missing name)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Tag name is required',
          path: ['name'],
        },
      ]);
      mockTagService.createTag.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/tags')
        .send({ color: '#FF0000' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (invalid color format)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_string',
          validation: 'regex',
          message: 'Color must be a valid hex color',
          path: ['color'],
        },
      ]);
      mockTagService.createTag.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/tags')
        .send({ name: 'Test', color: 'not-a-color' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (name too long)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_big',
          maximum: 50,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Tag name must be 50 characters or less',
          path: ['name'],
        },
      ]);
      mockTagService.createTag.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/tags')
        .send({ name: 'a'.repeat(51) })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 on duplicate tag name', async () => {
      mockTagService.createTag.mockRejectedValue(
        new AppError('A tag with this name already exists', 409, 'DUPLICATE_TAG_NAME')
      );

      const response = await request(app)
        .post('/api/tags')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_TAG_NAME');
    });

    it('should return 500 on database error', async () => {
      mockTagService.createTag.mockRejectedValue(
        new AppError('Database error', 500, 'CREATE_TAG_ERROR')
      );

      const response = await request(app)
        .post('/api/tags')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // PUT /api/tags/:id
  // ============================================
  describe('PUT /api/tags/:id', () => {
    const updateData = {
      name: 'Updated Name',
      color: '#0000FF',
    };

    it('should return 200 with updated tag on success', async () => {
      const updatedTag = { ...mockTag, ...updateData };
      mockTagService.updateTag.mockResolvedValue(updatedTag);

      const response = await request(app)
        .put('/api/tags/tag-123')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: updatedTag,
      });
      expect(mockTagService.updateTag).toHaveBeenCalledWith('tag-123', updateData);
    });

    it('should return 200 with partial update (name only)', async () => {
      const partialUpdate = { name: 'Just Name' };
      const updatedTag = { ...mockTag, ...partialUpdate };
      mockTagService.updateTag.mockResolvedValue(updatedTag);

      const response = await request(app)
        .put('/api/tags/tag-123')
        .send(partialUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 200 with partial update (color only)', async () => {
      const partialUpdate = { color: '#ABCDEF' };
      const updatedTag = { ...mockTag, ...partialUpdate };
      mockTagService.updateTag.mockResolvedValue(updatedTag);

      const response = await request(app)
        .put('/api/tags/tag-123')
        .send(partialUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when tag not found', async () => {
      mockTagService.updateTag.mockRejectedValue(
        new AppError('Tag not found', 404, 'TAG_NOT_FOUND')
      );

      const response = await request(app)
        .put('/api/tags/non-existent')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TAG_NOT_FOUND');
    });

    it('should return 400 on validation error (invalid color)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_string',
          validation: 'regex',
          message: 'Color must be a valid hex color',
          path: ['color'],
        },
      ]);
      mockTagService.updateTag.mockRejectedValue(zodError);

      const response = await request(app)
        .put('/api/tags/tag-123')
        .send({ color: 'bad-color' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 on duplicate tag name', async () => {
      mockTagService.updateTag.mockRejectedValue(
        new AppError('A tag with this name already exists', 409, 'DUPLICATE_TAG_NAME')
      );

      const response = await request(app)
        .put('/api/tags/tag-123')
        .send({ name: 'Existing Tag' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_TAG_NAME');
    });

    it('should return 500 on database error', async () => {
      mockTagService.updateTag.mockRejectedValue(
        new AppError('Database error', 500, 'UPDATE_TAG_ERROR')
      );

      const response = await request(app)
        .put('/api/tags/tag-123')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // DELETE /api/tags/:id
  // ============================================
  describe('DELETE /api/tags/:id', () => {
    it('should return 200 with success message on delete', async () => {
      mockTagService.deleteTag.mockResolvedValue(mockTag);

      const response = await request(app).delete('/api/tags/tag-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { message: 'Tag deleted successfully' },
      });
      expect(mockTagService.deleteTag).toHaveBeenCalledWith('tag-123');
    });

    it('should return 404 when tag not found', async () => {
      mockTagService.deleteTag.mockRejectedValue(
        new AppError('Tag not found', 404, 'TAG_NOT_FOUND')
      );

      const response = await request(app).delete('/api/tags/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TAG_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockTagService.deleteTag.mockRejectedValue(
        new AppError('Database error', 500, 'DELETE_TAG_ERROR')
      );

      const response = await request(app).delete('/api/tags/tag-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should handle empty request body on POST', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          message: 'Required',
          path: ['name'],
        },
      ]);
      mockTagService.createTag.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/tags')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle empty request body on PUT', async () => {
      const updatedTag = mockTag;
      mockTagService.updateTag.mockResolvedValue(updatedTag);

      const response = await request(app)
        .put('/api/tags/tag-123')
        .send({})
        .set('Content-Type', 'application/json');

      // Empty update is valid (no fields changed)
      expect(response.status).toBe(200);
    });
  });
});
