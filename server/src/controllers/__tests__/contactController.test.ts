/**
 * Integration Tests for Contact Controller
 *
 * Tests the HTTP layer of the contacts API using supertest.
 * The service layer is mocked to isolate controller behavior.
 */

import request from 'supertest';
import { AppError } from '../../middleware/errorHandler';

// Mock the contact service
const mockContactService = {
  getAllContacts: jest.fn(),
  getContactById: jest.fn(),
  createContact: jest.fn(),
  updateContact: jest.fn(),
  deleteContact: jest.fn(),
  searchContacts: jest.fn(),
  getContactsWithTagFilter: jest.fn(),
  addTagToContact: jest.fn(),
  removeTagFromContact: jest.fn(),
  getContactsByTag: jest.fn(),
};

jest.mock('../../services/contactService', () => ({
  contactService: mockContactService,
}));

// Import app after mocking
import app from '../../app';

describe('Contact Controller - Integration Tests', () => {
  // Sample test data
  const mockContact = {
    id: 'contact-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    socialMedia: { twitter: '@johndoe' },
    company: 'Acme Inc',
    jobTitle: 'Engineer',
    address: '123 Main St',
    birthday: new Date('1990-01-15').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
  };

  const mockContactWithRelations = {
    ...mockContact,
    interactions: [],
    reminders: [],
    notes: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/contacts (with optional tag filtering)
  // ============================================
  describe('GET /api/contacts', () => {
    it('should return 200 with array of contacts', async () => {
      const contacts = [mockContact, { ...mockContact, id: 'contact-456', firstName: 'Jane' }];
      mockContactService.getContactsWithTagFilter.mockResolvedValue(contacts);

      const response = await request(app).get('/api/contacts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: contacts,
      });
      expect(mockContactService.getContactsWithTagFilter).toHaveBeenCalledWith(undefined);
    });

    it('should return 200 with empty array when no contacts exist', async () => {
      mockContactService.getContactsWithTagFilter.mockResolvedValue([]);

      const response = await request(app).get('/api/contacts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should filter contacts by single tag ID', async () => {
      const filteredContacts = [mockContact];
      mockContactService.getContactsWithTagFilter.mockResolvedValue(filteredContacts);

      const response = await request(app).get('/api/contacts?tags=tag-123');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(filteredContacts);
      expect(mockContactService.getContactsWithTagFilter).toHaveBeenCalledWith(['tag-123']);
    });

    it('should filter contacts by multiple tag IDs', async () => {
      const filteredContacts = [mockContact];
      mockContactService.getContactsWithTagFilter.mockResolvedValue(filteredContacts);

      const response = await request(app).get('/api/contacts?tags=tag-123,tag-456');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(filteredContacts);
      expect(mockContactService.getContactsWithTagFilter).toHaveBeenCalledWith(['tag-123', 'tag-456']);
    });

    it('should handle empty tags parameter', async () => {
      mockContactService.getContactsWithTagFilter.mockResolvedValue([mockContact]);

      const response = await request(app).get('/api/contacts?tags=');

      expect(response.status).toBe(200);
      expect(mockContactService.getContactsWithTagFilter).toHaveBeenCalledWith(undefined);
    });

    it('should return 500 when service throws error', async () => {
      mockContactService.getContactsWithTagFilter.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_CONTACTS_ERROR')
      );

      const response = await request(app).get('/api/contacts');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FETCH_CONTACTS_ERROR');
    });
  });

  // ============================================
  // GET /api/contacts/:id
  // ============================================
  describe('GET /api/contacts/:id', () => {
    it('should return 200 with contact when found', async () => {
      mockContactService.getContactById.mockResolvedValue(mockContactWithRelations);

      const response = await request(app).get('/api/contacts/contact-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockContactWithRelations,
      });
      expect(mockContactService.getContactById).toHaveBeenCalledWith('contact-123');
    });

    it('should return 404 when contact not found', async () => {
      mockContactService.getContactById.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app).get('/api/contacts/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockContactService.getContactById.mockRejectedValue(
        new AppError('Database error', 500, 'FETCH_CONTACT_ERROR')
      );

      const response = await request(app).get('/api/contacts/contact-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // POST /api/contacts
  // ============================================
  describe('POST /api/contacts', () => {
    const validCreateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    };

    it('should return 201 with created contact on success', async () => {
      const createdContact = { ...mockContact, ...validCreateData, id: 'new-contact' };
      mockContactService.createContact.mockResolvedValue(createdContact);

      const response = await request(app)
        .post('/api/contacts')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: createdContact,
      });
      expect(mockContactService.createContact).toHaveBeenCalledWith(validCreateData);
    });

    it('should return 201 with minimal data (firstName, lastName only)', async () => {
      const minimalData = { firstName: 'Min', lastName: 'Data' };
      const createdContact = { ...mockContact, ...minimalData, id: 'minimal-contact' };
      mockContactService.createContact.mockResolvedValue(createdContact);

      const response = await request(app)
        .post('/api/contacts')
        .send(minimalData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 on validation error (missing firstName)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'First name is required',
          path: ['firstName'],
        },
      ]);
      mockContactService.createContact.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts')
        .send({ lastName: 'Smith' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on validation error (invalid email)', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_string',
          validation: 'email',
          message: 'Invalid email format',
          path: ['email'],
        },
      ]);
      mockContactService.createContact.mockRejectedValue(zodError);

      const response = await request(app)
        .post('/api/contacts')
        .send({ firstName: 'Jane', lastName: 'Smith', email: 'not-an-email' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 on duplicate email', async () => {
      mockContactService.createContact.mockRejectedValue(
        new AppError('A contact with this email already exists', 409, 'DUPLICATE_EMAIL')
      );

      const response = await request(app)
        .post('/api/contacts')
        .send(validCreateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
    });
  });

  // ============================================
  // PUT /api/contacts/:id
  // ============================================
  describe('PUT /api/contacts/:id', () => {
    const updateData = {
      firstName: 'Johnny',
      email: 'johnny@example.com',
    };

    it('should return 200 with updated contact on success', async () => {
      const updatedContact = { ...mockContact, ...updateData };
      mockContactService.updateContact.mockResolvedValue(updatedContact);

      const response = await request(app)
        .put('/api/contacts/contact-123')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: updatedContact,
      });
      expect(mockContactService.updateContact).toHaveBeenCalledWith('contact-123', updateData);
    });

    it('should return 200 with partial update (single field)', async () => {
      const partialUpdate = { phone: '555-9999' };
      const updatedContact = { ...mockContact, ...partialUpdate };
      mockContactService.updateContact.mockResolvedValue(updatedContact);

      const response = await request(app)
        .put('/api/contacts/contact-123')
        .send(partialUpdate)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when contact not found', async () => {
      mockContactService.updateContact.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app)
        .put('/api/contacts/non-existent')
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 400 on validation error', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_string',
          validation: 'email',
          message: 'Invalid email format',
          path: ['email'],
        },
      ]);
      mockContactService.updateContact.mockRejectedValue(zodError);

      const response = await request(app)
        .put('/api/contacts/contact-123')
        .send({ email: 'invalid-email' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 on duplicate email', async () => {
      mockContactService.updateContact.mockRejectedValue(
        new AppError('A contact with this email already exists', 409, 'DUPLICATE_EMAIL')
      );

      const response = await request(app)
        .put('/api/contacts/contact-123')
        .send({ email: 'existing@example.com' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
    });
  });

  // ============================================
  // DELETE /api/contacts/:id
  // ============================================
  describe('DELETE /api/contacts/:id', () => {
    it('should return 200 with success message on delete', async () => {
      mockContactService.deleteContact.mockResolvedValue(mockContact);

      const response = await request(app).delete('/api/contacts/contact-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { message: 'Contact deleted successfully' },
      });
      expect(mockContactService.deleteContact).toHaveBeenCalledWith('contact-123');
    });

    it('should return 404 when contact not found', async () => {
      mockContactService.deleteContact.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app).delete('/api/contacts/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockContactService.deleteContact.mockRejectedValue(
        new AppError('Database error', 500, 'DELETE_CONTACT_ERROR')
      );

      const response = await request(app).delete('/api/contacts/contact-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/contacts/search
  // ============================================
  describe('GET /api/contacts/search', () => {
    it('should return 200 with filtered results', async () => {
      const searchResults = [mockContact];
      mockContactService.searchContacts.mockResolvedValue(searchResults);

      const response = await request(app).get('/api/contacts/search?q=John');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: searchResults,
      });
      expect(mockContactService.searchContacts).toHaveBeenCalledWith('John');
    });

    it('should return 200 with empty array when no matches', async () => {
      mockContactService.searchContacts.mockResolvedValue([]);

      const response = await request(app).get('/api/contacts/search?q=nonexistent');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/api/contacts/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_QUERY');
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get('/api/contacts/search?q=');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_QUERY');
    });

    it('should handle special characters in search query', async () => {
      mockContactService.searchContacts.mockResolvedValue([]);

      const response = await request(app).get('/api/contacts/search?q=john%40example.com');

      expect(response.status).toBe(200);
      expect(mockContactService.searchContacts).toHaveBeenCalledWith('john@example.com');
    });

    it('should return 500 on service error', async () => {
      mockContactService.searchContacts.mockRejectedValue(
        new AppError('Search failed', 500, 'SEARCH_CONTACTS_ERROR')
      );

      const response = await request(app).get('/api/contacts/search?q=test');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // POST /api/contacts/:id/tags
  // ============================================
  describe('POST /api/contacts/:id/tags', () => {
    const mockContactWithTags = {
      ...mockContact,
      tags: [{ tag: { id: 'tag-123', name: 'Backgammon', color: '#FF5733' } }],
    };

    it('should return 201 when tag is added successfully', async () => {
      mockContactService.addTagToContact.mockResolvedValue(mockContactWithTags);

      const response = await request(app)
        .post('/api/contacts/contact-123/tags')
        .send({ tagId: 'tag-123' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: mockContactWithTags,
      });
      expect(mockContactService.addTagToContact).toHaveBeenCalledWith('contact-123', 'tag-123');
    });

    it('should return 400 when tagId is missing', async () => {
      const response = await request(app)
        .post('/api/contacts/contact-123/tags')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TAG_ID');
    });

    it('should return 400 when tagId is not a string', async () => {
      const response = await request(app)
        .post('/api/contacts/contact-123/tags')
        .send({ tagId: 123 })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TAG_ID');
    });

    it('should return 404 when contact not found', async () => {
      mockContactService.addTagToContact.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app)
        .post('/api/contacts/non-existent/tags')
        .send({ tagId: 'tag-123' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 404 when tag not found', async () => {
      mockContactService.addTagToContact.mockRejectedValue(
        new AppError('Tag not found', 404, 'TAG_NOT_FOUND')
      );

      const response = await request(app)
        .post('/api/contacts/contact-123/tags')
        .send({ tagId: 'non-existent-tag' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TAG_NOT_FOUND');
    });

    it('should return 201 when tag is already assigned (idempotent)', async () => {
      mockContactService.addTagToContact.mockResolvedValue(mockContactWithTags);

      const response = await request(app)
        .post('/api/contacts/contact-123/tags')
        .send({ tagId: 'tag-123' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      mockContactService.addTagToContact.mockRejectedValue(
        new AppError('Database error', 500, 'ADD_TAG_ERROR')
      );

      const response = await request(app)
        .post('/api/contacts/contact-123/tags')
        .send({ tagId: 'tag-123' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // DELETE /api/contacts/:id/tags/:tagId
  // ============================================
  describe('DELETE /api/contacts/:id/tags/:tagId', () => {
    const mockContactWithoutTags = {
      ...mockContact,
      tags: [],
    };

    it('should return 200 when tag is removed successfully', async () => {
      mockContactService.removeTagFromContact.mockResolvedValue(mockContactWithoutTags);

      const response = await request(app).delete('/api/contacts/contact-123/tags/tag-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockContactWithoutTags,
      });
      expect(mockContactService.removeTagFromContact).toHaveBeenCalledWith('contact-123', 'tag-123');
    });

    it('should return 404 when contact not found', async () => {
      mockContactService.removeTagFromContact.mockRejectedValue(
        new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND')
      );

      const response = await request(app).delete('/api/contacts/non-existent/tags/tag-123');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONTACT_NOT_FOUND');
    });

    it('should return 404 when tag is not assigned to contact', async () => {
      mockContactService.removeTagFromContact.mockRejectedValue(
        new AppError('Tag is not assigned to this contact', 404, 'TAG_NOT_ASSIGNED')
      );

      const response = await request(app).delete('/api/contacts/contact-123/tags/tag-456');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TAG_NOT_ASSIGNED');
    });

    it('should return 500 on database error', async () => {
      mockContactService.removeTagFromContact.mockRejectedValue(
        new AppError('Database error', 500, 'REMOVE_TAG_ERROR')
      );

      const response = await request(app).delete('/api/contacts/contact-123/tags/tag-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // Additional Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/contacts/unknown/route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });
});
