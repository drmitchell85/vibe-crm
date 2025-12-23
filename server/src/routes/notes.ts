import { Router } from 'express';
import { noteController } from '../controllers/noteController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       required:
 *         - contactId
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated note ID
 *         contactId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated contact
 *         content:
 *           type: string
 *           description: The note content/text
 *           example: "Met at the tech conference. Very knowledgeable about AI."
 *         isPinned:
 *           type: boolean
 *           description: Whether the note is pinned to the top
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         contact:
 *           type: object
 *           description: Associated contact (included in getNoteById)
 *           properties:
 *             id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *
 *     CreateNoteInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           description: The note content
 *           example: "Follow up about the project proposal"
 *         isPinned:
 *           type: boolean
 *           description: Whether to pin the note (defaults to false)
 *           example: false
 *
 *     UpdateNoteInput:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           description: Updated note content
 *         isPinned:
 *           type: boolean
 *           description: Updated pin status
 */

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note management endpoints for contacts
 */

/**
 * @swagger
 * /api/contacts/{contactId}/notes:
 *   get:
 *     summary: Get all notes for a contact
 *     tags: [Notes]
 *     description: Retrieve all notes for a specific contact, ordered by pinned status (pinned first) then by creation date (newest first)
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: List of notes retrieved successfully
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
 *                     $ref: '#/components/schemas/Note'
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get('/contacts/:contactId/notes', noteController.getNotesForContact);

/**
 * @swagger
 * /api/contacts/{contactId}/notes:
 *   post:
 *     summary: Create a new note for a contact
 *     tags: [Notes]
 *     description: Add a new note to a contact
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
 *             $ref: '#/components/schemas/CreateNoteInput'
 *           examples:
 *             simpleNote:
 *               summary: Simple note
 *               value:
 *                 content: "Prefers morning meetings"
 *             pinnedNote:
 *               summary: Pinned note
 *               value:
 *                 content: "VIP contact - always prioritize"
 *                 isPinned: true
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Validation error (missing or empty content)
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.post('/contacts/:contactId/notes', noteController.createNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     description: Retrieve a single note with contact information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.get('/notes/:id', noteController.getNoteById);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     description: Update an existing note (partial updates allowed)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNoteInput'
 *           examples:
 *             updateContent:
 *               summary: Update content only
 *               value:
 *                 content: "Updated note with more details"
 *             updatePin:
 *               summary: Pin the note
 *               value:
 *                 isPinned: true
 *             updateBoth:
 *               summary: Update both fields
 *               value:
 *                 content: "Important: Always CC the manager"
 *                 isPinned: true
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.put('/notes/:id', noteController.updateNote);

/**
 * @swagger
 * /api/notes/{id}/pin:
 *   patch:
 *     summary: Toggle pin status of a note
 *     tags: [Notes]
 *     description: Toggle whether a note is pinned. Pinned notes appear at the top of the list.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Pin status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.patch('/notes/:id/pin', noteController.togglePin);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     description: Permanently delete a note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
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
 *                       example: "Note deleted successfully"
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
router.delete('/notes/:id', noteController.deleteNote);

export default router;
