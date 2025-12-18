export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  twitterUsername?: string;
  company?: string;
  jobTitle?: string;
  address?: string;
  birthday?: string;
  createdAt: string;
  updatedAt: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
