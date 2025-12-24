import { prisma } from './contactService';
import {
  createTagSchema,
  updateTagSchema,
  CreateTagInput,
  UpdateTagInput,
  DEFAULT_TAG_COLOR,
} from '../schemas/tagSchema';
import { AppError } from '../middleware/errorHandler';

export const tagService = {
  /**
   * Get all tags with contact counts
   * @returns Array of all tags ordered by name
   */
  async getAllTags() {
    try {
      const tags = await prisma.tag.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      });

      // Transform to include contactCount at top level
      return tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt,
        contactCount: tag._count.contacts,
      }));
    } catch (error) {
      throw new AppError('Failed to fetch tags', 500, 'FETCH_TAGS_ERROR');
    }
  },

  /**
   * Get a single tag by ID with contact count
   * @param id - Tag ID
   * @returns Tag with contact count or throws if not found
   */
  async getTagById(id: string) {
    try {
      const tag = await prisma.tag.findUnique({
        where: { id },
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      });

      if (!tag) {
        throw new AppError('Tag not found', 404, 'TAG_NOT_FOUND');
      }

      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt,
        contactCount: tag._count.contacts,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch tag', 500, 'FETCH_TAG_ERROR');
    }
  },

  /**
   * Create a new tag
   * @param data - Tag data (name required, color optional)
   * @returns Created tag
   */
  async createTag(data: CreateTagInput) {
    // Validate input data
    const validatedData = createTagSchema.parse(data);

    try {
      const tag = await prisma.tag.create({
        data: {
          name: validatedData.name.trim(),
          color: validatedData.color || DEFAULT_TAG_COLOR,
        },
      });

      return {
        ...tag,
        contactCount: 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // Handle unique constraint violations (duplicate tag name)
      if ((error as any).code === 'P2002') {
        throw new AppError('A tag with this name already exists', 409, 'DUPLICATE_TAG_NAME');
      }
      throw new AppError('Failed to create tag', 500, 'CREATE_TAG_ERROR');
    }
  },

  /**
   * Update an existing tag
   * @param id - Tag ID
   * @param data - Partial tag data to update
   * @returns Updated tag with contact count
   */
  async updateTag(id: string, data: UpdateTagInput) {
    // Validate input data
    const validatedData = updateTagSchema.parse(data);

    try {
      // Check if tag exists
      await this.getTagById(id);

      const tag = await prisma.tag.update({
        where: { id },
        data: {
          name: validatedData.name?.trim(),
          color: validatedData.color,
        },
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      });

      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt,
        contactCount: tag._count.contacts,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // Handle unique constraint violations (duplicate tag name)
      if ((error as any).code === 'P2002') {
        throw new AppError('A tag with this name already exists', 409, 'DUPLICATE_TAG_NAME');
      }
      throw new AppError('Failed to update tag', 500, 'UPDATE_TAG_ERROR');
    }
  },

  /**
   * Delete a tag
   * Note: This automatically removes the tag from all contacts due to Prisma cascade
   * @param id - Tag ID
   * @returns Deleted tag
   */
  async deleteTag(id: string) {
    try {
      // Check if tag exists (and get contact count for return value)
      const existingTag = await this.getTagById(id);

      await prisma.tag.delete({
        where: { id },
      });

      return existingTag;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete tag', 500, 'DELETE_TAG_ERROR');
    }
  },
};
