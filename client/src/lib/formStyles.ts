/**
 * Shared form styling utilities
 *
 * Centralizes Tailwind class strings for consistent form styling across the app.
 * Import these constants instead of duplicating class strings in each form.
 */

/**
 * Base input styles - used for text, email, tel, number, date, datetime-local inputs
 */
export const inputStyles =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500';

/**
 * Select dropdown styles - includes bg-white for consistent appearance
 */
export const selectStyles =
  `${inputStyles}`;

/**
 * Textarea styles - includes resize-none to prevent manual resizing
 */
export const textareaStyles =
  `${inputStyles} resize-none`;

/**
 * Label styles for form fields
 */
export const labelStyles =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

/**
 * Primary button styles (blue, for submit actions)
 */
export const primaryButtonStyles =
  'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2';

/**
 * Secondary button styles (outlined, for cancel actions)
 */
export const secondaryButtonStyles =
  'px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50';

/**
 * Danger button styles (red, for delete actions)
 */
export const dangerButtonStyles =
  'px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors font-medium disabled:opacity-50';
