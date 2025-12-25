import { ReactNode, useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component with header, navigation, and global search
 */
export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/contacts', label: 'Contacts' },
    { path: '/reminders', label: 'Reminders' },
    { path: '/tags', label: 'Tags' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Global keyboard shortcut: Cmd/Ctrl + K to open search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                FPH CRM
              </Link>
            </h1>

            <div className="flex items-center gap-6">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-gray-400 bg-white border border-gray-300 rounded">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              {/* Navigation */}
              <nav className="flex gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={
                      isActive(link.path)
                        ? 'text-sm font-medium text-blue-600'
                        : 'text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Command Palette (Global Search) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
