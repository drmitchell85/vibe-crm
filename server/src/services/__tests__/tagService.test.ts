/**
 * Unit Tests for Tag Service
 *
 * Tests the business logic layer for tag operations.
 * Prisma is mocked to isolate service logic from database.
 */

import { AppError } from '../../middleware/errorHandler';

// Mock Prisma client (imported via contactService)
const mockPrismaTag = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../contactService', () => ({
  prisma: {
    tag: mockPrismaTag,
  },
}));

// Import after mocking
import { tagService } from '../tagService';

describe('tagService', () => {
  // Valid UUID for test data
  const validTagId = '550e8400-e29b-41d4-a716-446655440000';

  // Sample test data
  const mockTag = {
    id: validTagId,
    name: 'Backgammon',
    color: '#FF5733',
    createdAt: new Date(),
  };

  const mockTagWithCount = {
    ...mockTag,
    _count: { contacts: 5 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getAllTags
  // ============================================
  describe('getAllTags', () => {
    it('should return an array of tags with contact counts ordered by name', async () => {
      const tags = [
        { ...mockTag, name: 'Backgammon', _count: { contacts: 5 } },
        { ...mockTag, id: 'tag-2', name: 'Tech', _count: { contacts: 3 } },
      ];
      mockPrismaTag.findMany.mockResolvedValue(tags);

      const result = await tagService.getAllTags();

      expect(result).toEqual([
        { id: validTagId, name: 'Backgammon', color: '#FF5733', createdAt: mockTag.createdAt, contactCount: 5 },
        { id: 'tag-2', name: 'Tech', color: '#FF5733', createdAt: mockTag.createdAt, contactCount: 3 },
      ]);
      expect(mockPrismaTag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      });
    });

    it('should return empty array when no tags exist', async () => {
      mockPrismaTag.findMany.mockResolvedValue([]);

      const result = await tagService.getAllTags();

      expect(result).toEqual([]);
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaTag.findMany.mockRejectedValue(new Error('DB error'));

      await expect(tagService.getAllTags()).rejects.toThrow(AppError);
      await expect(tagService.getAllTags()).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_TAGS_ERROR',
      });
    });
  });

  // ============================================
  // getTagById
  // ============================================
  describe('getTagById', () => {
    it('should return a tag with contact count when found', async () => {
      mockPrismaTag.findUnique.mockResolvedValue(mockTagWithCount);

      const result = await tagService.getTagById(validTagId);

      expect(result).toEqual({
        id: validTagId,
        name: 'Backgammon',
        color: '#FF5733',
        createdAt: mockTag.createdAt,
        contactCount: 5,
      });
      expect(mockPrismaTag.findUnique).toHaveBeenCalledWith({
        where: { id: validTagId },
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      });
    });

    it('should throw 404 when tag not found', async () => {
      mockPrismaTag.findUnique.mockResolvedValue(null);

      await expect(tagService.getTagById('non-existent')).rejects.toThrow(AppError);
      await expect(tagService.getTagById('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'TAG_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaTag.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(tagService.getTagById(validTagId)).rejects.toThrow(AppError);
      await expect(tagService.getTagById(validTagId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_TAG_ERROR',
      });
    });
  });

  // ============================================
  // createTag
  // ============================================
  describe('createTag', () => {
    const validCreateData = {
      name: 'New Tag',
      color: '#00FF00',
    };

    it('should create and return a new tag with all fields', async () => {
      const createdTag = { ...mockTag, name: 'New Tag', color: '#00FF00' };
      mockPrismaTag.create.mockResolvedValue(createdTag);

      const result = await tagService.createTag(validCreateData);

      expect(result).toEqual({ ...createdTag, contactCount: 0 });
      expect(mockPrismaTag.create).toHaveBeenCalledWith({
        data: {
          name: 'New Tag',
          color: '#00FF00',
        },
      });
    });

    it('should create tag with default color when not provided', async () => {
      const createdTag = { ...mockTag, name: 'Minimal Tag', color: '#6B7280' };
      mockPrismaTag.create.mockResolvedValue(createdTag);

      const result = await tagService.createTag({ name: 'Minimal Tag' });

      expect(result.color).toBe('#6B7280');
      expect(mockPrismaTag.create).toHaveBeenCalledWith({
        data: {
          name: 'Minimal Tag',
          color: '#6B7280',
        },
      });
    });

    it('should trim whitespace from tag name', async () => {
      const createdTag = { ...mockTag, name: 'Trimmed' };
      mockPrismaTag.create.mockResolvedValue(createdTag);

      await tagService.createTag({ name: '  Trimmed  ' });

      expect(mockPrismaTag.create).toHaveBeenCalledWith({
        data: {
          name: 'Trimmed',
          color: '#6B7280',
        },
      });
    });

    it('should throw 409 when tag name already exists', async () => {
      mockPrismaTag.create.mockRejectedValue({ code: 'P2002' });

      await expect(tagService.createTag(validCreateData)).rejects.toThrow(AppError);
      await expect(tagService.createTag(validCreateData)).rejects.toMatchObject({
        statusCode: 409,
        code: 'DUPLICATE_TAG_NAME',
      });
    });

    it('should throw validation error when name is missing', async () => {
      await expect(tagService.createTag({} as any)).rejects.toThrow();
    });

    it('should throw validation error when name is empty', async () => {
      await expect(tagService.createTag({ name: '' })).rejects.toThrow();
    });

    it('should throw validation error when name is too long (> 50 chars)', async () => {
      const longName = 'a'.repeat(51);
      await expect(tagService.createTag({ name: longName })).rejects.toThrow();
    });

    it('should throw validation error for invalid color format', async () => {
      await expect(tagService.createTag({ name: 'Test', color: 'not-a-color' })).rejects.toThrow();
      await expect(tagService.createTag({ name: 'Test', color: '#GGG' })).rejects.toThrow();
      await expect(tagService.createTag({ name: 'Test', color: 'FF5733' })).rejects.toThrow();
    });

    it('should accept valid 3-digit hex color', async () => {
      const createdTag = { ...mockTag, name: 'ShortColor', color: '#FFF' };
      mockPrismaTag.create.mockResolvedValue(createdTag);

      const result = await tagService.createTag({ name: 'ShortColor', color: '#FFF' });

      expect(result.color).toBe('#FFF');
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaTag.create.mockRejectedValue(new Error('DB error'));

      await expect(tagService.createTag(validCreateData)).rejects.toThrow(AppError);
      await expect(tagService.createTag(validCreateData)).rejects.toMatchObject({
        statusCode: 500,
        code: 'CREATE_TAG_ERROR',
      });
    });
  });

  // ============================================
  // updateTag
  // ============================================
  describe('updateTag', () => {
    beforeEach(() => {
      // getTagById is called to check existence
      mockPrismaTag.findUnique.mockResolvedValue(mockTagWithCount);
    });

    it('should update and return the tag with valid data', async () => {
      const updateData = { name: 'Updated Name', color: '#0000FF' };
      const updatedTag = { ...mockTag, ...updateData, _count: { contacts: 5 } };
      mockPrismaTag.update.mockResolvedValue(updatedTag);

      const result = await tagService.updateTag(validTagId, updateData);

      expect(result).toEqual({
        id: validTagId,
        name: 'Updated Name',
        color: '#0000FF',
        createdAt: mockTag.createdAt,
        contactCount: 5,
      });
      expect(mockPrismaTag.update).toHaveBeenCalledWith({
        where: { id: validTagId },
        data: {
          name: 'Updated Name',
          color: '#0000FF',
        },
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      });
    });

    it('should throw 404 when tag not found', async () => {
      mockPrismaTag.findUnique.mockResolvedValue(null);

      await expect(tagService.updateTag(validTagId, { name: 'Test' })).rejects.toThrow(AppError);
      await expect(tagService.updateTag(validTagId, { name: 'Test' })).rejects.toMatchObject({
        statusCode: 404,
        code: 'TAG_NOT_FOUND',
      });
    });

    it('should allow partial update (name only)', async () => {
      const updateData = { name: 'Only Name' };
      const updatedTag = { ...mockTag, ...updateData, _count: { contacts: 5 } };
      mockPrismaTag.update.mockResolvedValue(updatedTag);

      const result = await tagService.updateTag(validTagId, updateData);

      expect(result.name).toBe('Only Name');
      expect(mockPrismaTag.update).toHaveBeenCalledWith({
        where: { id: validTagId },
        data: {
          name: 'Only Name',
          color: undefined,
        },
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      });
    });

    it('should allow partial update (color only)', async () => {
      const updateData = { color: '#ABCDEF' };
      const updatedTag = { ...mockTag, ...updateData, _count: { contacts: 5 } };
      mockPrismaTag.update.mockResolvedValue(updatedTag);

      const result = await tagService.updateTag(validTagId, updateData);

      expect(result.color).toBe('#ABCDEF');
    });

    it('should trim whitespace from updated name', async () => {
      const updatedTag = { ...mockTag, name: 'Trimmed', _count: { contacts: 5 } };
      mockPrismaTag.update.mockResolvedValue(updatedTag);

      await tagService.updateTag(validTagId, { name: '  Trimmed  ' });

      expect(mockPrismaTag.update).toHaveBeenCalledWith({
        where: { id: validTagId },
        data: {
          name: 'Trimmed',
          color: undefined,
        },
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      });
    });

    it('should throw 409 when updating to duplicate name', async () => {
      mockPrismaTag.update.mockRejectedValue({ code: 'P2002' });

      await expect(tagService.updateTag(validTagId, { name: 'Existing' })).rejects.toThrow(
        AppError
      );
      await expect(tagService.updateTag(validTagId, { name: 'Existing' })).rejects.toMatchObject({
        statusCode: 409,
        code: 'DUPLICATE_TAG_NAME',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaTag.update.mockRejectedValue(new Error('DB error'));

      await expect(tagService.updateTag(validTagId, { name: 'Test' })).rejects.toThrow(AppError);
      await expect(tagService.updateTag(validTagId, { name: 'Test' })).rejects.toMatchObject({
        statusCode: 500,
        code: 'UPDATE_TAG_ERROR',
      });
    });
  });

  // ============================================
  // deleteTag
  // ============================================
  describe('deleteTag', () => {
    beforeEach(() => {
      mockPrismaTag.findUnique.mockResolvedValue(mockTagWithCount);
    });

    it('should delete and return the tag with contact count', async () => {
      mockPrismaTag.delete.mockResolvedValue(mockTag);

      const result = await tagService.deleteTag(validTagId);

      expect(result).toEqual({
        id: validTagId,
        name: 'Backgammon',
        color: '#FF5733',
        createdAt: mockTag.createdAt,
        contactCount: 5,
      });
      expect(mockPrismaTag.delete).toHaveBeenCalledWith({
        where: { id: validTagId },
      });
    });

    it('should throw 404 when tag not found', async () => {
      mockPrismaTag.findUnique.mockResolvedValue(null);

      await expect(tagService.deleteTag('non-existent')).rejects.toThrow(AppError);
      await expect(tagService.deleteTag('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'TAG_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaTag.delete.mockRejectedValue(new Error('DB error'));

      await expect(tagService.deleteTag(validTagId)).rejects.toThrow(AppError);
      await expect(tagService.deleteTag(validTagId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'DELETE_TAG_ERROR',
      });
    });
  });
});
