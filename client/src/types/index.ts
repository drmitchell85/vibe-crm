export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  socialMedia?: Record<string, string>; // { "twitter": "@user", "linkedin": "user", etc. }
  company?: string;
  jobTitle?: string;
  address?: string;
  birthday?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  socialMedia?: Record<string, string>;
  company?: string;
  jobTitle?: string;
  address?: string;
  birthday?: string;
}

export interface UpdateContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  socialMedia?: Record<string, string>;
  company?: string;
  jobTitle?: string;
  address?: string;
  birthday?: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  type: InteractionType;
  subject?: string;
  notes?: string;
  date: string;
  duration?: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export enum InteractionType {
  CALL = 'CALL',
  MEETING = 'MEETING',
  EMAIL = 'EMAIL',
  TEXT = 'TEXT',
  COFFEE = 'COFFEE',
  LUNCH = 'LUNCH',
  EVENT = 'EVENT',
  OTHER = 'OTHER',
}

export interface CreateInteractionInput {
  type: InteractionType;
  subject?: string;
  notes?: string;
  date?: string;
  duration?: number;
  location?: string;
}

export interface UpdateInteractionInput {
  type?: InteractionType;
  subject?: string;
  notes?: string;
  date?: string;
  duration?: number;
  location?: string;
}

export interface InteractionFilters {
  type?: InteractionType;
  startDate?: string;
  endDate?: string;
}

export interface Reminder {
  id: string;
  contactId: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderWithContact extends Reminder {
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  dueDate: string;
}

export interface UpdateReminderInput {
  title?: string;
  description?: string;
  dueDate?: string;
}

export interface ReminderFilters {
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Note {
  id: string;
  contactId: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}
