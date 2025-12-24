import { Request, Response, NextFunction } from 'express';
import { noteService } from '../services/noteService';
import { AppError } from '../middleware/errorHandler';
import { ZodError } from 'zod';

export const noteController = {
  /**
   * Get all notes for a contact
   */
  async getNotesForContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { contactId } = req.params;
      const notes = await noteService.getNotesForContact(contactId);

      res.json({
        success: true,
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single note by ID
   */
  async getNoteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const note = await noteService.getNoteById(id);

      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new note for a contact
   */
  async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { contactId } = req.params;
      const note = await noteService.createNote(contactId, req.body);

      res.status(201).json({
        success: true,
        data: note,
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
   * Update an existing note
   */
  async updateNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const note = await noteService.updateNote(id, req.body);

      res.json({
        success: true,
        data: note,
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
   * Delete a note
   */
  async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await noteService.deleteNote(id);

      res.json({
        success: true,
        data: { message: 'Note deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle pin status of a note
   */
  async togglePin(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const note = await noteService.togglePin(id);

      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  },
};
