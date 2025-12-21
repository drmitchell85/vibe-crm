import { Router } from 'express';
import { interactionController } from '../controllers/interactionController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Interaction:
 *       type: object
 *       required:
 *         - contactId
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated interaction ID
 *         contactId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated contact
 *         type:
 *           type: string
 *           enum: [CALL, MEETING, EMAIL, TEXT, COFFEE, LUNCH, EVENT, OTHER]
 *           description: Type of interaction
 *           example: MEETING
 *         subject:
 *           type: string
 *           description: Brief subject/title of the interaction
 *           example: "Quarterly catch-up"
 *         notes:
 *           type: string
 *           description: Detailed notes about the interaction
 *           example: "Discussed project timeline and upcoming milestones"
 *         date:
 *           type: string
 *           format: date-time
 *           description: When the interaction occurred
 *           example: "2025-12-20T14:00:00.000Z"
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *           example: 60
 *         location:
 *           type: string
 *           description: Where the interaction took place
 *           example: "Coffee Shop on Main St"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     CreateInteractionInput:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [CALL, MEETING, EMAIL, TEXT, COFFEE, LUNCH, EVENT, OTHER]
 *         subject:
 *           type: string
 *         notes:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           minimum: 1
 *         location:
 *           type: string
 *
 *     UpdateInteractionInput:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [CALL, MEETING, EMAIL, TEXT, COFFEE, LUNCH, EVENT, OTHER]
 *         subject:
 *           type: string
 *         notes:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           minimum: 1
 *         location:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Interactions
 *   description: Interaction tracking endpoints
 */

/**
 * @swagger
 * /api/contacts/{contactId}/interactions:
 *   get:
 *     summary: Get all interactions for a contact
 *     tags: [Interactions]
 *     description: Retrieve all interactions for a specific contact with optional filtering
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contact ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CALL, MEETING, EMAIL, TEXT, COFFEE, LUNCH, EVENT, OTHER]
 *         description: Filter by interaction type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter interactions on or after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter interactions on or before this date
 *     responses:
 *       200:
 *         description: List of interactions retrieved successfully
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
 *                     $ref: '#/components/schemas/Interaction'
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get('/contacts/:contactId/interactions', interactionController.getInteractionsForContact);

/**
 * @swagger
 * /api/contacts/{contactId}/interactions:
 *   post:
 *     summary: Create a new interaction
 *     tags: [Interactions]
 *     description: Log a new interaction with a contact
 *     parameters:
 *       - in: path
 *         name: contactId
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
 *             $ref: '#/components/schemas/CreateInteractionInput'
 *           example:
 *             type: "COFFEE"
 *             subject: "Networking catch-up"
 *             notes: "Discussed career plans and shared industry insights"
 *             date: "2025-12-20T10:00:00.000Z"
 *             duration: 45
 *             location: "Blue Bottle Coffee"
 *     responses:
 *       201:
 *         description: Interaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Interaction'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.post('/contacts/:contactId/interactions', interactionController.createInteraction);

/**
 * @swagger
 * /api/interactions/{id}:
 *   get:
 *     summary: Get interaction by ID
 *     tags: [Interactions]
 *     description: Retrieve a single interaction with contact info
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Interaction ID
 *     responses:
 *       200:
 *         description: Interaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Interaction'
 *       404:
 *         description: Interaction not found
 *       500:
 *         description: Server error
 */
router.get('/interactions/:id', interactionController.getInteractionById);

/**
 * @swagger
 * /api/interactions/{id}:
 *   put:
 *     summary: Update an interaction
 *     tags: [Interactions]
 *     description: Update an existing interaction (partial updates allowed)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Interaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInteractionInput'
 *           example:
 *             notes: "Updated notes with additional follow-up items"
 *             duration: 60
 *     responses:
 *       200:
 *         description: Interaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Interaction'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Interaction not found
 *       500:
 *         description: Server error
 */
router.put('/interactions/:id', interactionController.updateInteraction);

/**
 * @swagger
 * /api/interactions/{id}:
 *   delete:
 *     summary: Delete an interaction
 *     tags: [Interactions]
 *     description: Permanently delete an interaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Interaction ID
 *     responses:
 *       200:
 *         description: Interaction deleted successfully
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
 *         description: Interaction not found
 *       500:
 *         description: Server error
 */
router.delete('/interactions/:id', interactionController.deleteInteraction);

export default router;
