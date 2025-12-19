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
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     description: Retrieve a list of all contacts, sorted by name
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
 *       500:
 *         description: Server error
 */
router.get('/', contactController.getAllContacts);

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

export default router;
