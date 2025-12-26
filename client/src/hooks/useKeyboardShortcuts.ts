import { useEffect, useRef, useCallback } from 'react';

// ============================================
// Types
// ============================================

export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Keys that trigger the shortcut (e.g., ['g', 'c'] for sequence, ['?'] for single) */
  keys: string[];
  /** Human-readable description */
  description: string;
  /** Category for grouping in help modal */
  category: 'navigation' | 'actions' | 'modal';
  /** Callback when shortcut is triggered */
  handler: () => void;
  /** Whether this requires modifier key (Cmd/Ctrl) */
  withModifier?: boolean;
}

interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled (defaults to true) */
  enabled?: boolean;
  /** Time window for key sequences in ms (defaults to 1000) */
  sequenceTimeout?: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if an element is an input that should block shortcuts
 */
function isInputElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;

  const tagName = element.tagName.toLowerCase();

  // Block shortcuts in form inputs
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }

  // Block if element is contenteditable
  if (element.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * Check if a modal or dialog is currently open
 */
function isModalOpen(): boolean {
  // Check for our modal class or common modal patterns
  const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0.z-50');
  return modals.length > 0;
}

// ============================================
// Hook
// ============================================

/**
 * Custom hook for handling keyboard shortcuts with support for key sequences
 *
 * Features:
 * - Single key shortcuts (e.g., 'n' for new contact)
 * - Key sequences (e.g., 'g' then 'c' for go to contacts)
 * - Modifier key support (Cmd/Ctrl + key)
 * - Automatic disabling when typing in inputs
 * - Configurable sequence timeout
 *
 * @example
 * useKeyboardShortcuts([
 *   { id: 'goto-contacts', keys: ['g', 'c'], handler: () => navigate('/contacts'), ... },
 *   { id: 'new-contact', keys: ['n'], handler: () => openNewContact(), ... },
 *   { id: 'save', keys: ['s'], handler: () => save(), withModifier: true, ... },
 * ]);
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, sequenceTimeout = 1000 } = options;

  // Track the current key sequence
  const sequenceRef = useRef<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the sequence
  const clearSequence = useCallback(() => {
    sequenceRef.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle keydown events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if disabled
      if (!enabled) return;

      // Skip if typing in an input
      if (isInputElement(event.target)) return;

      // Get the key pressed (lowercase for consistency)
      const key = event.key.toLowerCase();

      // Handle modifier key shortcuts separately
      const hasModifier = event.metaKey || event.ctrlKey;

      // Find matching shortcuts with modifiers
      if (hasModifier) {
        const modifierShortcut = shortcuts.find(
          (s) => s.withModifier && s.keys.length === 1 && s.keys[0].toLowerCase() === key
        );

        if (modifierShortcut) {
          event.preventDefault();
          modifierShortcut.handler();
          return;
        }
      }

      // Skip modifier-only keypresses
      if (['control', 'meta', 'alt', 'shift'].includes(key)) return;

      // Skip if a modifier is held (for non-modifier shortcuts)
      if (hasModifier || event.altKey) return;

      // Add key to sequence
      sequenceRef.current.push(key);

      // Reset timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(clearSequence, sequenceTimeout);

      // Check for matching shortcuts
      const currentSequence = sequenceRef.current;

      for (const shortcut of shortcuts) {
        // Skip modifier shortcuts in this path
        if (shortcut.withModifier) continue;

        const keys = shortcut.keys.map((k) => k.toLowerCase());

        // Check if current sequence matches this shortcut
        if (
          keys.length === currentSequence.length &&
          keys.every((k, i) => k === currentSequence[i])
        ) {
          event.preventDefault();
          clearSequence();
          shortcut.handler();
          return;
        }

        // Check if current sequence is a partial match (still building up)
        if (
          keys.length > currentSequence.length &&
          keys.slice(0, currentSequence.length).every((k, i) => k === currentSequence[i])
        ) {
          // It's a partial match, wait for more keys
          event.preventDefault();
          return;
        }
      }

      // No match found - if sequence is longer than any shortcut, reset
      const maxLength = Math.max(...shortcuts.filter((s) => !s.withModifier).map((s) => s.keys.length));
      if (currentSequence.length >= maxLength) {
        clearSequence();
      }
    },
    [shortcuts, enabled, sequenceTimeout, clearSequence]
  );

  // Set up event listener
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearSequence();
    };
  }, [enabled, handleKeyDown, clearSequence]);

  // Return the clearSequence function in case caller needs it
  return { clearSequence };
}

// ============================================
// Utility: Check if shortcuts should be disabled
// ============================================

export function useShortcutsEnabled(): boolean {
  // This could be expanded to check for other conditions
  return !isModalOpen();
}
