/**
 * Unit Tests for Contact Service
 *
 * Tests the business logic of the contact service in isolation
 * by mocking the Prisma client.
 */

import { AppError } from '../../middleware/errorHandler';

// Mock Prisma Client
const mockPrismaContact = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaTag = {
  findUnique: jest.fn(),
};

const mockPrismaContactTag = {
  findUnique: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    contact: mockPrismaContact,
    tag: mockPrismaTag,
    contactTag: mockPrismaContactTag,
  })),
  Prisma: {
    JsonNull: 'JsonNull',
  },
}));

// Import after mocking
import { contactService } from '../contactService';

describe('contactService', () => {
  // Sample test data
  const mockContact = {
    id: 'contact-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    socialMedia: { twitter: '@johndoe' },
    company: 'Acme Inc',
    jobTitle: 'Engineer',
    address: '123 Main St',
    birthday: new Date('1990-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockContactWithRelations = {
    ...mockContact,
    interactions: [],
    reminders: [],
    notes: [],
    tags: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getAllContacts Tests
  // ============================================
  describe('getAllContacts', () => {
    it('should return an array of contacts ordered by lastName, firstName', async () => {
      const mockContacts = [
        { ...mockContact, id: '1', lastName: 'Adams', tags: [] },
        { ...mockContact, id: '2', lastName: 'Brown', tags: [] },
      ];
      mockPrismaContact.findMany.mockResolvedValue(mockContacts);

      const result = await contactService.getAllContacts();

      expect(result).toEqual(mockContacts);
      expect(mockPrismaContact.findMany).toHaveBeenCalledWith({
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    it('should return empty array when no contacts exist', async () => {
      mockPrismaContact.findMany.mockResolvedValue([]);

      const result = await contactService.getAllContacts();

      expect(result).toEqual([]);
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findMany.mockRejectedValue(new Error('Database error'));

      await expect(contactService.getAllContacts()).rejects.toThrow(AppError);
      await expect(contactService.getAllContacts()).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_CONTACTS_ERROR',
      });
    });
  });

  // ============================================
  // getContactById Tests
  // ============================================
  describe('getContactById', () => {
    it('should return a contact with all relations when found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(mockContactWithRelations);

      const result = await contactService.getContactById('contact-1');

      expect(result).toEqual(mockContactWithRelations);
      expect(mockPrismaContact.findUnique).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
        include: {
          interactions: { orderBy: { date: 'desc' } },
          reminders: { orderBy: { dueDate: 'asc' } },
          notes: { orderBy: { createdAt: 'desc' } },
          tags: { include: { tag: true } },
        },
      });
    });

    it('should throw 404 AppError when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(contactService.getContactById('non-existent')).rejects.toThrow(AppError);
      await expect(contactService.getContactById('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(contactService.getContactById('contact-1')).rejects.toThrow(AppError);
      await expect(contactService.getContactById('contact-1')).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_CONTACT_ERROR',
      });
    });
  });

  // ============================================
  // createContact Tests
  // ============================================
  describe('createContact', () => {
    const validCreateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '555-5678',
    };

    it('should create and return a new contact with valid data', async () => {
      const createdContact = { ...mockContact, ...validCreateData, id: 'new-id' };
      mockPrismaContact.create.mockResolvedValue(createdContact);

      const result = await contactService.createContact(validCreateData);

      expect(result).toEqual(createdContact);
      expect(mockPrismaContact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '555-5678',
        }),
      });
    });

    it('should create contact with only required fields (firstName, lastName)', async () => {
      const minimalData = { firstName: 'Min', lastName: 'Data' };
      const createdContact = { ...mockContact, ...minimalData, id: 'new-id' };
      mockPrismaContact.create.mockResolvedValue(createdContact);

      const result = await contactService.createContact(minimalData);

      expect(result).toEqual(createdContact);
      expect(mockPrismaContact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'Min',
          lastName: 'Data',
          email: null,
          phone: null,
        }),
      });
    });

    it('should throw validation error when firstName is missing', async () => {
      const invalidData = { lastName: 'Smith' } as any;

      await expect(contactService.createContact(invalidData)).rejects.toThrow();
    });

    it('should throw validation error when lastName is missing', async () => {
      const invalidData = { firstName: 'Jane' } as any;

      await expect(contactService.createContact(invalidData)).rejects.toThrow();
    });

    it('should throw validation error for invalid email format', async () => {
      const invalidData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'not-an-email',
      };

      await expect(contactService.createContact(invalidData)).rejects.toThrow();
    });

    it('should throw 409 AppError for duplicate email', async () => {
      mockPrismaContact.create.mockRejectedValue({ code: 'P2002' });

      await expect(contactService.createContact(validCreateData)).rejects.toThrow(AppError);
      await expect(contactService.createContact(validCreateData)).rejects.toMatchObject({
        statusCode: 409,
        code: 'DUPLICATE_EMAIL',
      });
    });

    it('should convert empty socialMedia object to JsonNull', async () => {
      const dataWithEmptySocial = { ...validCreateData, socialMedia: {} };
      mockPrismaContact.create.mockResolvedValue(mockContact);

      await contactService.createContact(dataWithEmptySocial);

      expect(mockPrismaContact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          socialMedia: 'JsonNull',
        }),
      });
    });
  });

  // ============================================
  // updateContact Tests
  // ============================================
  describe('updateContact', () => {
    const updateData = {
      firstName: 'Johnny',
      email: 'johnny@example.com',
    };

    beforeEach(() => {
      // Mock getContactById to return existing contact
      mockPrismaContact.findUnique.mockResolvedValue(mockContactWithRelations);
    });

    it('should update and return the contact with valid data', async () => {
      const updatedContact = { ...mockContact, ...updateData };
      mockPrismaContact.update.mockResolvedValue(updatedContact);

      const result = await contactService.updateContact('contact-1', updateData);

      expect(result).toEqual(updatedContact);
      expect(mockPrismaContact.update).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
        data: expect.objectContaining({
          firstName: 'Johnny',
          email: 'johnny@example.com',
        }),
      });
    });

    it('should throw 404 AppError when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(contactService.updateContact('non-existent', updateData)).rejects.toThrow(AppError);
      await expect(contactService.updateContact('non-existent', updateData)).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should allow partial updates (only firstName)', async () => {
      const partialUpdate = { firstName: 'Johnny' };
      mockPrismaContact.update.mockResolvedValue({ ...mockContact, ...partialUpdate });

      await contactService.updateContact('contact-1', partialUpdate);

      expect(mockPrismaContact.update).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
        data: expect.objectContaining({
          firstName: 'Johnny',
        }),
      });
    });

    it('should convert empty string email to null', async () => {
      const updateWithEmptyEmail = { email: '' };
      mockPrismaContact.update.mockResolvedValue({ ...mockContact, email: null });

      await contactService.updateContact('contact-1', updateWithEmptyEmail);

      expect(mockPrismaContact.update).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
        data: expect.objectContaining({
          email: null,
        }),
      });
    });

    it('should throw 409 AppError for duplicate email', async () => {
      mockPrismaContact.update.mockRejectedValue({ code: 'P2002' });

      await expect(contactService.updateContact('contact-1', updateData)).rejects.toThrow(AppError);
      await expect(contactService.updateContact('contact-1', updateData)).rejects.toMatchObject({
        statusCode: 409,
        code: 'DUPLICATE_EMAIL',
      });
    });
  });

  // ============================================
  // deleteContact Tests
  // ============================================
  describe('deleteContact', () => {
    beforeEach(() => {
      mockPrismaContact.findUnique.mockResolvedValue(mockContactWithRelations);
    });

    it('should delete and return the contact', async () => {
      mockPrismaContact.delete.mockResolvedValue(mockContact);

      const result = await contactService.deleteContact('contact-1');

      expect(result).toEqual(mockContact);
      expect(mockPrismaContact.delete).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
      });
    });

    it('should throw 404 AppError when contact not found', async () => {
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(contactService.deleteContact('non-existent')).rejects.toThrow(AppError);
      await expect(contactService.deleteContact('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.delete.mockRejectedValue(new Error('Database error'));

      await expect(contactService.deleteContact('contact-1')).rejects.toThrow(AppError);
      await expect(contactService.deleteContact('contact-1')).rejects.toMatchObject({
        statusCode: 500,
        code: 'DELETE_CONTACT_ERROR',
      });
    });
  });

  // ============================================
  // searchContacts Tests
  // ============================================
  describe('searchContacts', () => {
    it('should return contacts matching the search query', async () => {
      const matchingContacts = [
        { ...mockContact, id: '1', firstName: 'John' },
        { ...mockContact, id: '2', firstName: 'Johnny' },
      ];
      mockPrismaContact.findMany.mockResolvedValue(matchingContacts);

      const result = await contactService.searchContacts('John');

      expect(result).toEqual(matchingContacts);
      expect(mockPrismaContact.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: 'John', mode: 'insensitive' } },
            { lastName: { contains: 'John', mode: 'insensitive' } },
            { email: { contains: 'John', mode: 'insensitive' } },
            { company: { contains: 'John', mode: 'insensitive' } },
          ],
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });
    });

    it('should return empty array when no contacts match', async () => {
      mockPrismaContact.findMany.mockResolvedValue([]);

      const result = await contactService.searchContacts('xyz123nonexistent');

      expect(result).toEqual([]);
    });

    it('should search by email', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);

      await contactService.searchContacts('example.com');

      expect(mockPrismaContact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { email: { contains: 'example.com', mode: 'insensitive' } },
            ]),
          },
        })
      );
    });

    it('should search by company', async () => {
      mockPrismaContact.findMany.mockResolvedValue([mockContact]);

      await contactService.searchContacts('Acme');

      expect(mockPrismaContact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { company: { contains: 'Acme', mode: 'insensitive' } },
            ]),
          },
        })
      );
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findMany.mockRejectedValue(new Error('Database error'));

      await expect(contactService.searchContacts('test')).rejects.toThrow(AppError);
      await expect(contactService.searchContacts('test')).rejects.toMatchObject({
        statusCode: 500,
        code: 'SEARCH_CONTACTS_ERROR',
      });
    });
  });

  // ============================================
  // getContactsWithTagFilter Tests
  // ============================================
  describe('getContactsWithTagFilter', () => {
    it('should return all contacts when no tags provided', async () => {
      const contacts = [
        { ...mockContact, id: '1', tags: [] },
        { ...mockContact, id: '2', tags: [] },
      ];
      mockPrismaContact.findMany.mockResolvedValue(contacts);

      const result = await contactService.getContactsWithTagFilter();

      expect(result).toEqual(contacts);
      expect(mockPrismaContact.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          tags: { include: { tag: true } },
        },
      });
    });

    it('should return all contacts when empty tag array provided', async () => {
      const contacts = [{ ...mockContact, tags: [] }];
      mockPrismaContact.findMany.mockResolvedValue(contacts);

      const result = await contactService.getContactsWithTagFilter([]);

      expect(result).toEqual(contacts);
      expect(mockPrismaContact.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          tags: { include: { tag: true } },
        },
      });
    });

    it('should filter contacts by single tag', async () => {
      const contacts = [{ ...mockContact, tags: [{ tagId: 'tag-1', tag: { id: 'tag-1', name: 'Tech' } }] }];
      mockPrismaContact.findMany.mockResolvedValue(contacts);

      const result = await contactService.getContactsWithTagFilter(['tag-1']);

      expect(result).toEqual(contacts);
      expect(mockPrismaContact.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ tags: { some: { tagId: 'tag-1' } } }],
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          tags: { include: { tag: true } },
        },
      });
    });

    it('should filter contacts by multiple tags (AND logic)', async () => {
      mockPrismaContact.findMany.mockResolvedValue([]);

      await contactService.getContactsWithTagFilter(['tag-1', 'tag-2']);

      expect(mockPrismaContact.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { tags: { some: { tagId: 'tag-1' } } },
            { tags: { some: { tagId: 'tag-2' } } },
          ],
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          tags: { include: { tag: true } },
        },
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findMany.mockRejectedValue(new Error('Database error'));

      await expect(contactService.getContactsWithTagFilter(['tag-1'])).rejects.toThrow(AppError);
      await expect(contactService.getContactsWithTagFilter(['tag-1'])).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_CONTACTS_ERROR',
      });
    });
  });

  // ============================================
  // addTagToContact Tests
  // ============================================
  describe('addTagToContact', () => {
    const mockTag = { id: 'tag-1', name: 'Backgammon', color: '#FF5733' };
    const contactWithTags = {
      ...mockContact,
      tags: [{ tagId: 'tag-1', tag: mockTag }],
    };

    beforeEach(() => {
      mockPrismaContact.findUnique
        .mockResolvedValueOnce(mockContact) // First call: check contact exists
        .mockResolvedValueOnce(contactWithTags); // Second call: return updated contact
      mockPrismaTag.findUnique.mockResolvedValue(mockTag);
      mockPrismaContactTag.upsert.mockResolvedValue({ contactId: 'contact-1', tagId: 'tag-1' });
    });

    it('should add tag to contact and return updated contact', async () => {
      const result = await contactService.addTagToContact('contact-1', 'tag-1');

      expect(result).toEqual(contactWithTags);
      expect(mockPrismaContactTag.upsert).toHaveBeenCalledWith({
        where: { contactId_tagId: { contactId: 'contact-1', tagId: 'tag-1' } },
        update: {},
        create: { contactId: 'contact-1', tagId: 'tag-1' },
      });
    });

    it('should throw 404 when contact not found', async () => {
      mockPrismaContact.findUnique.mockReset();
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(contactService.addTagToContact('non-existent', 'tag-1')).rejects.toThrow(AppError);
      await expect(contactService.addTagToContact('non-existent', 'tag-1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should throw 404 when tag not found', async () => {
      mockPrismaContact.findUnique.mockReset();
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockPrismaTag.findUnique.mockResolvedValue(null);

      await expect(contactService.addTagToContact('contact-1', 'non-existent')).rejects.toThrow(AppError);
      await expect(contactService.addTagToContact('contact-1', 'non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'TAG_NOT_FOUND',
      });
    });

    it('should be idempotent (not error if tag already assigned)', async () => {
      // upsert handles this gracefully
      const result = await contactService.addTagToContact('contact-1', 'tag-1');

      expect(result).toEqual(contactWithTags);
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findUnique.mockReset();
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockPrismaTag.findUnique.mockResolvedValue(mockTag);
      mockPrismaContactTag.upsert.mockRejectedValue(new Error('Database error'));

      await expect(contactService.addTagToContact('contact-1', 'tag-1')).rejects.toThrow(AppError);
      await expect(contactService.addTagToContact('contact-1', 'tag-1')).rejects.toMatchObject({
        statusCode: 500,
        code: 'ADD_TAG_ERROR',
      });
    });
  });

  // ============================================
  // removeTagFromContact Tests
  // ============================================
  describe('removeTagFromContact', () => {
    const contactWithoutTags = { ...mockContact, tags: [] };

    beforeEach(() => {
      mockPrismaContact.findUnique
        .mockResolvedValueOnce(mockContact) // First call: check contact exists
        .mockResolvedValueOnce(contactWithoutTags); // Second call: return updated contact
      mockPrismaContactTag.findUnique.mockResolvedValue({ contactId: 'contact-1', tagId: 'tag-1' });
      mockPrismaContactTag.delete.mockResolvedValue({ contactId: 'contact-1', tagId: 'tag-1' });
    });

    it('should remove tag from contact and return updated contact', async () => {
      const result = await contactService.removeTagFromContact('contact-1', 'tag-1');

      expect(result).toEqual(contactWithoutTags);
      expect(mockPrismaContactTag.delete).toHaveBeenCalledWith({
        where: { contactId_tagId: { contactId: 'contact-1', tagId: 'tag-1' } },
      });
    });

    it('should throw 404 when contact not found', async () => {
      mockPrismaContact.findUnique.mockReset();
      mockPrismaContact.findUnique.mockResolvedValue(null);

      await expect(contactService.removeTagFromContact('non-existent', 'tag-1')).rejects.toThrow(AppError);
      await expect(contactService.removeTagFromContact('non-existent', 'tag-1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
      });
    });

    it('should throw 404 when tag not assigned to contact', async () => {
      mockPrismaContact.findUnique.mockReset();
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockPrismaContactTag.findUnique.mockResolvedValue(null);

      await expect(contactService.removeTagFromContact('contact-1', 'tag-1')).rejects.toThrow(AppError);
      await expect(contactService.removeTagFromContact('contact-1', 'tag-1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'TAG_NOT_ASSIGNED',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findUnique.mockReset();
      mockPrismaContact.findUnique.mockResolvedValue(mockContact);
      mockPrismaContactTag.findUnique.mockResolvedValue({ contactId: 'contact-1', tagId: 'tag-1' });
      mockPrismaContactTag.delete.mockRejectedValue(new Error('Database error'));

      await expect(contactService.removeTagFromContact('contact-1', 'tag-1')).rejects.toThrow(AppError);
      await expect(contactService.removeTagFromContact('contact-1', 'tag-1')).rejects.toMatchObject({
        statusCode: 500,
        code: 'REMOVE_TAG_ERROR',
      });
    });
  });

  // ============================================
  // getContactsByTag Tests
  // ============================================
  describe('getContactsByTag', () => {
    const mockTag = { id: 'tag-1', name: 'Backgammon', color: '#FF5733' };
    const contactsWithTag = [
      { ...mockContact, id: '1', tags: [{ tagId: 'tag-1', tag: mockTag }] },
      { ...mockContact, id: '2', tags: [{ tagId: 'tag-1', tag: mockTag }] },
    ];

    beforeEach(() => {
      mockPrismaTag.findUnique.mockResolvedValue(mockTag);
      mockPrismaContact.findMany.mockResolvedValue(contactsWithTag);
    });

    it('should return contacts with the specified tag', async () => {
      const result = await contactService.getContactsByTag('tag-1');

      expect(result).toEqual(contactsWithTag);
      expect(mockPrismaContact.findMany).toHaveBeenCalledWith({
        where: { tags: { some: { tagId: 'tag-1' } } },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: { tags: { include: { tag: true } } },
      });
    });

    it('should return empty array when no contacts have the tag', async () => {
      mockPrismaContact.findMany.mockResolvedValue([]);

      const result = await contactService.getContactsByTag('tag-1');

      expect(result).toEqual([]);
    });

    it('should throw 404 when tag not found', async () => {
      mockPrismaTag.findUnique.mockResolvedValue(null);

      await expect(contactService.getContactsByTag('non-existent')).rejects.toThrow(AppError);
      await expect(contactService.getContactsByTag('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'TAG_NOT_FOUND',
      });
    });

    it('should throw AppError on database failure', async () => {
      mockPrismaContact.findMany.mockRejectedValue(new Error('Database error'));

      await expect(contactService.getContactsByTag('tag-1')).rejects.toThrow(AppError);
      await expect(contactService.getContactsByTag('tag-1')).rejects.toMatchObject({
        statusCode: 500,
        code: 'FETCH_CONTACTS_BY_TAG_ERROR',
      });
    });
  });
});
