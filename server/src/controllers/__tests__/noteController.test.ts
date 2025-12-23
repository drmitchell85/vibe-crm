/**
 * Integration Tests for Note Controller
 *
 * Tests the HTTP layer of the notes API using supertest.
 * The service layer is mocked to isolate controller behavior.
 */

import request from 'supertest';
import { AppError } from '../../middleware/errorHandler';

// Mock the note service
const mockNoteService = {
  getNotesForContact: jest.fn(),
  getNoteById: jest.fn(),
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  togglePin: jest.fn(),
};

jest.mock('../../services/noteService', () => ({
  noteService: mockNoteService,
}));

// Import app after mocking
import app from '../../app';

describe('Note Controller - Integration Tests', () => {
  // Sample test data
  const mockNote = {
    id: 'note-123',
    contactId: 'contact-123',
    content: 'This is a test note.',
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPinnedNote = {
    ...mockNote,
    id: 'note-456',
    content: 'This is a pinned note.',
    isPinned: true,
  };

  const mockNoteWithContact = {
    ...mockNote,
    contact: {
      id: 'contact-123',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/contacts/:contactId/notes
  // ============================================
  describe('GET /api/contacts/:contactId/notes', () => {
    it('should return 200 with array of notes for a contact', async () => {
      const notes = [mockPinnedNote, mockNote];
      mockNoteService.getNotesForContact.mockResolvedValue(notes);

      const response = await request(app).get('/api/contacts/contact-123/notes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: notes,
      });
      expect(mockNoteService.getNotesForContact).toHaveBeenCalledWith('contact-123');
    });

    it('should return 200 with empty array when contact has no notes', async () => {
      mockNoteService.getNotesForContact.mockResolvedValue([]);

      const response = await request(app).get('/api/contacts/contact-123/notes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 404 when contact not found', async () => {
      mockNoteService.getNotesForContact.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app).get('/api/contacts/non-existent/notes');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockNoteService.getNotesForContact.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_NOTES_ERROR')
      );

      const response = await request(app).get('/api/contacts/contact-123/notes');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/notes/:id
  // ============================================
  describe('GET /api/notes/:id', () => {
    it('should return 200 with note when found', async () => {
      mockNoteService.getNoteById.mockResolvedValue(mockNoteWithContact);

      const response = await request(app).get('/api/notes/note-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockNoteWithContact,
      });
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith('note-123');
    });

    it('should return 404 when note not found', async () => {
      mockNoteService.getNoteById.mockRejectedValue(
        new AppError('Note not found', 404, 'NOTE_NOT_FOUND')
      );

      const response = await request(app).get('/api/notes/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOTE_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockNoteService.getNoteById.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_NOTE_ERROR')
      );

      const response = await request(app).get('/api/notes/note-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // POST /api/contacts/:contactId/notes
  // ============================================
  describe('POST /api/contacts/:contactId/notes', () => {
    const validCreateData = {
      content: 'New note content',
      isPinned: false,
    };

    it('should return 201 with created note on success', async () => {
      const createdNote = { ...mockNote, content: 'New note content' };
      mockNoteService.createNote.mockResolvedValue(createdNote);

      const response = await request(app)
        .post('/api/contacts/contact-123/notes')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: createdNote,
      });
      expect(mockNoteService.createNote).toHaveBeenCalledWith('contact-123', validCreateData);
    });

    it('should return 201 with minimal data (content only)', async () => {
      const minimalData = { content: 'Just content' };
      const createdNote = { ...mockNote, content: 'Just content' };
      mockNoteService.createNote.mockResolvedValue(createdNote);

      const response = await request(app)
        .post('/api/contacts/contact-123/notes')
        .send(minimalData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 201 with pinned note', async () => {
      const pinnedData = { content: 'Pinned note', isPinned: true };
      const createdNote = { ...mockNote, ...pinnedData };
      mockNoteService.createNote.mockResolvedValue(createdNote);

      const response = await request(app)
        .post('/api/contacts/contact-123/notes')
        .send(pinnedData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.data.isPinned).toBe(true);
    });

    it('should return 400 on validation error (missing content)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Note content is required',
          path: ['content'],
        },
      ]);
      mockNoteService.createNote.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts/contact-123/notes')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (empty content)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Note content is required',
          path: ['content'],
        },
      ]);
      mockNoteService.createNote.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts/contact-123/notes')
        .send({ content: '' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when contact not found', async () => {
      mockNoteService.createNote.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app)
        .post('/api/contacts/non-existent/notes')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockNoteService.createNote.mockRejectedValue(
        new AppError('Database error', 500, 'CREATE_NOTE_ERROR')
      );

      const response = await request(app)
        .post('/api/contacts/contact-123/notes')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // PUT /api/notes/:id
  // ============================================
  describe('PUT /api/notes/:id', () => {
    const updateData = {
      content: 'Updated content',
      isPinned: true,
    };

    it('should return 200 with updated note on success', async () => {
      const updatedNote = { ...mockNote, ...updateData };
      mockNoteService.updateNote.mockResolvedValue(updatedNote);

      const response = await request(app)
        .put('/api/notes/note-123')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: updatedNote,
      });
      expect(mockNoteService.updateNote).toHaveBeenCalledWith('note-123', updateData);
    });

    it('should return 200 with partial update (content only)', async () => {
      const partialUpdate = { content: 'Only content updated' };
      const updatedNote = { ...mockNote, ...partialUpdate };
      mockNoteService.updateNote.mockResolvedValue(updatedNote);

      const response = await request(app)
        .put('/api/notes/note-123')
        .send(partialUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 200 with partial update (isPinned only)', async () => {
      const partialUpdate = { isPinned: true };
      const updatedNote = { ...mockNote, ...partialUpdate };
      mockNoteService.updateNote.mockResolvedValue(updatedNote);

      const response = await request(app)
        .put('/api/notes/note-123')
        .send(partialUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when note not found', async () => {
      mockNoteService.updateNote.mockRejectedValue(
        new AppError('Note not found', 404, 'NOTE_NOT_FOUND')
      );

      const response = await request(app)
        .put('/api/notes/non-existent')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOTE_NOT_FOUND');
    });

    it('should return 400 on validation error (empty content)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Note content is required',
          path: ['content'],
        },
      ]);
      mockNoteService.updateNote.mockRejectedValue(zodError);

      const response = await request(app)
        .put('/api/notes/note-123')
        .send({ content: '' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      mockNoteService.updateNote.mockRejectedValue(
        new AppError('Database error', 500, 'UPDATE_NOTE_ERROR')
      );

      const response = await request(app)
        .put('/api/notes/note-123')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // PATCH /api/notes/:id/pin
  // ============================================
  describe('PATCH /api/notes/:id/pin', () => {
    it('should return 200 with toggled note (false to true)', async () => {
      const toggledNote = { ...mockNote, isPinned: true };
      mockNoteService.togglePin.mockResolvedValue(toggledNote);

      const response = await request(app).patch('/api/notes/note-123/pin');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: toggledNote,
      });
      expect(mockNoteService.togglePin).toHaveBeenCalledWith('note-123');
    });

    it('should return 200 with toggled note (true to false)', async () => {
      const toggledNote = { ...mockPinnedNote, isPinned: false };
      mockNoteService.togglePin.mockResolvedValue(toggledNote);

      const response = await request(app).patch('/api/notes/note-456/pin');

      expect(response.status).toBe(200);
      expect(response.body.data.isPinned).toBe(false);
    });

    it('should return 404 when note not found', async () => {
      mockNoteService.togglePin.mockRejectedValue(
        new AppError('Note not found', 404, 'NOTE_NOT_FOUND')
      );

      const response = await request(app).patch('/api/notes/non-existent/pin');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOTE_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockNoteService.togglePin.mockRejectedValue(
        new AppError('Database error', 500, 'TOGGLE_PIN_ERROR')
      );

      const response = await request(app).patch('/api/notes/note-123/pin');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // DELETE /api/notes/:id
  // ============================================
  describe('DELETE /api/notes/:id', () => {
    it('should return 200 with success message on delete', async () => {
      mockNoteService.deleteNote.mockResolvedValue(mockNote);

      const response = await request(app).delete('/api/notes/note-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { message: 'Note deleted successfully' },
      });
      expect(mockNoteService.deleteNote).toHaveBeenCalledWith('note-123');
    });

    it('should return 404 when note not found', async () => {
      mockNoteService.deleteNote.mockRejectedValue(
        new AppError('Note not found', 404, 'NOTE_NOT_FOUND')
      );

      const response = await request(app).delete('/api/notes/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOTE_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockNoteService.deleteNote.mockRejectedValue(
        new AppError('Database error', 500, 'DELETE_NOTE_ERROR')
      );

      const response = await request(app).delete('/api/notes/note-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/contacts/contact-123/notes')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should handle empty request body on POST', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          message: 'Required',
          path: ['content'],
        },
      ]);
      mockNoteService.createNote.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts/contact-123/notes')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle empty request body on PUT (no-op update)', async () => {
      const updatedNote = mockNote;
      mockNoteService.updateNote.mockResolvedValue(updatedNote);

      const response = await request(app)
        .put('/api/notes/note-123')
        .send({})
        .set('Content-Type', 'application/json');

      // Empty update is valid (no fields changed)
      expect(response.status).toBe(200);
    });
  });
});
