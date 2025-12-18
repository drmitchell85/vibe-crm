import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contactService';
import { AppError } from '../middleware/errorHandler';
import { ZodError } from 'zod';

export const contactController = {
  /**
   * Get all contacts
   */
  async getAllContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const contacts = await contactService.getAllContacts();

      res.json({
        success: true,
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single contact by ID
   */
  async getContactById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contact = await contactService.getContactById(id);

      res.json({
        success: true,
        data: contact
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new contact
   */
  async createContact(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactService.createContact(req.body);

      res.status(201).json({
        success: true,
        data: contact
      });
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationError = new AppError(
          'Validation failed',
          400,
          'VALIDATION_ERROR'
        );
        (validationError as any).details = error.errors;
        return next(validationError);
      }
      next(error);
    }
  },

  /**
   * Update an existing contact
   */
  async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contact = await contactService.updateContact(id, req.body);

      res.json({
        success: true,
        data: contact
      });
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationError = new AppError(
          'Validation failed',
          400,
          'VALIDATION_ERROR'
        );
        (validationError as any).details = error.errors;
        return next(validationError);
      }
      next(error);
    }
  },

  /**
   * Delete a contact
   */
  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await contactService.deleteContact(id);

      res.json({
        success: true,
        data: { message: 'Contact deleted successfully' }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search contacts
   */
  async searchContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        throw new AppError('Search query is required', 400, 'MISSING_QUERY');
      }

      const contacts = await contactService.searchContacts(q);

      res.json({
        success: true,
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  }
};
