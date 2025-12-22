/**
 * Unit Tests for Reminder Service
 *
 * Tests the business logic layer for reminder operations.
 * Prisma is mocked to isolate service logic from database.
 */

import { AppError } from '../../middleware/errorHandler';

// Mock Prisma client (imported via contactService)
const mockPrismaContact = {
  findUnique: jest.fn(),
};

const mockPrismaReminder = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../contactService', () => ({
  prisma: {
    contact: mockPrismaContact,
    reminder: mockPrismaReminder,
  },
}));

// Import after mocking
import { reminderService } from '../reminderService';

describe('reminderService', () => {
  // Valid UUIDs for test data
  const validContactId = '550e8400-e29b-41d4-a716-446655440000';
  const validReminderId = '660e8400-e29b-41d4-a716-446655440001';

  // Sample test data
  const mockContact = {
    id: validContactId,
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockReminder = {
    id: validReminderId,
    contactId: validContactId,
    title: 'Follow up call',
    description: 'Discuss project timeline',
    dueDate: new Date('2025-12-25T09:00:00.000Z'),
    isCompleted: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReminderWithContact = {
    ...mockReminder,
    contact: mockContact,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: contact exists
    mockPrismaContact.findUnique.mockResolvedValue(mockContact);
  });

  // ============================================
  // getRemindersForContact
  // ============================================
  describe('getRemindersForContact', () => {
    it('should return an array of reminders ordered by dueDate asc', async () => {
      const reminders = [
        mockReminder,
        { ...mockReminder, id: 'reminder-2', dueDate: new Date('2025-12-26T09:00:00.000Z') },
      ];
      mockPrismaReminder.findMany.mockResolvedValue(reminders);

      const result = await reminderService.getRemindersForContact(validContactId);

      expect(result).toEqual(reminders);
      expect(mockPrismaContact.findUnique).toHaveBeenCalledWith({
        where: { id: validContactId },
      });
      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: { contactId: validContactId },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should return empty array when contact has no reminders', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([]);

      const result = await reminderService.getRemindersForContact(validContactId);

      expect(result).toEqual([]);
    });

    it('should throw 404 when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(reminderService.getRemindersForContact(validContactId)).rejects.toThrow(
        AppError
      );
      await expect(reminderService.getRemindersForContact(validContactId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should apply isCompleted filter when provided', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      await reminderService.getRemindersForContact(validContactId, { isCompleted: false });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: { contactId: validContactId, isCompleted: false },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply isCompleted=true filter correctly', async () => {
      const completedReminder = { ...mockReminder, isCompleted: true };
      mockPrismaReminder.findMany.mockResolvedValue([completedReminder]);

      await reminderService.getRemindersForContact(validContactId, { isCompleted: true });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: { contactId: validContactId, isCompleted: true },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply startDate filter when provided', async () => {
      const startDate = new Date('2025-12-01T00:00:00.000Z');
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      await reminderService.getRemindersForContact(validContactId, { startDate });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: {
          contactId: validContactId,
          dueDate: { gte: startDate },
        },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply endDate filter when provided', async () => {
      const endDate = new Date('2025-12-31T23:59:59.000Z');
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      await reminderService.getRemindersForContact(validContactId, { endDate });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: {
          contactId: validContactId,
          dueDate: { lte: endDate },
        },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply date range filter (startDate and endDate)', async () => {
      const startDate = new Date('2025-12-01T00:00:00.000Z');
      const endDate = new Date('2025-12-31T23:59:59.000Z');
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      await reminderService.getRemindersForContact(validContactId, { startDate, endDate });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: {
          contactId: validContactId,
          dueDate: { gte: startDate, lte: endDate },
        },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply all filters together', async () => {
      const startDate = new Date('2025-12-01T00:00:00.000Z');
      const endDate = new Date('2025-12-31T23:59:59.000Z');
      mockPrismaReminder.findMany.mockResolvedValue([mockReminder]);

      await reminderService.getRemindersForContact(validContactId, {
        isCompleted: false,
        startDate,
        endDate,
      });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: {
          contactId: validContactId,
          isCompleted: false,
          dueDate: { gte: startDate, lte: endDate },
        },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.findMany.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.getRemindersForContact(validContactId)).rejects.toThrow(
        AppError
      );
      await expect(reminderService.getRemindersForContact(validContactId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_REMINDERS_ERROR',
      });
    });
  });

  // ============================================
  // getReminderById
  // ============================================
  describe('getReminderById', () => {
    it('should return a reminder with contact relation when found', async () => {
      mockPrismaReminder.findUnique.mockResolvedValue(mockReminderWithContact);

      const result = await reminderService.getReminderById(validReminderId);

      expect(result).toEqual(mockReminderWithContact);
      expect(mockPrismaReminder.findUnique).toHaveBeenCalledWith({
        where: { id: validReminderId },
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

    it('should throw 404 when reminder not found', async () => {
      mockPrismaReminder.findUnique.mockResolvedValue(null);

      await expect(reminderService.getReminderById('non-existent')).rejects.toThrow(AppError);
      await expect(reminderService.getReminderById('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'REMINDER_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.getReminderById(validReminderId)).rejects.toThrow(AppError);
      await expect(reminderService.getReminderById(validReminderId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_REMINDER_ERROR',
      });
    });
  });

  // ============================================
  // createReminder
  // ============================================
  describe('createReminder', () => {
    const validCreateData = {
      contactId: validContactId,
      title: 'New reminder',
      description: 'Some notes',
      dueDate: '2025-12-25T09:00:00.000Z',
    };

    it('should create and return a new reminder with all fields', async () => {
      const createdReminder = {
        ...mockReminder,
        title: validCreateData.title,
        description: validCreateData.description,
      };
      mockPrismaReminder.create.mockResolvedValue(createdReminder);

      const result = await reminderService.createReminder(validCreateData);

      expect(result).toEqual(createdReminder);
      expect(mockPrismaContact.findUnique).toHaveBeenCalledWith({
        where: { id: validContactId },
      });
      expect(mockPrismaReminder.create).toHaveBeenCalledWith({
        data: {
          contactId: validContactId,
          title: validCreateData.title,
          description: validCreateData.description,
          dueDate: new Date(validCreateData.dueDate),
        },
      });
    });

    it('should create reminder with only required fields (contactId, title, dueDate)', async () => {
      const minimalData = {
        contactId: validContactId,
        title: 'Minimal reminder',
        dueDate: '2025-12-25T09:00:00.000Z',
      };
      const createdReminder = { ...mockReminder, title: minimalData.title, description: null };
      mockPrismaReminder.create.mockResolvedValue(createdReminder);

      const result = await reminderService.createReminder(minimalData);

      expect(result).toEqual(createdReminder);
      expect(mockPrismaReminder.create).toHaveBeenCalledWith({
        data: {
          contactId: validContactId,
          title: minimalData.title,
          description: null,
          dueDate: new Date(minimalData.dueDate),
        },
      });
    });

    it('should throw 404 when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(reminderService.createReminder(validCreateData)).rejects.toThrow(AppError);
      await expect(reminderService.createReminder(validCreateData)).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should throw validation error when title is missing', async () => {
      const invalidData = {
        contactId: validContactId,
        dueDate: '2025-12-25T09:00:00.000Z',
      } as any;

      await expect(reminderService.createReminder(invalidData)).rejects.toThrow();
    });

    it('should throw validation error when contactId is missing', async () => {
      const invalidData = {
        title: 'Test',
        dueDate: '2025-12-25T09:00:00.000Z',
      } as any;

      await expect(reminderService.createReminder(invalidData)).rejects.toThrow();
    });

    it('should throw validation error when dueDate is missing', async () => {
      const invalidData = {
        contactId: validContactId,
        title: 'Test',
      } as any;

      await expect(reminderService.createReminder(invalidData)).rejects.toThrow();
    });

    it('should throw validation error for invalid contactId format', async () => {
      const invalidData = {
        contactId: 'not-a-uuid',
        title: 'Test',
        dueDate: '2025-12-25T09:00:00.000Z',
      };

      await expect(reminderService.createReminder(invalidData)).rejects.toThrow();
    });

    it('should throw validation error for invalid dueDate format', async () => {
      const invalidData = {
        contactId: validContactId,
        title: 'Test',
        dueDate: 'not-a-date',
      };

      await expect(reminderService.createReminder(invalidData)).rejects.toThrow();
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.create.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.createReminder(validCreateData)).rejects.toThrow(AppError);
      await expect(reminderService.createReminder(validCreateData)).rejects.toMatchObject({
        statusCode: 500,
        code: 'CREATE_REMINDER_ERROR',
      });
    });
  });

  // ============================================
  // updateReminder
  // ============================================
  describe('updateReminder', () => {
    beforeEach(() => {
      // getReminderById is called to check existence
      mockPrismaReminder.findUnique.mockResolvedValue(mockReminderWithContact);
    });

    it('should update and return the reminder with valid data', async () => {
      const updateData = { title: 'Updated title', description: 'Updated notes' };
      const updatedReminder = { ...mockReminder, ...updateData };
      mockPrismaReminder.update.mockResolvedValue(updatedReminder);

      const result = await reminderService.updateReminder(validReminderId, updateData);

      expect(result).toEqual(updatedReminder);
      expect(mockPrismaReminder.update).toHaveBeenCalledWith({
        where: { id: validReminderId },
        data: {
          title: updateData.title,
          description: updateData.description,
          dueDate: undefined,
        },
      });
    });

    it('should throw 404 when reminder not found', async () => {
      mockPrismaReminder.findUnique.mockResolvedValue(null);

      await expect(
        reminderService.updateReminder(validReminderId, { title: 'Test' })
      ).rejects.toThrow(AppError);
      await expect(
        reminderService.updateReminder(validReminderId, { title: 'Test' })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'REMINDER_NOT_FOUND',
      });
    });

    it('should allow partial update (single field)', async () => {
      const updateData = { title: 'Only title updated' };
      const updatedReminder = { ...mockReminder, ...updateData };
      mockPrismaReminder.update.mockResolvedValue(updatedReminder);

      const result = await reminderService.updateReminder(validReminderId, updateData);

      expect(result.title).toBe(updateData.title);
    });

    it('should convert empty string description to null', async () => {
      const updateData = { description: '' };
      mockPrismaReminder.update.mockResolvedValue({ ...mockReminder, description: null });

      await reminderService.updateReminder(validReminderId, updateData);

      expect(mockPrismaReminder.update).toHaveBeenCalledWith({
        where: { id: validReminderId },
        data: {
          title: undefined,
          description: null,
          dueDate: undefined,
        },
      });
    });

    it('should update dueDate field correctly', async () => {
      const newDueDate = '2025-12-30T10:00:00.000Z';
      const updateData = { dueDate: newDueDate };
      mockPrismaReminder.update.mockResolvedValue({
        ...mockReminder,
        dueDate: new Date(newDueDate),
      });

      await reminderService.updateReminder(validReminderId, updateData);

      expect(mockPrismaReminder.update).toHaveBeenCalledWith({
        where: { id: validReminderId },
        data: {
          title: undefined,
          description: undefined,
          dueDate: new Date(newDueDate),
        },
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.update.mockRejectedValue(new Error('DB error'));

      await expect(
        reminderService.updateReminder(validReminderId, { title: 'Test' })
      ).rejects.toThrow(AppError);
      await expect(
        reminderService.updateReminder(validReminderId, { title: 'Test' })
      ).rejects.toMatchObject({
        statusCode: 500,
        code: 'UPDATE_REMINDER_ERROR',
      });
    });
  });

  // ============================================
  // deleteReminder
  // ============================================
  describe('deleteReminder', () => {
    beforeEach(() => {
      mockPrismaReminder.findUnique.mockResolvedValue(mockReminderWithContact);
    });

    it('should delete and return the reminder', async () => {
      mockPrismaReminder.delete.mockResolvedValue(mockReminder);

      const result = await reminderService.deleteReminder(validReminderId);

      expect(result).toEqual(mockReminder);
      expect(mockPrismaReminder.delete).toHaveBeenCalledWith({
        where: { id: validReminderId },
      });
    });

    it('should throw 404 when reminder not found', async () => {
      mockPrismaReminder.findUnique.mockResolvedValue(null);

      await expect(reminderService.deleteReminder('non-existent')).rejects.toThrow(AppError);
      await expect(reminderService.deleteReminder('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'REMINDER_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.delete.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.deleteReminder(validReminderId)).rejects.toThrow(AppError);
      await expect(reminderService.deleteReminder(validReminderId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'DELETE_REMINDER_ERROR',
      });
    });
  });

  // ============================================
  // markAsComplete
  // ============================================
  describe('markAsComplete', () => {
    beforeEach(() => {
      mockPrismaReminder.findUnique.mockResolvedValue(mockReminderWithContact);
    });

    it('should mark reminder as complete and set completedAt', async () => {
      const completedReminder = {
        ...mockReminder,
        isCompleted: true,
        completedAt: new Date(),
      };
      mockPrismaReminder.update.mockResolvedValue(completedReminder);

      const result = await reminderService.markAsComplete(validReminderId);

      expect(result.isCompleted).toBe(true);
      expect(result.completedAt).toBeDefined();
      expect(mockPrismaReminder.update).toHaveBeenCalledWith({
        where: { id: validReminderId },
        data: {
          isCompleted: true,
          completedAt: expect.any(Date),
        },
      });
    });

    it('should throw 404 when reminder not found', async () => {
      mockPrismaReminder.findUnique.mockResolvedValue(null);

      await expect(reminderService.markAsComplete('non-existent')).rejects.toThrow(AppError);
      await expect(reminderService.markAsComplete('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'REMINDER_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.update.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.markAsComplete(validReminderId)).rejects.toThrow(AppError);
      await expect(reminderService.markAsComplete(validReminderId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'COMPLETE_REMINDER_ERROR',
      });
    });
  });

  // ============================================
  // markAsIncomplete
  // ============================================
  describe('markAsIncomplete', () => {
    beforeEach(() => {
      mockPrismaReminder.findUnique.mockResolvedValue({
        ...mockReminderWithContact,
        isCompleted: true,
        completedAt: new Date(),
      });
    });

    it('should mark reminder as incomplete and clear completedAt', async () => {
      const incompleteReminder = {
        ...mockReminder,
        isCompleted: false,
        completedAt: null,
      };
      mockPrismaReminder.update.mockResolvedValue(incompleteReminder);

      const result = await reminderService.markAsIncomplete(validReminderId);

      expect(result.isCompleted).toBe(false);
      expect(result.completedAt).toBeNull();
      expect(mockPrismaReminder.update).toHaveBeenCalledWith({
        where: { id: validReminderId },
        data: {
          isCompleted: false,
          completedAt: null,
        },
      });
    });

    it('should throw 404 when reminder not found', async () => {
      mockPrismaReminder.findUnique.mockResolvedValue(null);

      await expect(reminderService.markAsIncomplete('non-existent')).rejects.toThrow(AppError);
      await expect(reminderService.markAsIncomplete('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'REMINDER_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.update.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.markAsIncomplete(validReminderId)).rejects.toThrow(AppError);
      await expect(reminderService.markAsIncomplete(validReminderId)).rejects.toMatchObject({
        statusCode: 500,
        code: 'INCOMPLETE_REMINDER_ERROR',
      });
    });
  });

  // ============================================
  // getUpcomingReminders
  // ============================================
  describe('getUpcomingReminders', () => {
    it('should return upcoming incomplete reminders with contact info', async () => {
      const upcomingReminders = [mockReminderWithContact];
      mockPrismaReminder.findMany.mockResolvedValue(upcomingReminders);

      const result = await reminderService.getUpcomingReminders();

      expect(result).toEqual(upcomingReminders);
      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: {
          isCompleted: false,
          dueDate: { gte: expect.any(Date) },
        },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      });
    });

    it('should use default limit of 5', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([]);

      await reminderService.getUpcomingReminders();

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });

    it('should respect custom limit parameter', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([]);

      await reminderService.getUpcomingReminders(10);

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
    });

    it('should return empty array when no upcoming reminders', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([]);

      const result = await reminderService.getUpcomingReminders();

      expect(result).toEqual([]);
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.findMany.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.getUpcomingReminders()).rejects.toThrow(AppError);
      await expect(reminderService.getUpcomingReminders()).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_UPCOMING_ERROR',
      });
    });
  });

  // ============================================
  // getOverdueReminders
  // ============================================
  describe('getOverdueReminders', () => {
    it('should return overdue incomplete reminders with contact info', async () => {
      const overdueReminder = {
        ...mockReminderWithContact,
        dueDate: new Date('2025-12-01T09:00:00.000Z'), // Past date
      };
      mockPrismaReminder.findMany.mockResolvedValue([overdueReminder]);

      const result = await reminderService.getOverdueReminders();

      expect(result).toEqual([overdueReminder]);
      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: {
          isCompleted: false,
          dueDate: { lt: expect.any(Date) },
        },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should return empty array when no overdue reminders', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([]);

      const result = await reminderService.getOverdueReminders();

      expect(result).toEqual([]);
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.findMany.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.getOverdueReminders()).rejects.toThrow(AppError);
      await expect(reminderService.getOverdueReminders()).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_OVERDUE_ERROR',
      });
    });
  });

  // ============================================
  // getAllReminders
  // ============================================
  describe('getAllReminders', () => {
    it('should return all reminders with contact info', async () => {
      const allReminders = [mockReminderWithContact];
      mockPrismaReminder.findMany.mockResolvedValue(allReminders);

      const result = await reminderService.getAllReminders();

      expect(result).toEqual(allReminders);
      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should return empty array when no reminders exist', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([]);

      const result = await reminderService.getAllReminders();

      expect(result).toEqual([]);
    });

    it('should apply isCompleted filter when provided', async () => {
      mockPrismaReminder.findMany.mockResolvedValue([]);

      await reminderService.getAllReminders({ isCompleted: true });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: { isCompleted: true },
        include: expect.any(Object),
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply startDate filter when provided', async () => {
      const startDate = new Date('2025-12-01T00:00:00.000Z');
      mockPrismaReminder.findMany.mockResolvedValue([]);

      await reminderService.getAllReminders({ startDate });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: { dueDate: { gte: startDate } },
        include: expect.any(Object),
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply endDate filter when provided', async () => {
      const endDate = new Date('2025-12-31T23:59:59.000Z');
      mockPrismaReminder.findMany.mockResolvedValue([]);

      await reminderService.getAllReminders({ endDate });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: { dueDate: { lte: endDate } },
        include: expect.any(Object),
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should apply all filters together', async () => {
      const startDate = new Date('2025-12-01T00:00:00.000Z');
      const endDate = new Date('2025-12-31T23:59:59.000Z');
      mockPrismaReminder.findMany.mockResolvedValue([]);

      await reminderService.getAllReminders({ isCompleted: false, startDate, endDate });

      expect(mockPrismaReminder.findMany).toHaveBeenCalledWith({
        where: {
          isCompleted: false,
          dueDate: { gte: startDate, lte: endDate },
        },
        include: expect.any(Object),
        orderBy: { dueDate: 'asc' },
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaReminder.findMany.mockRejectedValue(new Error('DB error'));

      await expect(reminderService.getAllReminders()).rejects.toThrow(AppError);
      await expect(reminderService.getAllReminders()).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_ALL_REMINDERS_ERROR',
      });
    });
  });
});
