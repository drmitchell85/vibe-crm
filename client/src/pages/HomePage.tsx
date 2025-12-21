import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { UpcomingRemindersWidget } from '../components/UpcomingRemindersWidget';

/**
 * Home page - Dashboard with widgets and quick actions
 */
export function HomePage() {
  // Fetch contacts count
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.getAllContacts(),
  });

  // Health check
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.healthCheck(),
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to FPH CRM
        </h2>
        <p className="text-gray-600 text-lg">
          Your personal contact relationship manager
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* API Health Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            API Status
          </h3>
          {health ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">{health.message}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-gray-500">Checking...</span>
            </div>
          )}
        </div>

        {/* Contacts Count */}
        <Link to="/contacts" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Total Contacts
          </h3>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-600">Error loading contacts</p>
          ) : (
            <p className="text-3xl font-bold text-blue-600">
              {contacts?.length || 0}
            </p>
          )}
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Upcoming Reminders Widget */}
        <UpcomingRemindersWidget />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <Link
              to="/contacts"
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span className="text-xl">👥</span>
              <div>
                <p className="font-medium text-gray-900">View Contacts</p>
                <p className="text-sm text-gray-500">Browse and search your contacts</p>
              </div>
            </Link>
            <Link
              to="/reminders"
              className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <span className="text-xl">🔔</span>
              <div>
                <p className="font-medium text-gray-900">Manage Reminders</p>
                <p className="text-sm text-gray-500">View and create follow-up reminders</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed">
              <span className="text-xl">📝</span>
              <div>
                <p className="font-medium">Notes</p>
                <p className="text-sm">Coming in Phase 4</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (only shown on error) */}
      {error && (
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-900 font-semibold mb-2">Connection Error:</h4>
          <pre className="text-sm text-red-700 overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
