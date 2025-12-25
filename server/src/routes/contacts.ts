import { Router } from 'express';
import { contactController } from '../controllers/contactController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated contact ID
 *         firstName:
 *           type: string
 *           description: Contact's first name
 *           example: John
 *         lastName:
 *           type: string
 *           description: Contact's last name
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: Contact's email address
 *           example: john.doe@example.com
 *         phone:
 *           type: string
 *           description: Contact's phone number
 *           example: "+1 555-1234"
 *         socialMedia:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Social media handles/usernames
 *           example: { "twitter": "@johndoe", "linkedin": "johndoe", "github": "johndoe" }
 *         company:
 *           type: string
 *           description: Company name
 *           example: "Acme Corp"
 *         jobTitle:
 *           type: string
 *           description: Job title
 *           example: "Software Engineer"
 *         address:
 *           type: string
 *           description: Physical address
 *           example: "123 Main St, San Francisco, CA"
 *         birthday:
 *           type: string
 *           format: date-time
 *           description: Birthday in ISO format
 *           example: "1990-01-15T00:00:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     CreateContactInput:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 1
 *         lastName:
 *           type: string
 *           minLength: 1
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         socialMedia:
 *           type: object
 *           additionalProperties:
 *             type: string
 *         company:
 *           type: string
 *         jobTitle:
 *           type: string
 *         address:
 *           type: string
 *         birthday:
 *           type: string
 *           format: date-time
 *
 *     UpdateContactInput:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         socialMedia:
 *           type: object
 *           additionalProperties:
 *             type: string
 *         company:
 *           type: string
 *         jobTitle:
 *           type: string
 *         address:
 *           type: string
 *         birthday:
 *           type: string
 *           format: date-time
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             code:
 *               type: string
 */

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact management endpoints
 */

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Get all contacts with optional filtering and sorting
 *     tags: [Contacts]
 *     description: Retrieve a list of all contacts with advanced filtering and sorting options. Supports filtering by tags, company, created date, and reminder status. Supports sorting by name, email, company, created date, or updated date.
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tag IDs to filter by (contacts must have ALL specified tags)
 *         example: "tag-uuid-1,tag-uuid-2"
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company name (case-insensitive partial match)
 *         example: "Acme"
 *       - in: query
 *         name: createdAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter contacts created on or after this date (ISO 8601 format)
 *         example: "2024-01-01T00:00:00.000Z"
 *       - in: query
 *         name: createdBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter contacts created on or before this date (ISO 8601 format)
 *         example: "2024-12-31T23:59:59.999Z"
 *       - in: query
 *         name: hasReminders
 *         schema:
 *           type: string
 *           enum: ["true"]
 *         description: Filter contacts that have pending (incomplete) reminders
 *         example: "true"
 *       - in: query
 *         name: hasOverdueReminders
 *         schema:
 *           type: string
 *           enum: ["true"]
 *         description: Filter contacts that have overdue incomplete reminders
 *         example: "true"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, company, createdAt, updatedAt]
 *           default: name
 *         description: Field to sort by. "name" sorts by lastName then firstName.
 *         example: "name"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction (ascending or descending)
 *         example: "asc"
 *     responses:
 *       200:
 *         description: List of contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid date format
 *       500:
 *         description: Server error
 */
router.get('/', contactController.getContactsWithFilters);

/**
 * @swagger
 * /api/contacts/companies:
 *   get:
 *     summary: Get all distinct company names
 *     tags: [Contacts]
 *     description: Retrieve a list of all unique company names for filter dropdowns
 *     responses:
 *       200:
 *         description: List of company names retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Acme Corp", "Tech Solutions", "Global Industries"]
 *       500:
 *         description: Server error
 */
router.get('/companies', contactController.getDistinctCompanies);

/**
 * @swagger
 * /api/contacts/search:
 *   get:
 *     summary: Search contacts
 *     tags: [Contacts]
 *     description: Search contacts by name, email, or company
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "john"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Server error
 */
router.get('/search', contactController.searchContacts);

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Get contact by ID
 *     tags: [Contacts]
 *     description: Retrieve a single contact with all related data (interactions, reminders, notes, tags)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get('/:id', contactController.getContactById);

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     description: Create a new contact with validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContactInput'
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john.doe@example.com"
 *             phone: "+1 555-1234"
 *             socialMedia:
 *               twitter: "@johndoe"
 *               linkedin: "johndoe"
 *               github: "johndoe"
 *             company: "Acme Corp"
 *             jobTitle: "Software Engineer"
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate email
 *       500:
 *         description: Server error
 */
router.post('/', contactController.createContact);

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Update a contact
 *     tags: [Contacts]
 *     description: Update an existing contact (partial updates allowed)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateContactInput'
 *           example:
 *             email: "newemail@example.com"
 *             phone: "+1 555-9999"
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contact not found
 *       409:
 *         description: Duplicate email
 *       500:
 *         description: Server error
 */
router.put('/:id', contactController.updateContact);

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     description: Delete a contact and all related data (interactions, reminders, notes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', contactController.deleteContact);

/**
 * @swagger
 * /api/contacts/{id}/tags:
 *   post:
 *     summary: Add a tag to a contact
 *     tags: [Contacts]
 *     description: Add a tag to a contact. If the tag is already assigned, the operation is idempotent.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagId
 *             properties:
 *               tagId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the tag to add
 *           example:
 *             tagId: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       201:
 *         description: Tag added to contact successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Missing tag ID
 *       404:
 *         description: Contact or tag not found
 *       500:
 *         description: Server error
 */
router.post('/:id/tags', contactController.addTagToContact);

/**
 * @swagger
 * /api/contacts/{id}/tags/{tagId}:
 *   delete:
 *     summary: Remove a tag from a contact
 *     tags: [Contacts]
 *     description: Remove a tag from a contact
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contact ID
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tag ID to remove
 *     responses:
 *       200:
 *         description: Tag removed from contact successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found or tag not assigned to contact
 *       500:
 *         description: Server error
 */
router.delete('/:id/tags/:tagId', contactController.removeTagFromContact);

export default router;
