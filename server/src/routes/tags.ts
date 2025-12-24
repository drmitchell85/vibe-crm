import { Router } from 'express';
import { tagController } from '../controllers/tagController';
import { contactController } from '../controllers/contactController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated tag ID
 *         name:
 *           type: string
 *           description: Unique tag name
 *           example: "Backgammon"
 *         color:
 *           type: string
 *           pattern: ^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$
 *           description: Hex color code for visual distinction
 *           example: "#FF5733"
 *         contactCount:
 *           type: integer
 *           description: Number of contacts with this tag
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *
 *     CreateTagInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: Unique tag name
 *           example: "Tech Industry"
 *         color:
 *           type: string
 *           pattern: ^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$
 *           description: Hex color code (defaults to #6B7280 if not provided)
 *           example: "#3B82F6"
 *
 *     UpdateTagInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: New tag name
 *         color:
 *           type: string
 *           pattern: ^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$
 *           description: New hex color code
 */

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tag management for organizing contacts
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     description: Retrieve all tags with contact counts, ordered by name
 *     responses:
 *       200:
 *         description: List of tags retrieved successfully
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
 *                     $ref: '#/components/schemas/Tag'
 *       500:
 *         description: Server error
 */
router.get('/', tagController.getAllTags);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [Tags]
 *     description: Retrieve a single tag with contact count
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
router.get('/:id', tagController.getTagById);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     description: Create a new tag for organizing contacts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagInput'
 *           examples:
 *             withColor:
 *               summary: Tag with custom color
 *               value:
 *                 name: "Backgammon"
 *                 color: "#FF5733"
 *             minimalTag:
 *               summary: Tag with default color
 *               value:
 *                 name: "Tech Industry"
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Validation error (invalid name or color format)
 *       409:
 *         description: Tag with this name already exists
 *       500:
 *         description: Server error
 */
router.post('/', tagController.createTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Update a tag
 *     tags: [Tags]
 *     description: Update an existing tag (partial updates allowed)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTagInput'
 *           examples:
 *             updateName:
 *               summary: Update name only
 *               value:
 *                 name: "Board Games"
 *             updateColor:
 *               summary: Update color only
 *               value:
 *                 color: "#10B981"
 *             updateBoth:
 *               summary: Update name and color
 *               value:
 *                 name: "Gaming"
 *                 color: "#8B5CF6"
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Tag not found
 *       409:
 *         description: Tag with this name already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', tagController.updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
 *     description: Permanently delete a tag. This removes the tag from all contacts but does not delete the contacts.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag deleted successfully
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
 *                       example: "Tag deleted successfully"
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', tagController.deleteTag);

/**
 * @swagger
 * /api/tags/{id}/contacts:
 *   get:
 *     summary: Get all contacts with a specific tag
 *     tags: [Tags]
 *     description: Retrieve all contacts that have the specified tag assigned
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: List of contacts with the tag
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
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
router.get('/:tagId/contacts', contactController.getContactsByTag);

export default router;
