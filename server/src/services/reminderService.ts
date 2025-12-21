import { prisma } from './contactService';
import {
  createReminderSchema,
  updateReminderSchema,
  CreateReminderInput,
  UpdateReminderInput,
} from '../schemas/reminderSchema';
import { AppError } from '../middleware/errorHandler';

export interface ReminderFilters {
  isCompleted?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export const reminderService = {
  /**
   * Get all reminders for a specific contact
   * @param contactId - Contact ID
   * @param filters - Optional filters (completed status, date range)
   * @returns Array of reminders
   */
  async getRemindersForContact(contactId: string, filters?: ReminderFilters) {
    try {
      // Verify contact exists
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
      });

      if (!contact) {
        throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      // Build where clause with optional filters
      const where: any = { contactId };

      if (filters?.isCompleted !== undefined) {
        where.isCompleted = filters.isCompleted;
      }

      if (filters?.startDate || filters?.endDate) {
        where.dueDate = {};
        if (filters.startDate) {
          where.dueDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.dueDate.lte = filters.endDate;
        }
      }

      const reminders = await prisma.reminder.findMany({
        where,
        orderBy: { dueDate: 'asc' },
      });

      return reminders;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch reminders', 500, 'FETCH_REMINDERS_ERROR');
    }
  },

  /**
   * Get a single reminder by ID
   * @param id - Reminder ID
   * @returns Reminder or throws if not found
   */
  async getReminderById(id: string) {
    try {
      const reminder = await prisma.reminder.findUnique({
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

      if (!reminder) {
        throw new AppError('Reminder not found', 404, 'REMINDER_NOT_FOUND');
      }

      return reminder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch reminder', 500, 'FETCH_REMINDER_ERROR');
    }
  },

  /**
   * Create a new reminder
   * @param data - Reminder data
   * @returns Created reminder
   */
  async createReminder(data: CreateReminderInput) {
    // Validate input data
    const validatedData = createReminderSchema.parse(data);

    try {
      // Verify contact exists
      const contact = await prisma.contact.findUnique({
        where: { id: validatedData.contactId },
      });

      if (!contact) {
        throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      const reminder = await prisma.reminder.create({
        data: {
          contactId: validatedData.contactId,
          title: validatedData.title,
          description: validatedData.description || null,
          dueDate: new Date(validatedData.dueDate),
        },
      });

      return reminder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create reminder', 500, 'CREATE_REMINDER_ERROR');
    }
  },

  /**
   * Update an existing reminder
   * @param id - Reminder ID
   * @param data - Partial reminder data to update
   * @returns Updated reminder
   */
  async updateReminder(id: string, data: UpdateReminderInput) {
    // Validate input data
    const validatedData = updateReminderSchema.parse(data);

    try {
      // Check if reminder exists
      await this.getReminderById(id);

      const reminder = await prisma.reminder.update({
        where: { id },
        data: {
          title: validatedData.title,
          description: validatedData.description === '' ? null : validatedData.description,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        },
      });

      return reminder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update reminder', 500, 'UPDATE_REMINDER_ERROR');
    }
  },

  /**
   * Delete a reminder
   * @param id - Reminder ID
   * @returns Deleted reminder
   */
  async deleteReminder(id: string) {
    try {
      // Check if reminder exists
      await this.getReminderById(id);

      const reminder = await prisma.reminder.delete({
        where: { id },
      });

      return reminder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete reminder', 500, 'DELETE_REMINDER_ERROR');
    }
  },

  /**
   * Mark a reminder as complete
   * @param id - Reminder ID
   * @returns Updated reminder
   */
  async markAsComplete(id: string) {
    try {
      // Check if reminder exists
      await this.getReminderById(id);

      const reminder = await prisma.reminder.update({
        where: { id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      return reminder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to mark reminder as complete', 500, 'COMPLETE_REMINDER_ERROR');
    }
  },

  /**
   * Mark a reminder as incomplete
   * @param id - Reminder ID
   * @returns Updated reminder
   */
  async markAsIncomplete(id: string) {
    try {
      // Check if reminder exists
      await this.getReminderById(id);

      const reminder = await prisma.reminder.update({
        where: { id },
        data: {
          isCompleted: false,
          completedAt: null,
        },
      });

      return reminder;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to mark reminder as incomplete', 500, 'INCOMPLETE_REMINDER_ERROR');
    }
  },

  /**
   * Get upcoming reminders (not completed, due in the future or today)
   * @param limit - Maximum number of reminders to return (default: 5)
   * @returns Array of upcoming reminders with contact info
   */
  async getUpcomingReminders(limit: number = 5) {
    try {
      const reminders = await prisma.reminder.findMany({
        where: {
          isCompleted: false,
          dueDate: {
            gte: new Date(),
          },
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
        take: limit,
      });

      return reminders;
    } catch (error) {
      throw new AppError('Failed to fetch upcoming reminders', 500, 'FETCH_UPCOMING_ERROR');
    }
  },

  /**
   * Get overdue reminders (not completed, due date in the past)
   * @returns Array of overdue reminders with contact info
   */
  async getOverdueReminders() {
    try {
      const reminders = await prisma.reminder.findMany({
        where: {
          isCompleted: false,
          dueDate: {
            lt: new Date(),
          },
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

      return reminders;
    } catch (error) {
      throw new AppError('Failed to fetch overdue reminders', 500, 'FETCH_OVERDUE_ERROR');
    }
  },

  /**
   * Get all reminders with optional filters (for reminders page)
   * @param filters - Optional filters
   * @returns Array of all reminders with contact info
   */
  async getAllReminders(filters?: ReminderFilters) {
    try {
      const where: any = {};

      if (filters?.isCompleted !== undefined) {
        where.isCompleted = filters.isCompleted;
      }

      if (filters?.startDate || filters?.endDate) {
        where.dueDate = {};
        if (filters.startDate) {
          where.dueDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.dueDate.lte = filters.endDate;
        }
      }

      const reminders = await prisma.reminder.findMany({
        where,
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

      return reminders;
    } catch (error) {
      throw new AppError('Failed to fetch reminders', 500, 'FETCH_ALL_REMINDERS_ERROR');
    }
  },
};
