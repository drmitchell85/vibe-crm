import { Router } from 'express';
import { statsController } from '../controllers/statsController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalContacts:
 *           type: integer
 *           description: Total number of contacts
 *           example: 150
 *         contactsThisMonth:
 *           type: integer
 *           description: Contacts created this month
 *           example: 12
 *         contactsLastMonth:
 *           type: integer
 *           description: Contacts created last month
 *           example: 8
 *         totalInteractions:
 *           type: integer
 *           description: Total number of interactions
 *           example: 450
 *         interactionsThisWeek:
 *           type: integer
 *           description: Interactions logged this week
 *           example: 15
 *         interactionsThisMonth:
 *           type: integer
 *           description: Interactions logged this month
 *           example: 45
 *         pendingReminders:
 *           type: integer
 *           description: Total incomplete reminders
 *           example: 8
 *         overdueReminders:
 *           type: integer
 *           description: Overdue incomplete reminders
 *           example: 2
 *
 *     ContactGrowth:
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *           description: Month in YYYY-MM format
 *           example: "2024-12"
 *         count:
 *           type: integer
 *           description: Contacts added this month
 *           example: 5
 *         cumulative:
 *           type: integer
 *           description: Total contacts at end of month
 *           example: 150
 *
 *     InteractionBreakdown:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [CALL, MEETING, EMAIL, TEXT, COFFEE, LUNCH, EVENT, OTHER]
 *           description: Interaction type
 *           example: "MEETING"
 *         count:
 *           type: integer
 *           description: Number of interactions of this type
 *           example: 25
 *         label:
 *           type: string
 *           description: Display label for the type
 *           example: "Meetings"
 *
 *     RecentActivity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Activity item ID
 *         type:
 *           type: string
 *           enum: [interaction, note, reminder]
 *           description: Type of activity
 *           example: "interaction"
 *         title:
 *           type: string
 *           description: Activity title
 *           example: "Meeting logged"
 *         description:
 *           type: string
 *           description: Activity description or preview
 *           example: "Quarterly review meeting"
 *         contactId:
 *           type: string
 *           format: uuid
 *           description: Related contact ID
 *         contactName:
 *           type: string
 *           description: Related contact full name
 *           example: "John Doe"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the activity occurred
 */

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Dashboard statistics and analytics endpoints
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Stats]
 *     description: Retrieve main dashboard statistics including contact counts, interaction counts, and reminder status
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       500:
 *         description: Server error
 */
router.get('/', statsController.getDashboardStats);

/**
 * @swagger
 * /api/stats/growth:
 *   get:
 *     summary: Get contact growth over time
 *     tags: [Stats]
 *     description: Retrieve contact growth data for the last 12 months, showing monthly additions and cumulative totals
 *     responses:
 *       200:
 *         description: Contact growth data retrieved successfully
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
 *                     $ref: '#/components/schemas/ContactGrowth'
 *       500:
 *         description: Server error
 */
router.get('/growth', statsController.getContactGrowth);

/**
 * @swagger
 * /api/stats/interactions:
 *   get:
 *     summary: Get interaction breakdown by type
 *     tags: [Stats]
 *     description: Retrieve a breakdown of all interactions grouped by type
 *     responses:
 *       200:
 *         description: Interaction breakdown retrieved successfully
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
 *                     $ref: '#/components/schemas/InteractionBreakdown'
 *       500:
 *         description: Server error
 */
router.get('/interactions', statsController.getInteractionBreakdown);

/**
 * @swagger
 * /api/stats/activity:
 *   get:
 *     summary: Get recent activity feed
 *     tags: [Stats]
 *     description: Retrieve a feed of recent activities (interactions, notes, reminders) across all contacts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Maximum number of activity items to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
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
 *                     $ref: '#/components/schemas/RecentActivity'
 *       500:
 *         description: Server error
 */
router.get('/activity', statsController.getRecentActivity);

export default router;
