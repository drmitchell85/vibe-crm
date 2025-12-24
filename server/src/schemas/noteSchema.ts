import { z } from 'zod';

// Base note schema with all fields
export const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isPinned: z.boolean().optional(),
});

// Schema for creating a new note (content required, isPinned optional)
// Note: contactId is passed via URL parameter, not request body
export const createNoteSchema = noteSchema;

// Schema for updating a note (all fields optional for partial updates)
export const updateNoteSchema = noteSchema.partial();

// TypeScript types inferred from schemas - use z.input for input types to preserve optionality
export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type UpdateNoteInput = z.input<typeof updateNoteSchema>;
