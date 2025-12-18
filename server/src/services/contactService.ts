import { PrismaClient } from '@prisma/client';
import { createContactSchema, updateContactSchema, CreateContactInput, UpdateContactInput } from '../schemas/contactSchema';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const contactService = {
  /**
   * Get all contacts
   * @returns Array of all contacts
   */
  async getAllContacts() {
    try {
      const contacts = await prisma.contact.findMany({
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
      return contacts;
    } catch (error) {
      throw new AppError('Failed to fetch contacts', 500, 'FETCH_CONTACTS_ERROR');
    }
  },

  /**
   * Get a single contact by ID
   * @param id - Contact ID
   * @returns Contact or null if not found
   */
  async getContactById(id: string) {
    try {
      const contact = await prisma.contact.findUnique({
        where: { id },
        include: {
          interactions: {
            orderBy: { date: 'desc' }
          },
          reminders: {
            orderBy: { dueDate: 'asc' }
          },
          notes: {
            orderBy: { createdAt: 'desc' }
          },
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      if (!contact) {
        throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      return contact;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch contact', 500, 'FETCH_CONTACT_ERROR');
    }
  },

  /**
   * Create a new contact
   * @param data - Contact data to create
   * @returns Created contact
   */
  async createContact(data: CreateContactInput) {
    // Validate input data
    const validatedData = createContactSchema.parse(data);

    try {
      // Convert empty strings to null for optional fields
      const contactData = {
        ...validatedData,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        twitterUsername: validatedData.twitterUsername || null,
        company: validatedData.company || null,
        jobTitle: validatedData.jobTitle || null,
        address: validatedData.address || null,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
      };

      const contact = await prisma.contact.create({
        data: contactData,
      });

      return contact;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // Handle unique constraint violations (e.g., duplicate email)
      if ((error as any).code === 'P2002') {
        throw new AppError('A contact with this email already exists', 409, 'DUPLICATE_EMAIL');
      }
      throw new AppError('Failed to create contact', 500, 'CREATE_CONTACT_ERROR');
    }
  },

  /**
   * Update an existing contact
   * @param id - Contact ID
   * @param data - Partial contact data to update
   * @returns Updated contact
   */
  async updateContact(id: string, data: UpdateContactInput) {
    // Validate input data
    const validatedData = updateContactSchema.parse(data);

    try {
      // Check if contact exists
      await this.getContactById(id);

      // Convert empty strings to null for optional fields
      const contactData = {
        ...validatedData,
        email: validatedData.email === '' ? null : validatedData.email,
        phone: validatedData.phone === '' ? null : validatedData.phone,
        twitterUsername: validatedData.twitterUsername === '' ? null : validatedData.twitterUsername,
        company: validatedData.company === '' ? null : validatedData.company,
        jobTitle: validatedData.jobTitle === '' ? null : validatedData.jobTitle,
        address: validatedData.address === '' ? null : validatedData.address,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : undefined,
      };

      const contact = await prisma.contact.update({
        where: { id },
        data: contactData,
      });

      return contact;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // Handle unique constraint violations
      if ((error as any).code === 'P2002') {
        throw new AppError('A contact with this email already exists', 409, 'DUPLICATE_EMAIL');
      }
      throw new AppError('Failed to update contact', 500, 'UPDATE_CONTACT_ERROR');
    }
  },

  /**
   * Delete a contact
   * @param id - Contact ID
   * @returns Deleted contact
   */
  async deleteContact(id: string) {
    try {
      // Check if contact exists
      await this.getContactById(id);

      const contact = await prisma.contact.delete({
        where: { id },
      });

      return contact;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete contact', 500, 'DELETE_CONTACT_ERROR');
    }
  },

  /**
   * Search contacts by name, email, or twitter username
   * @param query - Search query string
   * @returns Array of matching contacts
   */
  async searchContacts(query: string) {
    try {
      const contacts = await prisma.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { twitterUsername: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
          ]
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });

      return contacts;
    } catch (error) {
      throw new AppError('Failed to search contacts', 500, 'SEARCH_CONTACTS_ERROR');
    }
  }
};

// Export prisma instance for use in other services
export { prisma };
