import { Request, Response, NextFunction } from 'express';
import { reminderService, ReminderFilters } from '../services/reminderService';
import { AppError } from '../middleware/errorHandler';
import { ZodError } from 'zod';

export const reminderController = {
  /**
   * Get all reminders for a contact
   */
  async getRemindersForContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { contactId } = req.params;
      const { isCompleted, startDate, endDate } = req.query;

      // Build filters from query params
      const filters: ReminderFilters = {};

      if (isCompleted !== undefined && typeof isCompleted === 'string') {
        filters.isCompleted = isCompleted === 'true';
      }

      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }

      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }

      const reminders = await reminderService.getRemindersForContact(contactId, filters);

      res.json({
        success: true,
        data: reminders
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all reminders (for reminders page)
   */
  async getAllReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const { isCompleted, startDate, endDate } = req.query;

      // Build filters from query params
      const filters: ReminderFilters = {};

      if (isCompleted !== undefined && typeof isCompleted === 'string') {
        filters.isCompleted = isCompleted === 'true';
      }

      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }

      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }

      const reminders = await reminderService.getAllReminders(filters);

      res.json({
        success: true,
        data: reminders
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get upcoming reminders
   */
  async getUpcomingReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const limitNum = limit && typeof limit === 'string' ? parseInt(limit, 10) : 5;

      const reminders = await reminderService.getUpcomingReminders(limitNum);

      res.json({
        success: true,
        data: reminders
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get overdue reminders
   */
  async getOverdueReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const reminders = await reminderService.getOverdueReminders();

      res.json({
        success: true,
        data: reminders
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single reminder by ID
   */
  async getReminderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const reminder = await reminderService.getReminderById(id);

      res.json({
        success: true,
        data: reminder
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new reminder for a contact
   */
  async createReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const { contactId } = req.params;

      // Merge contactId from URL with body
      const reminderData = {
        ...req.body,
        contactId
      };

      const reminder = await reminderService.createReminder(reminderData);

      res.status(201).json({
        success: true,
        data: reminder
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
   * Update an existing reminder
   */
  async updateReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const reminder = await reminderService.updateReminder(id, req.body);

      res.json({
        success: true,
        data: reminder
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
   * Mark a reminder as complete or incomplete
   */
  async toggleComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isCompleted } = req.body;

      let reminder;
      if (isCompleted === true) {
        reminder = await reminderService.markAsComplete(id);
      } else {
        reminder = await reminderService.markAsIncomplete(id);
      }

      res.json({
        success: true,
        data: reminder
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a reminder
   */
  async deleteReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await reminderService.deleteReminder(id);

      res.json({
        success: true,
        data: { message: 'Reminder deleted successfully' }
      });
    } catch (error) {
      next(error);
    }
  }
};
