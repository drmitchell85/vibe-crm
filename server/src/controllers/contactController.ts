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
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', error.errors));
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
        return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', error.errors));
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
  },

  /**
   * Get all contacts with optional advanced filtering
   */
  async getContactsWithFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const { tags, company, createdAfter, createdBefore, hasReminders, hasOverdueReminders } = req.query;

      // Parse tags query parameter (comma-separated tag IDs)
      let tagIds: string[] | undefined;
      if (tags && typeof tags === 'string') {
        tagIds = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }

      // Parse company filter
      const companyFilter = company && typeof company === 'string' ? company : undefined;

      // Parse date filters
      let createdAfterDate: Date | undefined;
      let createdBeforeDate: Date | undefined;
      if (createdAfter && typeof createdAfter === 'string') {
        createdAfterDate = new Date(createdAfter);
        if (isNaN(createdAfterDate.getTime())) {
          throw new AppError('Invalid createdAfter date format', 400, 'INVALID_DATE');
        }
      }
      if (createdBefore && typeof createdBefore === 'string') {
        createdBeforeDate = new Date(createdBefore);
        if (isNaN(createdBeforeDate.getTime())) {
          throw new AppError('Invalid createdBefore date format', 400, 'INVALID_DATE');
        }
      }

      // Parse boolean filters
      const hasRemindersFilter = hasReminders === 'true' ? true : undefined;
      const hasOverdueRemindersFilter = hasOverdueReminders === 'true' ? true : undefined;

      const contacts = await contactService.getContactsWithFilters({
        tagIds,
        company: companyFilter,
        createdAfter: createdAfterDate,
        createdBefore: createdBeforeDate,
        hasReminders: hasRemindersFilter,
        hasOverdueReminders: hasOverdueRemindersFilter,
      });

      res.json({
        success: true,
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all distinct company names for filter dropdown
   */
  async getDistinctCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await contactService.getDistinctCompanies();

      res.json({
        success: true,
        data: companies
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a tag to a contact
   */
  async addTagToContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { tagId } = req.body;

      if (!tagId || typeof tagId !== 'string') {
        throw new AppError('Tag ID is required', 400, 'MISSING_TAG_ID');
      }

      const contact = await contactService.addTagToContact(id, tagId);

      res.status(201).json({
        success: true,
        data: contact
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove a tag from a contact
   */
  async removeTagFromContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, tagId } = req.params;

      const contact = await contactService.removeTagFromContact(id, tagId);

      res.json({
        success: true,
        data: contact
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all contacts by tag
   */
  async getContactsByTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { tagId } = req.params;

      const contacts = await contactService.getContactsByTag(tagId);

      res.json({
        success: true,
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  }
};
