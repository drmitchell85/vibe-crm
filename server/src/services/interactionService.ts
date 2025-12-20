import { InteractionType } from '@prisma/client';
import { prisma } from './contactService';
import {
  createInteractionSchema,
  updateInteractionSchema,
  CreateInteractionInput,
  UpdateInteractionInput,
} from '../schemas/interactionSchema';
import { AppError } from '../middleware/errorHandler';

export interface InteractionFilters {
  type?: InteractionType;
  startDate?: Date;
  endDate?: Date;
}

export const interactionService = {
  /**
   * Get all interactions for a specific contact
   * @param contactId - Contact ID
   * @param filters - Optional filters (type, date range)
   * @returns Array of interactions
   */
  async getInteractionsForContact(contactId: string, filters?: InteractionFilters) {
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

      if (filters?.type) {
        where.type = filters.type;
      }

      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.date.lte = filters.endDate;
        }
      }

      const interactions = await prisma.interaction.findMany({
        where,
        orderBy: { date: 'desc' },
      });

      return interactions;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch interactions', 500, 'FETCH_INTERACTIONS_ERROR');
    }
  },

  /**
   * Get a single interaction by ID
   * @param id - Interaction ID
   * @returns Interaction or throws if not found
   */
  async getInteractionById(id: string) {
    try {
      const interaction = await prisma.interaction.findUnique({
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

      if (!interaction) {
        throw new AppError('Interaction not found', 404, 'INTERACTION_NOT_FOUND');
      }

      return interaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch interaction', 500, 'FETCH_INTERACTION_ERROR');
    }
  },

  /**
   * Create a new interaction
   * @param data - Interaction data
   * @returns Created interaction
   */
  async createInteraction(data: CreateInteractionInput) {
    // Validate input data
    const validatedData = createInteractionSchema.parse(data);

    try {
      // Verify contact exists
      const contact = await prisma.contact.findUnique({
        where: { id: validatedData.contactId },
      });

      if (!contact) {
        throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      const interaction = await prisma.interaction.create({
        data: {
          contactId: validatedData.contactId,
          type: validatedData.type,
          subject: validatedData.subject || null,
          notes: validatedData.notes || null,
          date: validatedData.date ? new Date(validatedData.date) : new Date(),
          duration: validatedData.duration || null,
          location: validatedData.location || null,
        },
      });

      return interaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create interaction', 500, 'CREATE_INTERACTION_ERROR');
    }
  },

  /**
   * Update an existing interaction
   * @param id - Interaction ID
   * @param data - Partial interaction data to update
   * @returns Updated interaction
   */
  async updateInteraction(id: string, data: UpdateInteractionInput) {
    // Validate input data
    const validatedData = updateInteractionSchema.parse(data);

    try {
      // Check if interaction exists
      await this.getInteractionById(id);

      const interaction = await prisma.interaction.update({
        where: { id },
        data: {
          type: validatedData.type,
          subject: validatedData.subject === '' ? null : validatedData.subject,
          notes: validatedData.notes === '' ? null : validatedData.notes,
          date: validatedData.date ? new Date(validatedData.date) : undefined,
          duration: validatedData.duration,
          location: validatedData.location === '' ? null : validatedData.location,
        },
      });

      return interaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update interaction', 500, 'UPDATE_INTERACTION_ERROR');
    }
  },

  /**
   * Delete an interaction
   * @param id - Interaction ID
   * @returns Deleted interaction
   */
  async deleteInteraction(id: string) {
    try {
      // Check if interaction exists
      await this.getInteractionById(id);

      const interaction = await prisma.interaction.delete({
        where: { id },
      });

      return interaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete interaction', 500, 'DELETE_INTERACTION_ERROR');
    }
  },
};
