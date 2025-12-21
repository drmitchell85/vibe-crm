import { Router } from 'express';
import { reminderController } from '../controllers/reminderController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Reminder:
 *       type: object
 *       required:
 *         - contactId
 *         - title
 *         - dueDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated reminder ID
 *         contactId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated contact
 *         title:
 *           type: string
 *           description: Reminder title
 *           example: "Follow up on project proposal"
 *         description:
 *           type: string
 *           description: Detailed description of the reminder
 *           example: "Send the revised proposal with updated timeline"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: When the reminder is due
 *           example: "2025-12-25T10:00:00.000Z"
 *         isCompleted:
 *           type: boolean
 *           description: Whether the reminder has been completed
 *           example: false
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the reminder was completed
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     ReminderWithContact:
 *       allOf:
 *         - $ref: '#/components/schemas/Reminder'
 *         - type: object
 *           properties:
 *             contact:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *
 *     CreateReminderInput:
 *       type: object
 *       required:
 *         - title
 *         - dueDate
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *
 *     UpdateReminderInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: Reminder management endpoints
 */

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: Get all reminders
 *     tags: [Reminders]
 *     description: Retrieve all reminders with optional filtering (for reminders page)
 *     parameters:
 *       - in: query
 *         name: isCompleted
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter reminders due on or after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter reminders due on or before this date
 *     responses:
 *       200:
 *         description: List of reminders retrieved successfully
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
 *                     $ref: '#/components/schemas/ReminderWithContact'
 *       500:
 *         description: Server error
 */
router.get('/reminders', reminderController.getAllReminders);

/**
 * @swagger
 * /api/reminders/upcoming:
 *   get:
 *     summary: Get upcoming reminders
 *     tags: [Reminders]
 *     description: Get incomplete reminders due in the future (for dashboard widget)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of reminders to return
 *     responses:
 *       200:
 *         description: List of upcoming reminders
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
 *                     $ref: '#/components/schemas/ReminderWithContact'
 *       500:
 *         description: Server error
 */
router.get('/reminders/upcoming', reminderController.getUpcomingReminders);

/**
 * @swagger
 * /api/reminders/overdue:
 *   get:
 *     summary: Get overdue reminders
 *     tags: [Reminders]
 *     description: Get incomplete reminders with due date in the past
 *     responses:
 *       200:
 *         description: List of overdue reminders
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
 *                     $ref: '#/components/schemas/ReminderWithContact'
 *       500:
 *         description: Server error
 */
router.get('/reminders/overdue', reminderController.getOverdueReminders);

/**
 * @swagger
 * /api/reminders/{id}:
 *   get:
 *     summary: Get reminder by ID
 *     tags: [Reminders]
 *     description: Retrieve a single reminder with contact info
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reminder ID
 *     responses:
 *       200:
 *         description: Reminder retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReminderWithContact'
 *       404:
 *         description: Reminder not found
 *       500:
 *         description: Server error
 */
router.get('/reminders/:id', reminderController.getReminderById);

/**
 * @swagger
 * /api/reminders/{id}:
 *   put:
 *     summary: Update a reminder
 *     tags: [Reminders]
 *     description: Update an existing reminder (partial updates allowed)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reminder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReminderInput'
 *           example:
 *             title: "Updated reminder title"
 *             dueDate: "2025-12-30T14:00:00.000Z"
 *     responses:
 *       200:
 *         description: Reminder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reminder'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Reminder not found
 *       500:
 *         description: Server error
 */
router.put('/reminders/:id', reminderController.updateReminder);

/**
 * @swagger
 * /api/reminders/{id}/complete:
 *   patch:
 *     summary: Toggle reminder completion
 *     tags: [Reminders]
 *     description: Mark a reminder as complete or incomplete
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reminder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isCompleted
 *             properties:
 *               isCompleted:
 *                 type: boolean
 *                 description: Set to true to mark complete, false to mark incomplete
 *           example:
 *             isCompleted: true
 *     responses:
 *       200:
 *         description: Reminder completion status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reminder'
 *       404:
 *         description: Reminder not found
 *       500:
 *         description: Server error
 */
router.patch('/reminders/:id/complete', reminderController.toggleComplete);

/**
 * @swagger
 * /api/reminders/{id}:
 *   delete:
 *     summary: Delete a reminder
 *     tags: [Reminders]
 *     description: Permanently delete a reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reminder ID
 *     responses:
 *       200:
 *         description: Reminder deleted successfully
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
 *         description: Reminder not found
 *       500:
 *         description: Server error
 */
router.delete('/reminders/:id', reminderController.deleteReminder);

/**
 * @swagger
 * /api/contacts/{contactId}/reminders:
 *   get:
 *     summary: Get all reminders for a contact
 *     tags: [Reminders]
 *     description: Retrieve all reminders for a specific contact with optional filtering
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Contact ID
 *       - in: query
 *         name: isCompleted
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter reminders due on or after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter reminders due on or before this date
 *     responses:
 *       200:
 *         description: List of reminders retrieved successfully
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
 *                     $ref: '#/components/schemas/Reminder'
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get('/contacts/:contactId/reminders', reminderController.getRemindersForContact);

/**
 * @swagger
 * /api/contacts/{contactId}/reminders:
 *   post:
 *     summary: Create a new reminder
 *     tags: [Reminders]
 *     description: Create a new reminder for a contact
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
 *             $ref: '#/components/schemas/CreateReminderInput'
 *           example:
 *             title: "Follow up on project proposal"
 *             description: "Send the revised proposal with updated timeline"
 *             dueDate: "2025-12-25T10:00:00.000Z"
 *     responses:
 *       201:
 *         description: Reminder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reminder'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.post('/contacts/:contactId/reminders', reminderController.createReminder);

export default router;
