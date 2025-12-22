import { Request, Response, NextFunction } from 'express';
import { tagService } from '../services/tagService';
import { AppError } from '../middleware/errorHandler';
import { ZodError } from 'zod';

export const tagController = {
  /**
   * Get all tags
   */
  async getAllTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await tagService.getAllTags();

      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single tag by ID
   */
  async getTagById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tag = await tagService.getTagById(id);

      res.json({
        success: true,
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new tag
   */
  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await tagService.createTag(req.body);

      res.status(201).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', error.errors));
      }
      next(error);
    }
  },

  /**
   * Update an existing tag
   */
  async updateTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tag = await tagService.updateTag(id, req.body);

      res.json({
        success: true,
        data: tag,
      });
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', error.errors));
      }
      next(error);
    }
  },

  /**
   * Delete a tag
   */
  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await tagService.deleteTag(id);

      res.json({
        success: true,
        data: { message: 'Tag deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  },
};
