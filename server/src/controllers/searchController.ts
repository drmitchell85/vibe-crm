import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/searchService';
import { AppError } from '../middleware/errorHandler';

export const searchController = {
  /**
   * Global search across all entities
   * GET /api/search?q=query&limit=10
   */
  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit } = req.query;

      if (!q || typeof q !== 'string') {
        throw new AppError('Search query parameter "q" is required', 400, 'MISSING_QUERY');
      }

      const limitNum = limit ? parseInt(limit as string, 10) : 10;
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        throw new AppError('Limit must be a number between 1 and 50', 400, 'INVALID_LIMIT');
      }

      const results = await searchService.globalSearch(q, limitNum);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },
};
