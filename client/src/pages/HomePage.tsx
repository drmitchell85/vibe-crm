import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../lib/api';
import { Modal } from '../components/Modal';
import { ContactForm } from '../components/ContactForm';
import { ReminderForm } from '../components/ReminderForm';
import { LoadingState } from '../components/ui';
import type {
  ContactGrowthData,
  InteractionBreakdown,
  RecentActivityItem,
  CreateContactInput,
  CreateReminderInput,
} from '../types';

// Chart colors for interaction types
const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

/**
 * Home page - Dashboard with statistics, charts, activity feed, and quick actions
 */
export function HomePage() {
  const [isCreateContactModalOpen, setIsCreateContactModalOpen] = useState(false);
  const [isCreateReminderModalOpen, setIsCreateReminderModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch contact growth data
  const { data: growthData, isLoading: growthLoading } = useQuery({
    queryKey: ['contact-growth'],
    queryFn: () => api.getContactGrowth(),
    staleTime: 60000, // Cache for 1 minute
  });

  // Fetch interaction breakdown
  const { data: interactionData, isLoading: interactionLoading } = useQuery({
    queryKey: ['interaction-breakdown'],
    queryFn: () => api.getInteractionBreakdown(),
    staleTime: 60000,
  });

  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => api.getRecentActivity(8),
    staleTime: 30000,
  });

  // Fetch contacts list for reminder form
  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.getAllContacts(),
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: (data: CreateContactInput) => api.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['contact-growth'] });
      setIsCreateContactModalOpen(false);
    },
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: (data: CreateReminderInput) => api.createReminder(selectedContactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      setIsCreateReminderModalOpen(false);
      setSelectedContactId('');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Your CRM at a glance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateContactModalOpen(true)}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
          >
            <span>👤</span> Add Contact
          </button>
          <button
            onClick={() => setIsCreateReminderModalOpen(true)}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center gap-2"
          >
            <span>🔔</span> Add Reminder
          </button>
        </div>
      </div>

      {/* Create Contact Modal */}
      <Modal
        isOpen={isCreateContactModalOpen}
        onClose={() => setIsCreateContactModalOpen(false)}
        title="Create New Contact"
        size="xl"
      >
        <ContactForm
          onSubmit={async (data) => {
            await createContactMutation.mutateAsync(data as CreateContactInput);
          }}
          onCancel={() => setIsCreateContactModalOpen(false)}
          isLoading={createContactMutation.isPending}
        />
      </Modal>

      {/* Create Reminder Modal */}
      <Modal
        isOpen={isCreateReminderModalOpen}
        onClose={() => {
          setIsCreateReminderModalOpen(false);
          setSelectedContactId('');
        }}
        title="Create New Reminder"
        size="lg"
      >
        <div className="space-y-6">
          {/* Contact Selector */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact <span className="text-red-500">*</span>
            </label>
            <select
              id="contact"
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a contact...</option>
              {contacts?.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                  {contact.company && ` (${contact.company})`}
                </option>
              ))}
            </select>
          </div>

          {/* Show form only when contact is selected */}
          {selectedContactId ? (
            <ReminderForm
              onSubmit={async (data) => {
                await createReminderMutation.mutateAsync(data as CreateReminderInput);
              }}
              onCancel={() => {
                setIsCreateReminderModalOpen(false);
                setSelectedContactId('');
              }}
              isLoading={createReminderMutation.isPending}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Please select a contact to create a reminder.
            </p>
          )}
        </div>
      </Modal>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contacts"
          value={stats?.totalContacts}
          subtitle={stats ? `+${stats.contactsThisMonth} this month` : undefined}
          icon="👥"
          color="blue"
          href="/contacts"
          loading={statsLoading}
        />
        <StatCard
          title="Interactions"
          value={stats?.totalInteractions}
          subtitle={stats ? `${stats.interactionsThisWeek} this week` : undefined}
          icon="💬"
          color="green"
          loading={statsLoading}
        />
        <StatCard
          title="Pending Reminders"
          value={stats?.pendingReminders}
          subtitle={stats?.overdueReminders ? `${stats.overdueReminders} overdue` : 'None overdue'}
          icon="🔔"
          color={stats?.overdueReminders ? 'red' : 'amber'}
          href="/reminders"
          loading={statsLoading}
        />
        <StatCard
          title="Tags"
          value={undefined}
          subtitle="Organize contacts"
          icon="🏷️"
          color="purple"
          href="/tags"
          loading={false}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Growth</h3>
          {growthLoading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingState message="Loading chart..." size="sm" />
            </div>
          ) : growthData && growthData.length > 0 ? (
            <ContactGrowthChart data={growthData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available yet
            </div>
          )}
        </div>

        {/* Interaction Breakdown Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interactions by Type</h3>
          {interactionLoading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingState message="Loading chart..." size="sm" />
            </div>
          ) : interactionData && interactionData.some(d => d.count > 0) ? (
            <InteractionBreakdownChart data={interactionData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No interactions logged yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="p-4">
          {activityLoading ? (
            <LoadingState message="Loading activity..." size="sm" />
          ) : activityData && activityData.length > 0 ? (
            <ActivityFeed activities={activityData} />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent activity. Start by adding a contact!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  title: string;
  value: number | undefined;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  href?: string;
  loading: boolean;
}

function StatCard({ title, value, subtitle, icon, color, href, loading }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  const content = (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {value !== undefined ? value : '—'}
            </p>
          )}
          {subtitle && (
            <p className={`text-sm mt-1 ${color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}

// ============================================
// Contact Growth Chart Component
// ============================================

function ContactGrowthChart({ data }: { data: ContactGrowthData[] }) {
  // Format month for display (e.g., "2024-12" -> "Dec")
  const formattedData = data.map(d => ({
    ...d,
    monthLabel: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis
          dataKey="monthLabel"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid var(--tooltip-border, #E5E7EB)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: 'var(--tooltip-text, #111827)',
          }}
          formatter={(value, name) => [
            value ?? 0,
            name === 'cumulative' ? 'Total Contacts' : 'New This Month',
          ]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="#3B82F6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCumulative)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Interaction Breakdown Chart Component
// ============================================

function InteractionBreakdownChart({ data }: { data: InteractionBreakdown[] }) {
  // Filter out zero counts for cleaner display
  const filteredData = data.filter(d => d.count > 0);

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={filteredData} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid var(--tooltip-border, #E5E7EB)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: 'var(--tooltip-text, #111827)',
          }}
          formatter={(value) => [value ?? 0, 'Count']}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {filteredData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Activity Feed Component
// ============================================

function ActivityFeed({ activities }: { activities: RecentActivityItem[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'interaction':
        return '💬';
      case 'note':
        return '📝';
      case 'reminder':
        return '🔔';
      default:
        return '📌';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'interaction':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
      case 'note':
        return 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400';
      case 'reminder':
        return 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}
          >
            <span className="text-sm">{getActivityIcon(activity.type)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
              <span className="text-xs text-gray-400">•</span>
              <Link
                to={`/contacts/${activity.contactId}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate"
              >
                {activity.contactName}
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{activity.description}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

