import { z } from 'zod';

// Hex color regex pattern (e.g., #FF5733 or #fff)
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Default color for tags (neutral gray)
export const DEFAULT_TAG_COLOR = '#6B7280';

// Base tag schema with all fields
export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be 50 characters or less'),
  color: z
    .string()
    .regex(hexColorRegex, 'Color must be a valid hex color (e.g., #FF5733)')
    .optional(),
});

// Schema for creating a new tag
export const createTagSchema = tagSchema;

// Schema for updating a tag (all fields optional since partial updates allowed)
export const updateTagSchema = tagSchema.partial();

// TypeScript types inferred from schemas
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
