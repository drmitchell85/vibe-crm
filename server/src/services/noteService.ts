import { prisma } from './contactService';
import {
  createNoteSchema,
  updateNoteSchema,
  CreateNoteInput,
  UpdateNoteInput,
} from '../schemas/noteSchema';
import { AppError } from '../middleware/errorHandler';

export const noteService = {
  /**
   * Get all notes for a specific contact
   * @param contactId - Contact ID
   * @returns Array of notes ordered by: pinned first, then by creation date (newest first)
   */
  async getNotesForContact(contactId: string) {
    try {
      // Verify contact exists
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
      });

      if (!contact) {
        throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      const notes = await prisma.note.findMany({
        where: { contactId },
        orderBy: [
          { isPinned: 'desc' }, // Pinned notes first
          { createdAt: 'desc' }, // Then by creation date (newest first)
        ],
      });

      return notes;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch notes', 500, 'FETCH_NOTES_ERROR');
    }
  },

  /**
   * Get a single note by ID
   * @param id - Note ID
   * @returns Note or throws if not found
   */
  async getNoteById(id: string) {
    try {
      const note = await prisma.note.findUnique({
        where: { id },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!note) {
        throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');
      }

      return note;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch note', 500, 'FETCH_NOTE_ERROR');
    }
  },

  /**
   * Create a new note for a contact
   * @param contactId - Contact ID
   * @param data - Note data (content required, isPinned optional)
   * @returns Created note
   */
  async createNote(contactId: string, data: CreateNoteInput) {
    // Validate input data
    const validatedData = createNoteSchema.parse(data);

    try {
      // Verify contact exists
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
      });

      if (!contact) {
        throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      const note = await prisma.note.create({
        data: {
          contactId,
          content: validatedData.content,
          isPinned: validatedData.isPinned ?? false,
        },
      });

      return note;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create note', 500, 'CREATE_NOTE_ERROR');
    }
  },

  /**
   * Update an existing note
   * @param id - Note ID
   * @param data - Partial note data to update
   * @returns Updated note
   */
  async updateNote(id: string, data: UpdateNoteInput) {
    // Validate input data
    const validatedData = updateNoteSchema.parse(data);

    try {
      // Check if note exists
      await this.getNoteById(id);

      const note = await prisma.note.update({
        where: { id },
        data: {
          content: validatedData.content,
          isPinned: validatedData.isPinned,
        },
      });

      return note;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update note', 500, 'UPDATE_NOTE_ERROR');
    }
  },

  /**
   * Delete a note
   * @param id - Note ID
   * @returns Deleted note
   */
  async deleteNote(id: string) {
    try {
      // Check if note exists
      const existingNote = await this.getNoteById(id);

      await prisma.note.delete({
        where: { id },
      });

      return existingNote;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete note', 500, 'DELETE_NOTE_ERROR');
    }
  },

  /**
   * Toggle the pinned status of a note
   * @param id - Note ID
   * @returns Updated note with toggled isPinned status
   */
  async togglePin(id: string) {
    try {
      // Get current note state
      const existingNote = await this.getNoteById(id);

      const note = await prisma.note.update({
        where: { id },
        data: {
          isPinned: !existingNote.isPinned,
        },
      });

      return note;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to toggle pin status', 500, 'TOGGLE_PIN_ERROR');
    }
  },
};
