/**
 * Integration Tests for Reminder Controller
 *
 * Tests the HTTP layer of the reminders API using supertest.
 * The service layer is mocked to isolate controller behavior.
 */

import request from 'supertest';
import { AppError } from '../../middleware/errorHandler';

// Mock the reminder service
const mockReminderService = {
  getRemindersForContact: jest.fn(),
  getReminderById: jest.fn(),
  createReminder: jest.fn(),
  updateReminder: jest.fn(),
  deleteReminder: jest.fn(),
  markAsComplete: jest.fn(),
  markAsIncomplete: jest.fn(),
  getUpcomingReminders: jest.fn(),
  getOverdueReminders: jest.fn(),
  getAllReminders: jest.fn(),
};

jest.mock('../../services/reminderService', () => ({
  reminderService: mockReminderService,
}));

// Import app after mocking
import app from '../../app';

describe('Reminder Controller - Integration Tests', () => {
  // Sample test data
  const mockReminder = {
    id: 'reminder-123',
    contactId: 'contact-456',
    title: 'Follow up with John',
    description: 'Discuss project proposal',
    dueDate: new Date('2025-12-25T10:00:00.000Z').toISOString(),
    isCompleted: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockReminderWithContact = {
    ...mockReminder,
    contact: {
      id: 'contact-456',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/reminders
  // ============================================
  describe('GET /api/reminders', () => {
    it('should return 200 with array of reminders', async () => {
      const reminders = [mockReminderWithContact];
      mockReminderService.getAllReminders.mockResolvedValue(reminders);

      const response = await request(app).get('/api/reminders');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: reminders,
      });
      expect(mockReminderService.getAllReminders).toHaveBeenCalledWith({});
    });

    it('should return 200 with empty array when no reminders exist', async () => {
      mockReminderService.getAllReminders.mockResolvedValue([]);

      const response = await request(app).get('/api/reminders');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should pass isCompleted filter as boolean true', async () => {
      mockReminderService.getAllReminders.mockResolvedValue([]);

      await request(app).get('/api/reminders?isCompleted=true');

      expect(mockReminderService.getAllReminders).toHaveBeenCalledWith({
        isCompleted: true,
      });
    });

    it('should pass isCompleted filter as boolean false', async () => {
      mockReminderService.getAllReminders.mockResolvedValue([]);

      await request(app).get('/api/reminders?isCompleted=false');

      expect(mockReminderService.getAllReminders).toHaveBeenCalledWith({
        isCompleted: false,
      });
    });

    it('should pass date range filters', async () => {
      mockReminderService.getAllReminders.mockResolvedValue([]);

      const startDate = '2025-01-01T00:00:00.000Z';
      const endDate = '2025-12-31T23:59:59.000Z';

      await request(app).get(
        `/api/reminders?startDate=${startDate}&endDate=${endDate}`
      );

      expect(mockReminderService.getAllReminders).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
    });

    it('should return 500 when service throws error', async () => {
      mockReminderService.getAllReminders.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_REMINDERS_ERROR')
      );

      const response = await request(app).get('/api/reminders');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/reminders/upcoming
  // ============================================
  describe('GET /api/reminders/upcoming', () => {
    it('should return 200 with upcoming reminders (default limit)', async () => {
      const reminders = [mockReminderWithContact];
      mockReminderService.getUpcomingReminders.mockResolvedValue(reminders);

      const response = await request(app).get('/api/reminders/upcoming');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: reminders,
      });
      expect(mockReminderService.getUpcomingReminders).toHaveBeenCalledWith(5);
    });

    it('should pass custom limit parameter', async () => {
      mockReminderService.getUpcomingReminders.mockResolvedValue([]);

      await request(app).get('/api/reminders/upcoming?limit=10');

      expect(mockReminderService.getUpcomingReminders).toHaveBeenCalledWith(10);
    });

    it('should return 200 with empty array when no upcoming reminders', async () => {
      mockReminderService.getUpcomingReminders.mockResolvedValue([]);

      const response = await request(app).get('/api/reminders/upcoming');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 500 when service throws error', async () => {
      mockReminderService.getUpcomingReminders.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_REMINDERS_ERROR')
      );

      const response = await request(app).get('/api/reminders/upcoming');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/reminders/overdue
  // ============================================
  describe('GET /api/reminders/overdue', () => {
    it('should return 200 with overdue reminders', async () => {
      const overdueReminder = {
        ...mockReminderWithContact,
        dueDate: new Date('2024-01-01T10:00:00.000Z').toISOString(),
      };
      mockReminderService.getOverdueReminders.mockResolvedValue([overdueReminder]);

      const response = await request(app).get('/api/reminders/overdue');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [overdueReminder],
      });
      expect(mockReminderService.getOverdueReminders).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with empty array when no overdue reminders', async () => {
      mockReminderService.getOverdueReminders.mockResolvedValue([]);

      const response = await request(app).get('/api/reminders/overdue');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 500 when service throws error', async () => {
      mockReminderService.getOverdueReminders.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_REMINDERS_ERROR')
      );

      const response = await request(app).get('/api/reminders/overdue');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/reminders/:id
  // ============================================
  describe('GET /api/reminders/:id', () => {
    it('should return 200 with reminder when found', async () => {
      mockReminderService.getReminderById.mockResolvedValue(mockReminderWithContact);

      const response = await request(app).get('/api/reminders/reminder-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockReminderWithContact,
      });
      expect(mockReminderService.getReminderById).toHaveBeenCalledWith('reminder-123');
    });

    it('should return 404 when reminder not found', async () => {
      mockReminderService.getReminderById.mockRejectedValue(
        new AppError('Reminder not found', 404, 'REMINDER_NOT_FOUND')
      );

      const response = await request(app).get('/api/reminders/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('REMINDER_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockReminderService.getReminderById.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_REMINDER_ERROR')
      );

      const response = await request(app).get('/api/reminders/reminder-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/contacts/:contactId/reminders
  // ============================================
  describe('GET /api/contacts/:contactId/reminders', () => {
    it('should return 200 with reminders for contact', async () => {
      const reminders = [mockReminder];
      mockReminderService.getRemindersForContact.mockResolvedValue(reminders);

      const response = await request(app).get('/api/contacts/contact-456/reminders');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: reminders,
      });
      expect(mockReminderService.getRemindersForContact).toHaveBeenCalledWith(
        'contact-456',
        {}
      );
    });

    it('should return 200 with empty array when contact has no reminders', async () => {
      mockReminderService.getRemindersForContact.mockResolvedValue([]);

      const response = await request(app).get('/api/contacts/contact-456/reminders');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should pass isCompleted filter', async () => {
      mockReminderService.getRemindersForContact.mockResolvedValue([]);

      await request(app).get('/api/contacts/contact-456/reminders?isCompleted=true');

      expect(mockReminderService.getRemindersForContact).toHaveBeenCalledWith(
        'contact-456',
        { isCompleted: true }
      );
    });

    it('should pass date range filters', async () => {
      mockReminderService.getRemindersForContact.mockResolvedValue([]);

      const startDate = '2025-01-01T00:00:00.000Z';
      const endDate = '2025-12-31T23:59:59.000Z';

      await request(app).get(
        `/api/contacts/contact-456/reminders?startDate=${startDate}&endDate=${endDate}`
      );

      expect(mockReminderService.getRemindersForContact).toHaveBeenCalledWith(
        'contact-456',
        {
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }
      );
    });

    it('should return 404 when contact not found', async () => {
      mockReminderService.getRemindersForContact.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app).get('/api/contacts/non-existent/reminders');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockReminderService.getRemindersForContact.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_REMINDERS_ERROR')
      );

      const response = await request(app).get('/api/contacts/contact-456/reminders');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // POST /api/contacts/:contactId/reminders
  // ============================================
  describe('POST /api/contacts/:contactId/reminders', () => {
    const validCreateData = {
      title: 'New Reminder',
      description: 'Remember to do this',
      dueDate: '2025-12-25T10:00:00.000Z',
    };

    it('should return 201 with created reminder on success', async () => {
      const createdReminder = {
        ...mockReminder,
        ...validCreateData,
        id: 'new-reminder',
      };
      mockReminderService.createReminder.mockResolvedValue(createdReminder);

      const response = await request(app)
        .post('/api/contacts/contact-456/reminders')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: createdReminder,
      });
      expect(mockReminderService.createReminder).toHaveBeenCalledWith({
        ...validCreateData,
        contactId: 'contact-456',
      });
    });

    it('should return 201 with minimal data (title, dueDate only)', async () => {
      const minimalData = {
        title: 'Quick Reminder',
        dueDate: '2025-12-25T10:00:00.000Z',
      };
      const createdReminder = { ...mockReminder, ...minimalData };
      mockReminderService.createReminder.mockResolvedValue(createdReminder);

      const response = await request(app)
        .post('/api/contacts/contact-456/reminders')
        .send(minimalData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 on validation error (missing title)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Title is required',
          path: ['title'],
        },
      ]);
      mockReminderService.createReminder.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts/contact-456/reminders')
        .send({ dueDate: '2025-12-25T10:00:00.000Z' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (missing dueDate)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          message: 'Due date is required',
          path: ['dueDate'],
        },
      ]);
      mockReminderService.createReminder.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts/contact-456/reminders')
        .send({ title: 'Reminder without date' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (invalid dueDate format)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_string',
          validation: 'datetime',
          message: 'Invalid datetime format',
          path: ['dueDate'],
        },
      ]);
      mockReminderService.createReminder.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts/contact-456/reminders')
        .send({ title: 'Reminder', dueDate: 'not-a-date' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when contact not found', async () => {
      mockReminderService.createReminder.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app)
        .post('/api/contacts/non-existent/reminders')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockReminderService.createReminder.mockRejectedValue(
        new AppError('Database error', 500, 'CREATE_REMINDER_ERROR')
      );

      const response = await request(app)
        .post('/api/contacts/contact-456/reminders')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // PUT /api/reminders/:id
  // ============================================
  describe('PUT /api/reminders/:id', () => {
    const updateData = {
      title: 'Updated Reminder',
      dueDate: '2025-12-30T14:00:00.000Z',
    };

    it('should return 200 with updated reminder on success', async () => {
      const updatedReminder = { ...mockReminder, ...updateData };
      mockReminderService.updateReminder.mockResolvedValue(updatedReminder);

      const response = await request(app)
        .put('/api/reminders/reminder-123')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: updatedReminder,
      });
      expect(mockReminderService.updateReminder).toHaveBeenCalledWith(
        'reminder-123',
        updateData
      );
    });

    it('should return 200 with partial update (title only)', async () => {
      const partialUpdate = { title: 'Just Title Update' };
      const updatedReminder = { ...mockReminder, ...partialUpdate };
      mockReminderService.updateReminder.mockResolvedValue(updatedReminder);

      const response = await request(app)
        .put('/api/reminders/reminder-123')
        .send(partialUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 200 with partial update (description only)', async () => {
      const partialUpdate = { description: 'New description' };
      const updatedReminder = { ...mockReminder, ...partialUpdate };
      mockReminderService.updateReminder.mockResolvedValue(updatedReminder);

      const response = await request(app)
        .put('/api/reminders/reminder-123')
        .send(partialUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when reminder not found', async () => {
      mockReminderService.updateReminder.mockRejectedValue(
        new AppError('Reminder not found', 404, 'REMINDER_NOT_FOUND')
      );

      const response = await request(app)
        .put('/api/reminders/non-existent')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('REMINDER_NOT_FOUND');
    });

    it('should return 400 on validation error (invalid dueDate)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_string',
          validation: 'datetime',
          message: 'Invalid datetime format',
          path: ['dueDate'],
        },
      ]);
      mockReminderService.updateReminder.mockRejectedValue(zodError);

      const response = await request(app)
        .put('/api/reminders/reminder-123')
        .send({ dueDate: 'invalid-date' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      mockReminderService.updateReminder.mockRejectedValue(
        new AppError('Database error', 500, 'UPDATE_REMINDER_ERROR')
      );

      const response = await request(app)
        .put('/api/reminders/reminder-123')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // PATCH /api/reminders/:id/complete
  // ============================================
  describe('PATCH /api/reminders/:id/complete', () => {
    it('should return 200 when marking reminder as complete', async () => {
      const completedReminder = {
        ...mockReminder,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };
      mockReminderService.markAsComplete.mockResolvedValue(completedReminder);

      const response = await request(app)
        .patch('/api/reminders/reminder-123/complete')
        .send({ isCompleted: true })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: completedReminder,
      });
      expect(mockReminderService.markAsComplete).toHaveBeenCalledWith('reminder-123');
    });

    it('should return 200 when marking reminder as incomplete', async () => {
      const incompleteReminder = {
        ...mockReminder,
        isCompleted: false,
        completedAt: null,
      };
      mockReminderService.markAsIncomplete.mockResolvedValue(incompleteReminder);

      const response = await request(app)
        .patch('/api/reminders/reminder-123/complete')
        .send({ isCompleted: false })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: incompleteReminder,
      });
      expect(mockReminderService.markAsIncomplete).toHaveBeenCalledWith('reminder-123');
    });

    it('should return 404 when reminder not found (marking complete)', async () => {
      mockReminderService.markAsComplete.mockRejectedValue(
        new AppError('Reminder not found', 404, 'REMINDER_NOT_FOUND')
      );

      const response = await request(app)
        .patch('/api/reminders/non-existent/complete')
        .send({ isCompleted: true })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('REMINDER_NOT_FOUND');
    });

    it('should return 404 when reminder not found (marking incomplete)', async () => {
      mockReminderService.markAsIncomplete.mockRejectedValue(
        new AppError('Reminder not found', 404, 'REMINDER_NOT_FOUND')
      );

      const response = await request(app)
        .patch('/api/reminders/non-existent/complete')
        .send({ isCompleted: false })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('REMINDER_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockReminderService.markAsComplete.mockRejectedValue(
        new AppError('Database error', 500, 'UPDATE_REMINDER_ERROR')
      );

      const response = await request(app)
        .patch('/api/reminders/reminder-123/complete')
        .send({ isCompleted: true })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // DELETE /api/reminders/:id
  // ============================================
  describe('DELETE /api/reminders/:id', () => {
    it('should return 200 with success message on delete', async () => {
      mockReminderService.deleteReminder.mockResolvedValue(mockReminder);

      const response = await request(app).delete('/api/reminders/reminder-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { message: 'Reminder deleted successfully' },
      });
      expect(mockReminderService.deleteReminder).toHaveBeenCalledWith('reminder-123');
    });

    it('should return 404 when reminder not found', async () => {
      mockReminderService.deleteReminder.mockRejectedValue(
        new AppError('Reminder not found', 404, 'REMINDER_NOT_FOUND')
      );

      const response = await request(app).delete('/api/reminders/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('REMINDER_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockReminderService.deleteReminder.mockRejectedValue(
        new AppError('Database error', 500, 'DELETE_REMINDER_ERROR')
      );

      const response = await request(app).delete('/api/reminders/reminder-123');

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
        .post('/api/contacts/contact-456/reminders')
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
          path: ['title'],
        },
      ]);
      mockReminderService.createReminder.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts/contact-456/reminders')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle combined filters on getAllReminders', async () => {
      mockReminderService.getAllReminders.mockResolvedValue([]);

      await request(app).get(
        '/api/reminders?isCompleted=true&startDate=2025-01-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.000Z'
      );

      expect(mockReminderService.getAllReminders).toHaveBeenCalledWith({
        isCompleted: true,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
    });

    it('should handle combined filters on getRemindersForContact', async () => {
      mockReminderService.getRemindersForContact.mockResolvedValue([]);

      await request(app).get(
        '/api/contacts/contact-456/reminders?isCompleted=false&startDate=2025-01-01T00:00:00.000Z'
      );

      expect(mockReminderService.getRemindersForContact).toHaveBeenCalledWith(
        'contact-456',
        {
          isCompleted: false,
          startDate: expect.any(Date),
        }
      );
    });
  });
});
