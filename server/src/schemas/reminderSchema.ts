import { z } from 'zod';

// Base reminder schema with all fields
export const reminderSchema = z.object({
  contactId: z.string().uuid('Invalid contact ID format'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().datetime('Invalid date format'),
});

// Schema for creating a new reminder
export const createReminderSchema = reminderSchema;

// Schema for updating a reminder (all fields optional, contactId not changeable)
export const updateReminderSchema = reminderSchema.omit({ contactId: true }).partial();

// TypeScript types inferred from schemas
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
