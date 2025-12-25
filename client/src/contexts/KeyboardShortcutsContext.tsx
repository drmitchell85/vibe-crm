import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKeyboardShortcuts, KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

// ============================================
// Types
// ============================================

interface KeyboardShortcutsContextType {
  /** Whether the help modal is open */
  isHelpOpen: boolean;
  /** Open the help modal */
  openHelp: () => void;
  /** Close the help modal */
  closeHelp: () => void;
  /** Toggle the help modal */
  toggleHelp: () => void;
  /** All registered shortcuts for display in help modal */
  shortcuts: KeyboardShortcut[];
}

// ============================================
// Context
// ============================================

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

// ============================================
// Provider
// ============================================

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Help modal handlers
  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);
  const toggleHelp = useCallback(() => setIsHelpOpen((prev) => !prev), []);

  // New contact handler - navigates to contacts with ?new=true param
  const triggerNewContact = useCallback(() => {
    if (location.pathname === '/contacts') {
      // Already on contacts page, add param to trigger modal
      navigate('/contacts?new=true', { replace: true });
    } else {
      // Navigate to contacts page with param
      navigate('/contacts?new=true');
    }
  }, [navigate, location.pathname]);

  // Define all keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts (g + key sequences)
    {
      id: 'goto-home',
      keys: ['g', 'h'],
      description: 'Go to Home',
      category: 'navigation',
      handler: () => navigate('/'),
    },
    {
      id: 'goto-contacts',
      keys: ['g', 'c'],
      description: 'Go to Contacts',
      category: 'navigation',
      handler: () => navigate('/contacts'),
    },
    {
      id: 'goto-reminders',
      keys: ['g', 'r'],
      description: 'Go to Reminders',
      category: 'navigation',
      handler: () => navigate('/reminders'),
    },
    {
      id: 'goto-tags',
      keys: ['g', 't'],
      description: 'Go to Tags',
      category: 'navigation',
      handler: () => navigate('/tags'),
    },
    // Action shortcuts
    {
      id: 'new-contact',
      keys: ['n'],
      description: 'New Contact',
      category: 'actions',
      handler: triggerNewContact,
    },
    {
      id: 'help',
      keys: ['?'],
      description: 'Show Keyboard Shortcuts',
      category: 'actions',
      handler: toggleHelp,
    },
  ];

  // Register the keyboard shortcuts
  useKeyboardShortcuts(shortcuts, {
    enabled: !isHelpOpen, // Disable when help modal is open
  });

  const value: KeyboardShortcutsContextType = {
    isHelpOpen,
    openHelp,
    closeHelp,
    toggleHelp,
    shortcuts,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);

  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider');
  }

  return context;
}
