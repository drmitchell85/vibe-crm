import { z } from 'zod';

// Base contact schema with all fields
export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  socialMedia: z.record(z.string(), z.string()).optional(), // { "twitter": "@user", "linkedin": "user", etc. }
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  birthday: z.string().datetime().optional().or(z.literal('')),
});

// Schema for creating a new contact (all required fields must be present)
export const createContactSchema = contactSchema;

// Schema for updating a contact (all fields optional since partial updates allowed)
export const updateContactSchema = contactSchema.partial();

// TypeScript types inferred from schemas
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
