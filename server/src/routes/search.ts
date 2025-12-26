import { Router } from 'express';
import { searchController } from '../controllers/searchController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Entity ID
 *         entityType:
 *           type: string
 *           enum: [contact, note, interaction, reminder]
 *           description: Type of entity found
 *         title:
 *           type: string
 *           description: Display title for the result
 *         preview:
 *           type: string
 *           description: Text preview/snippet of the content
 *         relevanceScore:
 *           type: number
 *           description: Relevance score (higher is more relevant)
 *         contactId:
 *           type: string
 *           format: uuid
 *           description: Associated contact ID (for non-contact entities)
 *         contactName:
 *           type: string
 *           description: Associated contact name (for non-contact entities)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Entity creation timestamp
 *
 *     GlobalSearchResponse:
 *       type: object
 *       properties:
 *         query:
 *           type: string
 *           description: The search query that was executed
 *         totalResults:
 *           type: number
 *           description: Total number of results found
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SearchResult'
 */

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Global search across all entities
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Global search
 *     tags: [Search]
 *     description: |
 *       Search across contacts, notes, interactions, and reminders.
 *       Results are sorted by relevance score (higher = more relevant).
 *
 *       **Searched fields by entity type:**
 *       - **Contacts**: firstName, lastName, email, company, jobTitle
 *       - **Notes**: content
 *       - **Interactions**: subject, notes, location
 *       - **Reminders**: title, description
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *         example: "john"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum results per entity type
 *         example: 10
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GlobalSearchResponse'
 *             example:
 *               success: true
 *               data:
 *                 query: "john"
 *                 totalResults: 3
 *                 results:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     entityType: "contact"
 *                     title: "John Doe"
 *                     preview: "Acme Corp • Software Engineer • john.doe@example.com"
 *                     relevanceScore: 80
 *                     createdAt: "2025-12-20T10:00:00.000Z"
 *                   - id: "550e8400-e29b-41d4-a716-446655440001"
 *                     entityType: "note"
 *                     title: "Note for John Doe"
 *                     preview: "Discussed project timeline with John..."
 *                     relevanceScore: 30
 *                     contactId: "550e8400-e29b-41d4-a716-446655440000"
 *                     contactName: "John Doe"
 *                     createdAt: "2025-12-21T14:30:00.000Z"
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Search query must be at least 2 characters"
 *                     code:
 *                       type: string
 *                       example: "INVALID_QUERY"
 *       500:
 *         description: Server error
 */
router.get('/', searchController.globalSearch);

export default router;
