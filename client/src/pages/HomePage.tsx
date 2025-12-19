import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Home page - Dashboard with API connection test
 */
export function HomePage() {
  // Test API connection by fetching contacts count
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.getAllContacts(),
  });

  // Test health check
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.healthCheck(),
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to FPH CRM
        </h2>
        <p className="text-gray-600 text-lg">
          Your personal contact relationship manager
        </p>
      </div>

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
        <div className="bg-white rounded-lg shadow p-6">
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
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Add Contact
          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            View All Contacts
          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Search Contacts
          </button>
        </div>
      </div>

      {/* Debug Info (optional - remove later) */}
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
