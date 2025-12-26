import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/statsService';

export const statsController = {
  /**
   * Get main dashboard statistics
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get contact growth data for the last 12 months
   */
  async getContactGrowth(req: Request, res: Response, next: NextFunction) {
    try {
      const growth = await statsService.getContactGrowth();

      res.json({
        success: true,
        data: growth,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get interaction breakdown by type
   */
  async getInteractionBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const breakdown = await statsService.getInteractionBreakdown();

      res.json({
        success: true,
        data: breakdown,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recent activity feed
   */
  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const limitNum = limit && typeof limit === 'string' ? parseInt(limit, 10) : 10;

      const activity = await statsService.getRecentActivity(limitNum);

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  },
};
