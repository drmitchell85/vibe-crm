import { prisma } from './contactService';
import { AppError } from '../middleware/errorHandler';

/**
 * Search result item with unified structure for all entity types
 */
export interface SearchResult {
  id: string;
  entityType: 'contact' | 'note' | 'interaction' | 'reminder';
  title: string;
  preview: string;
  relevanceScore: number;
  contactId?: string;
  contactName?: string;
  createdAt: Date;
}

/**
 * Global search response structure
 */
export interface GlobalSearchResponse {
  query: string;
  totalResults: number;
  results: SearchResult[];
}

/**
 * Truncate text to create a preview, preserving word boundaries
 */
function createPreview(text: string | null, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Calculate relevance score based on where the match occurs
 * Higher scores for matches in title/name fields
 */
function calculateRelevance(
  query: string,
  primaryField: string | null,
  secondaryField: string | null
): number {
  const q = query.toLowerCase();
  let score = 0;

  if (primaryField) {
    const p = primaryField.toLowerCase();
    if (p === q) score += 100; // Exact match
    else if (p.startsWith(q)) score += 80; // Starts with
    else if (p.includes(q)) score += 60; // Contains in primary
  }

  if (secondaryField) {
    const s = secondaryField.toLowerCase();
    if (s.includes(q)) score += 30; // Contains in secondary
  }

  return score;
}

export const searchService = {
  /**
   * Global search across contacts, notes, interactions, and reminders
   * @param query - Search query string (minimum 2 characters)
   * @param limit - Maximum results per entity type (default: 10)
   * @returns Unified search results sorted by relevance
   */
  async globalSearch(query: string, limit: number = 10): Promise<GlobalSearchResponse> {
    if (!query || query.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400, 'INVALID_QUERY');
    }

    const searchQuery = query.trim();

    try {
      // Run all searches in parallel for performance
      const [contacts, notes, interactions, reminders] = await Promise.all([
        this.searchContacts(searchQuery, limit),
        this.searchNotes(searchQuery, limit),
        this.searchInteractions(searchQuery, limit),
        this.searchReminders(searchQuery, limit),
      ]);

      // Combine and sort by relevance
      const allResults = [...contacts, ...notes, ...interactions, ...reminders];
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return {
        query: searchQuery,
        totalResults: allResults.length,
        results: allResults,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Search failed', 500, 'SEARCH_ERROR');
    }
  },

  /**
   * Search contacts by name, email, company, or job title
   */
  async searchContacts(query: string, limit: number): Promise<SearchResult[]> {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { jobTitle: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return contacts.map((contact) => {
      const fullName = `${contact.firstName} ${contact.lastName}`;
      const details = [contact.company, contact.jobTitle, contact.email]
        .filter(Boolean)
        .join(' • ');

      return {
        id: contact.id,
        entityType: 'contact' as const,
        title: fullName,
        preview: details || 'No additional details',
        relevanceScore: calculateRelevance(query, fullName, details),
        createdAt: contact.createdAt,
      };
    });
  },

  /**
   * Search notes by content
   */
  async searchNotes(query: string, limit: number): Promise<SearchResult[]> {
    const notes = await prisma.note.findMany({
      where: {
        content: { contains: query, mode: 'insensitive' },
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => {
      const contactName = `${note.contact.firstName} ${note.contact.lastName}`;
      return {
        id: note.id,
        entityType: 'note' as const,
        title: `Note for ${contactName}`,
        preview: createPreview(note.content),
        relevanceScore: calculateRelevance(query, null, note.content),
        contactId: note.contact.id,
        contactName,
        createdAt: note.createdAt,
      };
    });
  },

  /**
   * Search interactions by subject or notes
   */
  async searchInteractions(query: string, limit: number): Promise<SearchResult[]> {
    const interactions = await prisma.interaction.findMany({
      where: {
        OR: [
          { subject: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      take: limit,
      orderBy: { date: 'desc' },
    });

    return interactions.map((interaction) => {
      const contactName = `${interaction.contact.firstName} ${interaction.contact.lastName}`;
      const title = interaction.subject || `${interaction.type} with ${contactName}`;
      const preview = interaction.notes
        ? createPreview(interaction.notes)
        : `${interaction.type} on ${interaction.date.toLocaleDateString()}`;

      return {
        id: interaction.id,
        entityType: 'interaction' as const,
        title,
        preview,
        relevanceScore: calculateRelevance(query, interaction.subject, interaction.notes),
        contactId: interaction.contact.id,
        contactName,
        createdAt: interaction.createdAt,
      };
    });
  },

  /**
   * Search reminders by title or description
   */
  async searchReminders(query: string, limit: number): Promise<SearchResult[]> {
    const reminders = await prisma.reminder.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      take: limit,
      orderBy: { dueDate: 'asc' },
    });

    return reminders.map((reminder) => {
      const contactName = `${reminder.contact.firstName} ${reminder.contact.lastName}`;
      const status = reminder.isCompleted ? '✓ Completed' : `Due ${reminder.dueDate.toLocaleDateString()}`;

      return {
        id: reminder.id,
        entityType: 'reminder' as const,
        title: reminder.title,
        preview: reminder.description
          ? createPreview(reminder.description)
          : status,
        relevanceScore: calculateRelevance(query, reminder.title, reminder.description),
        contactId: reminder.contact.id,
        contactName,
        createdAt: reminder.createdAt,
      };
    });
  },
};
