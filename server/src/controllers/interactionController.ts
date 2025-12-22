import { Request, Response, NextFunction } from 'express';
import { interactionService, InteractionFilters } from '../services/interactionService';
import { AppError } from '../middleware/errorHandler';
import { ZodError } from 'zod';
import { InteractionType } from '@prisma/client';

export const interactionController = {
  /**
   * Get all interactions for a contact
   */
  async getInteractionsForContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { contactId } = req.params;
      const { type, startDate, endDate } = req.query;

      // Build filters from query params
      const filters: InteractionFilters = {};

      if (type && typeof type === 'string') {
        // Validate type is a valid InteractionType
        const validTypes = ['CALL', 'MEETING', 'EMAIL', 'TEXT', 'COFFEE', 'LUNCH', 'EVENT', 'OTHER'];
        if (validTypes.includes(type)) {
          filters.type = type as InteractionType;
        } else {
          throw new AppError('Invalid interaction type', 400, 'INVALID_TYPE');
        }
      }

      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }

      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }

      const interactions = await interactionService.getInteractionsForContact(contactId, filters);

      res.json({
        success: true,
        data: interactions
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single interaction by ID
   */
  async getInteractionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const interaction = await interactionService.getInteractionById(id);

      res.json({
        success: true,
        data: interaction
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new interaction for a contact
   */
  async createInteraction(req: Request, res: Response, next: NextFunction) {
    try {
      const { contactId } = req.params;

      // Merge contactId from URL with body
      const interactionData = {
        ...req.body,
        contactId
      };

      const interaction = await interactionService.createInteraction(interactionData);

      res.status(201).json({
        success: true,
        data: interaction
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
   * Update an existing interaction
   */
  async updateInteraction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const interaction = await interactionService.updateInteraction(id, req.body);

      res.json({
        success: true,
        data: interaction
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
   * Delete an interaction
   */
  async deleteInteraction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await interactionService.deleteInteraction(id);

      res.json({
        success: true,
        data: { message: 'Interaction deleted successfully' }
      });
    } catch (error) {
      next(error);
    }
  }
};
