import { InteractionType } from '@prisma/client';
import { prisma } from './contactService';
import { AppError } from '../middleware/errorHandler';

/**
 * Dashboard statistics response types
 */
export interface DashboardStats {
  totalContacts: number;
  contactsThisMonth: number;
  contactsLastMonth: number;
  totalInteractions: number;
  interactionsThisWeek: number;
  interactionsThisMonth: number;
  pendingReminders: number;
  overdueReminders: number;
}

export interface ContactGrowthData {
  month: string; // YYYY-MM format
  count: number;
  cumulative: number;
}

export interface InteractionBreakdown {
  type: InteractionType;
  count: number;
  label: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'interaction' | 'note' | 'reminder';
  title: string;
  description: string;
  contactId: string;
  contactName: string;
  timestamp: Date;
}

/**
 * Stats Service - Provides dashboard analytics data
 */
export const statsService = {
  /**
   * Get main dashboard statistics
   * @returns Dashboard stats including counts and trends
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Run all queries in parallel for performance
      const [
        totalContacts,
        contactsThisMonth,
        contactsLastMonth,
        totalInteractions,
        interactionsThisWeek,
        interactionsThisMonth,
        pendingReminders,
        overdueReminders,
      ] = await Promise.all([
        // Total contacts
        prisma.contact.count(),
        // Contacts created this month
        prisma.contact.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        // Contacts created last month
        prisma.contact.count({
          where: {
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        }),
        // Total interactions
        prisma.interaction.count(),
        // Interactions this week
        prisma.interaction.count({
          where: { date: { gte: startOfWeek } },
        }),
        // Interactions this month
        prisma.interaction.count({
          where: { date: { gte: startOfMonth } },
        }),
        // Pending reminders (incomplete, future or today)
        prisma.reminder.count({
          where: { isCompleted: false },
        }),
        // Overdue reminders (incomplete, past due date)
        prisma.reminder.count({
          where: {
            isCompleted: false,
            dueDate: { lt: now },
          },
        }),
      ]);

      return {
        totalContacts,
        contactsThisMonth,
        contactsLastMonth,
        totalInteractions,
        interactionsThisWeek,
        interactionsThisMonth,
        pendingReminders,
        overdueReminders,
      };
    } catch (error) {
      throw new AppError('Failed to fetch dashboard stats', 500, 'FETCH_STATS_ERROR');
    }
  },

  /**
   * Get contact growth data for the last 12 months
   * @returns Array of monthly contact counts with cumulative totals
   */
  async getContactGrowth(): Promise<ContactGrowthData[]> {
    try {
      const now = new Date();
      const months: ContactGrowthData[] = [];

      // Get contacts created each month for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

        const count = await prisma.contact.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        const monthLabel = monthStart.toISOString().slice(0, 7); // YYYY-MM
        months.push({ month: monthLabel, count, cumulative: 0 });
      }

      // Calculate cumulative totals
      // First, get total contacts before the 12-month period
      const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const priorCount = await prisma.contact.count({
        where: { createdAt: { lt: startDate } },
      });

      let cumulative = priorCount;
      for (const month of months) {
        cumulative += month.count;
        month.cumulative = cumulative;
      }

      return months;
    } catch (error) {
      throw new AppError('Failed to fetch contact growth', 500, 'FETCH_GROWTH_ERROR');
    }
  },

  /**
   * Get interaction breakdown by type
   * @returns Array of interaction types with counts
   */
  async getInteractionBreakdown(): Promise<InteractionBreakdown[]> {
    try {
      const types = Object.values(InteractionType);
      const breakdown: InteractionBreakdown[] = [];

      // Labels for display
      const typeLabels: Record<InteractionType, string> = {
        CALL: 'Calls',
        MEETING: 'Meetings',
        EMAIL: 'Emails',
        TEXT: 'Texts',
        COFFEE: 'Coffee',
        LUNCH: 'Lunch',
        EVENT: 'Events',
        OTHER: 'Other',
      };

      // Count each type
      const counts = await prisma.interaction.groupBy({
        by: ['type'],
        _count: { type: true },
      });

      // Build breakdown array with all types (including zero counts)
      for (const type of types) {
        const found = counts.find((c) => c.type === type);
        breakdown.push({
          type,
          count: found?._count.type ?? 0,
          label: typeLabels[type],
        });
      }

      // Sort by count descending
      breakdown.sort((a, b) => b.count - a.count);

      return breakdown;
    } catch (error) {
      throw new AppError('Failed to fetch interaction breakdown', 500, 'FETCH_BREAKDOWN_ERROR');
    }
  },

  /**
   * Get recent activity feed (latest interactions, notes, reminders)
   * @param limit - Maximum number of items to return (default: 10)
   * @returns Array of recent activity items
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivityItem[]> {
    try {
      const activities: RecentActivityItem[] = [];

      // Fetch recent interactions
      const recentInteractions = await prisma.interaction.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      for (const interaction of recentInteractions) {
        activities.push({
          id: interaction.id,
          type: 'interaction',
          title: `${interaction.type.charAt(0) + interaction.type.slice(1).toLowerCase()} logged`,
          description: interaction.subject || `${interaction.type} with contact`,
          contactId: interaction.contactId,
          contactName: `${interaction.contact.firstName} ${interaction.contact.lastName}`,
          timestamp: interaction.createdAt,
        });
      }

      // Fetch recent notes
      const recentNotes = await prisma.note.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      for (const note of recentNotes) {
        activities.push({
          id: note.id,
          type: 'note',
          title: 'Note added',
          description: note.content.length > 100 ? note.content.slice(0, 100) + '...' : note.content,
          contactId: note.contactId,
          contactName: `${note.contact.firstName} ${note.contact.lastName}`,
          timestamp: note.createdAt,
        });
      }

      // Fetch recent reminders (created, not completed)
      const recentReminders = await prisma.reminder.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      for (const reminder of recentReminders) {
        activities.push({
          id: reminder.id,
          type: 'reminder',
          title: reminder.isCompleted ? 'Reminder completed' : 'Reminder created',
          description: reminder.title,
          contactId: reminder.contactId,
          contactName: `${reminder.contact.firstName} ${reminder.contact.lastName}`,
          timestamp: reminder.createdAt,
        });
      }

      // Sort all activities by timestamp (most recent first)
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Return only the requested limit
      return activities.slice(0, limit);
    } catch (error) {
      throw new AppError('Failed to fetch recent activity', 500, 'FETCH_ACTIVITY_ERROR');
    }
  },
};
