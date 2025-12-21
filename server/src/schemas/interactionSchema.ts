import { z } from 'zod';

// Interaction type enum matching Prisma schema
export const InteractionTypeEnum = z.enum([
  'CALL',
  'MEETING',
  'EMAIL',
  'TEXT',
  'COFFEE',
  'LUNCH',
  'EVENT',
  'OTHER',
]);

// Base interaction schema with all fields
export const interactionSchema = z.object({
  contactId: z.string().uuid('Invalid contact ID format'),
  type: InteractionTypeEnum,
  subject: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().datetime().optional(), // Defaults to now() in service
  duration: z.number().int().positive('Duration must be a positive number').optional(),
  location: z.string().optional(),
});

// Schema for creating a new interaction
export const createInteractionSchema = interactionSchema;

// Schema for updating an interaction (all fields optional, contactId not changeable)
export const updateInteractionSchema = interactionSchema.omit({ contactId: true }).partial();

// TypeScript types inferred from schemas
export type InteractionType = z.infer<typeof InteractionTypeEnum>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>;
