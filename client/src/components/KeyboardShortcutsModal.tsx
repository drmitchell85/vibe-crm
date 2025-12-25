import { useEffect } from 'react';
import { useKeyboardShortcutsContext } from '../contexts/KeyboardShortcutsContext';
import type { KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

// ============================================
// Helper Functions
// ============================================

/**
 * Format keys for display (e.g., ['g', 'c'] -> 'g then c')
 */
function formatKeys(keys: string[], withModifier?: boolean): React.ReactNode {
  if (withModifier) {
    return (
      <>
        <kbd className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
          <span className="text-xs">⌘</span>
        </kbd>
        <span className="mx-1 text-gray-400">+</span>
        <kbd className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm uppercase">
          {keys[0]}
        </kbd>
      </>
    );
  }

  if (keys.length === 1) {
    return (
      <kbd className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
        {keys[0] === '?' ? '?' : keys[0]}
      </kbd>
    );
  }

  return (
    <>
      {keys.map((key, index) => (
        <span key={key}>
          <kbd className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="mx-1 text-gray-400 text-xs">then</span>
          )}
        </span>
      ))}
    </>
  );
}

/**
 * Group shortcuts by category
 */
function groupByCategory(shortcuts: KeyboardShortcut[]): Record<string, KeyboardShortcut[]> {
  return shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);
}

// Category display configuration
const categoryConfig: Record<string, { title: string; icon: string }> = {
  navigation: { title: 'Navigation', icon: '🧭' },
  actions: { title: 'Actions', icon: '⚡' },
  modal: { title: 'Modal', icon: '📦' },
};

// Additional shortcuts to display (not from context)
const additionalShortcuts: KeyboardShortcut[] = [
  {
    id: 'search',
    keys: ['k'],
    description: 'Open Search',
    category: 'actions',
    withModifier: true,
    handler: () => {},
  },
  {
    id: 'escape',
    keys: ['Esc'],
    description: 'Close Modal / Cancel',
    category: 'modal',
    handler: () => {},
  },
  {
    id: 'submit',
    keys: ['Enter'],
    description: 'Submit Form',
    category: 'modal',
    withModifier: true,
    handler: () => {},
  },
];

// ============================================
// Component
// ============================================

export function KeyboardShortcutsModal() {
  const { isHelpOpen, closeHelp, shortcuts } = useKeyboardShortcutsContext();

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHelpOpen) {
        closeHelp();
      }
    };

    if (isHelpOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isHelpOpen, closeHelp]);

  if (!isHelpOpen) return null;

  // Combine context shortcuts with additional ones
  const allShortcuts = [...shortcuts, ...additionalShortcuts];
  const grouped = groupByCategory(allShortcuts);

  // Define order of categories
  const categoryOrder = ['navigation', 'actions', 'modal'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
        onClick={closeHelp}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⌨️</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={closeHelp}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
            {categoryOrder.map((category) => {
              const categoryShortcuts = grouped[category];
              if (!categoryShortcuts || categoryShortcuts.length === 0) return null;

              const config = categoryConfig[category];

              return (
                <div key={category}>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    <span>{config.icon}</span>
                    {config.title}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center">
                          {formatKeys(shortcut.keys, shortcut.withModifier)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Press <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">?</kbd> anytime to toggle this help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
