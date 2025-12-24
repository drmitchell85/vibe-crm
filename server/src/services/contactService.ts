import { PrismaClient, Prisma } from '@prisma/client';
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
        socialMedia: validatedData.socialMedia && Object.keys(validatedData.socialMedia).length > 0
          ? validatedData.socialMedia as Prisma.InputJsonValue
          : Prisma.JsonNull,
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
        socialMedia: validatedData.socialMedia !== undefined
          ? (Object.keys(validatedData.socialMedia).length > 0
              ? validatedData.socialMedia as Prisma.InputJsonValue
              : Prisma.JsonNull)
          : undefined,
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
   * Search contacts by name, email, or company
   * Note: Social media search not currently supported (requires JSON search)
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
  },

  /**
   * Get all contacts with optional tag filtering
   * @param tagIds - Optional array of tag IDs to filter by (contacts must have ALL tags)
   * @returns Array of contacts matching the filter
   */
  async getContactsWithTagFilter(tagIds?: string[]) {
    try {
      const whereClause: Prisma.ContactWhereInput = {};

      // If tag IDs provided, filter contacts that have ALL specified tags
      if (tagIds && tagIds.length > 0) {
        whereClause.AND = tagIds.map(tagId => ({
          tags: {
            some: {
              tagId: tagId
            }
          }
        }));
      }

      const contacts = await prisma.contact.findMany({
        where: whereClause,
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
   * Add a tag to a contact
   * @param contactId - Contact ID
   * @param tagId - Tag ID
   * @returns Updated contact with tags
   */
  async addTagToContact(contactId: string, tagId: string) {
    try {
      // Verify contact exists
      const contact = await prisma.contact.findUnique({
        where: { id: contactId }
      });

      if (!contact) {
        throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      // Verify tag exists
      const tag = await prisma.tag.findUnique({
        where: { id: tagId }
      });

      if (!tag) {
        throw new AppError('Tag not found', 404, 'TAG_NOT_FOUND');
      }

      // Create the link (upsert to handle already-linked case gracefully)
      await prisma.contactTag.upsert({
        where: {
          contactId_tagId: {
            contactId,
            tagId
          }
        },
        update: {}, // No update needed if already exists
        create: {
          contactId,
          tagId
        }
      });

      // Return updated contact with all tags
      return prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to add tag to contact', 500, 'ADD_TAG_ERROR');
    }
  },

  /**
   * Remove a tag from a contact
   * @param contactId - Contact ID
   * @param tagId - Tag ID
   * @returns Updated contact with tags
   */
  async removeTagFromContact(contactId: string, tagId: string) {
    try {
      // Verify contact exists
      const contact = await prisma.contact.findUnique({
        where: { id: contactId }
      });

      if (!contact) {
        throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }

      // Check if the link exists
      const existingLink = await prisma.contactTag.findUnique({
        where: {
          contactId_tagId: {
            contactId,
            tagId
          }
        }
      });

      if (!existingLink) {
        throw new AppError('Tag is not assigned to this contact', 404, 'TAG_NOT_ASSIGNED');
      }

      // Delete the link
      await prisma.contactTag.delete({
        where: {
          contactId_tagId: {
            contactId,
            tagId
          }
        }
      });

      // Return updated contact with remaining tags
      return prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to remove tag from contact', 500, 'REMOVE_TAG_ERROR');
    }
  },

  /**
   * Get all contacts that have a specific tag
   * @param tagId - Tag ID
   * @returns Array of contacts with the specified tag
   */
  async getContactsByTag(tagId: string) {
    try {
      // Verify tag exists
      const tag = await prisma.tag.findUnique({
        where: { id: tagId }
      });

      if (!tag) {
        throw new AppError('Tag not found', 404, 'TAG_NOT_FOUND');
      }

      const contacts = await prisma.contact.findMany({
        where: {
          tags: {
            some: {
              tagId: tagId
            }
          }
        },
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
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch contacts by tag', 500, 'FETCH_CONTACTS_BY_TAG_ERROR');
    }
  }
};

// Export prisma instance for use in other services
export { prisma };
