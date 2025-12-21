import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component with header and navigation
 */
export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/contacts', label: 'Contacts' },
    { path: '/reminders', label: 'Reminders' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
