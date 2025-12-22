import { InteractionType } from '../types';

/**
 * Configuration for each interaction type
 * Includes display properties for both timeline badges and form dropdowns
 */
export interface InteractionTypeConfig {
  /** The enum value */
  type: InteractionType;
  /** Emoji icon */
  icon: string;
  /** Short label for badges (e.g., "Call") */
  label: string;
  /** Longer label for form dropdowns (e.g., "Phone Call") */
  formLabel: string;
  /** Tailwind background color class */
  bgColor: string;
  /** Tailwind text color class */
  textColor: string;
}

/**
 * Complete configuration for all interaction types
 * Single source of truth for interaction type display properties
 */
export const INTERACTION_TYPE_CONFIG: Record<InteractionType, InteractionTypeConfig> = {
  [InteractionType.CALL]: {
    type: InteractionType.CALL,
    icon: '📞',
    label: 'Call',
    formLabel: 'Phone Call',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  [InteractionType.MEETING]: {
    type: InteractionType.MEETING,
    icon: '🤝',
    label: 'Meeting',
    formLabel: 'Meeting',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  [InteractionType.EMAIL]: {
    type: InteractionType.EMAIL,
    icon: '✉️',
    label: 'Email',
    formLabel: 'Email',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  [InteractionType.TEXT]: {
    type: InteractionType.TEXT,
    icon: '💬',
    label: 'Text',
    formLabel: 'Text Message',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
  },
  [InteractionType.COFFEE]: {
    type: InteractionType.COFFEE,
    icon: '☕',
    label: 'Coffee',
    formLabel: 'Coffee',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  [InteractionType.LUNCH]: {
    type: InteractionType.LUNCH,
    icon: '🍽️',
    label: 'Lunch',
    formLabel: 'Lunch',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  [InteractionType.EVENT]: {
    type: InteractionType.EVENT,
    icon: '🎉',
    label: 'Event',
    formLabel: 'Event',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
  },
  [InteractionType.OTHER]: {
    type: InteractionType.OTHER,
    icon: '📝',
    label: 'Other',
    formLabel: 'Other',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
};

/**
 * Array of all interaction types for iteration (dropdowns, filters)
 * Derived from the config to ensure consistency
 */
export const INTERACTION_TYPES_LIST = Object.values(INTERACTION_TYPE_CONFIG);

/**
 * Get configuration for a specific interaction type
 * Convenience function with type safety
 */
export function getInteractionTypeConfig(type: InteractionType): InteractionTypeConfig {
  return INTERACTION_TYPE_CONFIG[type];
}
