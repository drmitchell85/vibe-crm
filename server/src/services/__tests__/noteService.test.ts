/**
 * Unit Tests for Note Service
 *
 * Tests the business logic layer for note operations.
 * Prisma is mocked to isolate service logic from database.
 */

import { AppError } from '../../middleware/errorHandler';

// Mock Prisma client (imported via contactService)
const mockPrismaNote = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaContact = {
  findUnique: jest.fn(),
};

jest.mock('../contactService', () => ({
  prisma: {
    note: mockPrismaNote,
    contact: mockPrismaContact,
  },
}));

// Import after mocking
import { noteService } from '../noteService';

describe('noteService', () => {
  // Valid UUIDs for test data
  const validNoteId = '550e8400-e29b-41d4-a716-446655440000';
  const validContactId = '550e8400-e29b-41d4-a716-446655440001';

  // Sample test data
  const mockContact = {
    id: validContactId,
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockNote = {
    id: validNoteId,
    contactId: validContactId,
    content: 'This is a test note.',
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPinnedNote = {
    ...mockNote,
    id: 'pinned-note-id',
    content: 'This is a pinned note.',
    isPinned: true,
  };

  const mockNoteWithContact = {
    ...mockNote,
    contact: mockContact,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getNotesForContact
  // ============================================
  describe('getNotesForContact', () => {
    beforeEach(() => {
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
    });

    it('should return an array of notes ordered by pinned first, then by creation date', async () => {
      const notes = [mockPinnedNote, mockNote];
      mockPrismaNote.findMany.mockResolvedValue(notes);

      const result = await noteService.getNotesForContact(validContactId);

      expect(result).toEqual(notes);
      expect(mockPrismaContact.findUnique).toHaveBeenCalledWith({
        where: { id: validContactId },
      });
      expect(mockPrismaNote.findMany).toHaveBeenCalledWith({
        where: { contactId: validContactId },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    });

    it('should return empty array when contact has no notes', async () => {
      mockPrismaNote.findMany.mockResolvedValue([]);

      const result = await noteService.getNotesForContact(validContactId);

      expect(result).toEqual([]);
    });

    it('should throw 404 when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(noteService.getNotesForContact('non-existent')).rejects.toThrow(AppError);
      await expect(noteService.getNotesForContact('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(noteService.getNotesForContact(validContactId)).rejects.toThrow(AppError);
      await expect(noteService.getNotesForContact(validContactId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_NOTES_ERROR',
      });
    });
  });

  // ============================================
  // getNoteById
  // ============================================
  describe('getNoteById', () => {
    it('should return a note with contact info when found', async () => {
      mockPrismaNote.findUnique.mockResolvedValue(mockNoteWithContact);

      const result = await noteService.getNoteById(validNoteId);

      expect(result).toEqual(mockNoteWithContact);
      expect(mockPrismaNote.findUnique).toHaveBeenCalledWith({
        where: { id: validNoteId },
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
    });

    it('should throw 404 when note not found', async () => {
      mockPrismaNote.findUnique.mockResolvedValue(null);

      await expect(noteService.getNoteById('non-existent')).rejects.toThrow(AppError);
      await expect(noteService.getNoteById('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOTE_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaNote.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(noteService.getNoteById(validNoteId)).rejects.toThrow(AppError);
      await expect(noteService.getNoteById(validNoteId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_NOTE_ERROR',
      });
    });
  });

  // ============================================
  // createNote
  // ============================================
  describe('createNote', () => {
    const validCreateData = {
      content: 'New note content',
      isPinned: false,
    };

    beforeEach(() => {
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
    });

    it('should create and return a new note with all fields', async () => {
      const createdNote = { ...mockNote, content: 'New note content' };
      mockPrismaNote.create.mockResolvedValue(createdNote);

      const result = await noteService.createNote(validContactId, validCreateData);

      expect(result).toEqual(createdNote);
      expect(mockPrismaNote.create).toHaveBeenCalledWith({
        data: {
          contactId: validContactId,
          content: 'New note content',
          isPinned: false,
        },
      });
    });

    it('should create note with isPinned set to true', async () => {
      const createdNote = { ...mockNote, isPinned: true };
      mockPrismaNote.create.mockResolvedValue(createdNote);

      const result = await noteService.createNote(validContactId, { content: 'Pinned note', isPinned: true });

      expect(result.isPinned).toBe(true);
      expect(mockPrismaNote.create).toHaveBeenCalledWith({
        data: {
          contactId: validContactId,
          content: 'Pinned note',
          isPinned: true,
        },
      });
    });

    it('should create note with default isPinned (false) when not provided', async () => {
      const createdNote = { ...mockNote };
      mockPrismaNote.create.mockResolvedValue(createdNote);

      await noteService.createNote(validContactId, { content: 'Minimal note' });

      expect(mockPrismaNote.create).toHaveBeenCalledWith({
        data: {
          contactId: validContactId,
          content: 'Minimal note',
          isPinned: false,
        },
      });
    });

    it('should throw 404 when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(noteService.createNote('non-existent', validCreateData)).rejects.toThrow(AppError);
      await expect(noteService.createNote('non-existent', validCreateData)).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should throw validation error when content is missing', async () => {
      await expect(noteService.createNote(validContactId, {} as any)).rejects.toThrow();
    });

    it('should throw validation error when content is empty', async () => {
      await expect(noteService.createNote(validContactId, { content: '' })).rejects.toThrow();
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaNote.create.mockRejectedValue(new Error('DB error'));

      await expect(noteService.createNote(validContactId, validCreateData)).rejects.toThrow(AppError);
      await expect(noteService.createNote(validContactId, validCreateData)).rejects.toMatchObject({
        statusCode: 500,
        code: 'CREATE_NOTE_ERROR',
      });
    });
  });

  // ============================================
  // updateNote
  // ============================================
  describe('updateNote', () => {
    beforeEach(() => {
      // getNoteById is called to check existence
      mockPrismaNote.findUnique.mockResolvedValue(mockNoteWithContact);
    });

    it('should update and return the note with valid data', async () => {
      const updateData = { content: 'Updated content', isPinned: true };
      const updatedNote = { ...mockNote, ...updateData };
      mockPrismaNote.update.mockResolvedValue(updatedNote);

      const result = await noteService.updateNote(validNoteId, updateData);

      expect(result).toEqual(updatedNote);
      expect(mockPrismaNote.update).toHaveBeenCalledWith({
        where: { id: validNoteId },
        data: {
          content: 'Updated content',
          isPinned: true,
        },
      });
    });

    it('should throw 404 when note not found', async () => {
      mockPrismaNote.findUnique.mockResolvedValue(null);

      await expect(noteService.updateNote(validNoteId, { content: 'Test' })).rejects.toThrow(AppError);
      await expect(noteService.updateNote(validNoteId, { content: 'Test' })).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOTE_NOT_FOUND',
      });
    });

    it('should allow partial update (content only)', async () => {
      const updateData = { content: 'Only content updated' };
      const updatedNote = { ...mockNote, ...updateData };
      mockPrismaNote.update.mockResolvedValue(updatedNote);

      const result = await noteService.updateNote(validNoteId, updateData);

      expect(result.content).toBe('Only content updated');
      expect(mockPrismaNote.update).toHaveBeenCalledWith({
        where: { id: validNoteId },
        data: {
          content: 'Only content updated',
          isPinned: undefined,
        },
      });
    });

    it('should allow partial update (isPinned only)', async () => {
      const updateData = { isPinned: true };
      const updatedNote = { ...mockNote, ...updateData };
      mockPrismaNote.update.mockResolvedValue(updatedNote);

      const result = await noteService.updateNote(validNoteId, updateData);

      expect(result.isPinned).toBe(true);
      expect(mockPrismaNote.update).toHaveBeenCalledWith({
        where: { id: validNoteId },
        data: {
          content: undefined,
          isPinned: true,
        },
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaNote.update.mockRejectedValue(new Error('DB error'));

      await expect(noteService.updateNote(validNoteId, { content: 'Test' })).rejects.toThrow(AppError);
      await expect(noteService.updateNote(validNoteId, { content: 'Test' })).rejects.toMatchObject({
        statusCode: 500,
        code: 'UPDATE_NOTE_ERROR',
      });
    });
  });

  // ============================================
  // deleteNote
  // ============================================
  describe('deleteNote', () => {
    beforeEach(() => {
      mockPrismaNote.findUnique.mockResolvedValue(mockNoteWithContact);
    });

    it('should delete and return the note', async () => {
      mockPrismaNote.delete.mockResolvedValue(mockNote);

      const result = await noteService.deleteNote(validNoteId);

      expect(result).toEqual(mockNoteWithContact);
      expect(mockPrismaNote.delete).toHaveBeenCalledWith({
        where: { id: validNoteId },
      });
    });

    it('should throw 404 when note not found', async () => {
      mockPrismaNote.findUnique.mockResolvedValue(null);

      await expect(noteService.deleteNote('non-existent')).rejects.toThrow(AppError);
      await expect(noteService.deleteNote('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOTE_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaNote.delete.mockRejectedValue(new Error('DB error'));

      await expect(noteService.deleteNote(validNoteId)).rejects.toThrow(AppError);
      await expect(noteService.deleteNote(validNoteId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'DELETE_NOTE_ERROR',
      });
    });
  });

  // ============================================
  // togglePin
  // ============================================
  describe('togglePin', () => {
    it('should toggle isPinned from false to true', async () => {
      mockPrismaNote.findUnique.mockResolvedValue({ ...mockNoteWithContact, isPinned: false });
      const toggledNote = { ...mockNote, isPinned: true };
      mockPrismaNote.update.mockResolvedValue(toggledNote);

      const result = await noteService.togglePin(validNoteId);

      expect(result.isPinned).toBe(true);
      expect(mockPrismaNote.update).toHaveBeenCalledWith({
        where: { id: validNoteId },
        data: { isPinned: true },
      });
    });

    it('should toggle isPinned from true to false', async () => {
      mockPrismaNote.findUnique.mockResolvedValue({ ...mockNoteWithContact, isPinned: true });
      const toggledNote = { ...mockNote, isPinned: false };
      mockPrismaNote.update.mockResolvedValue(toggledNote);

      const result = await noteService.togglePin(validNoteId);

      expect(result.isPinned).toBe(false);
      expect(mockPrismaNote.update).toHaveBeenCalledWith({
        where: { id: validNoteId },
        data: { isPinned: false },
      });
    });

    it('should throw 404 when note not found', async () => {
      mockPrismaNote.findUnique.mockResolvedValue(null);

      await expect(noteService.togglePin('non-existent')).rejects.toThrow(AppError);
      await expect(noteService.togglePin('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOTE_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaNote.findUnique.mockResolvedValue(mockNoteWithContact);
      mockPrismaNote.update.mockRejectedValue(new Error('DB error'));

      await expect(noteService.togglePin(validNoteId)).rejects.toThrow(AppError);
      await expect(noteService.togglePin(validNoteId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'TOGGLE_PIN_ERROR',
      });
    });
  });
});
