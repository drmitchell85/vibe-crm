import { ReactNode } from 'react';

interface EmptyStateProps {
  /** Emoji or icon to display */
  icon: string;
  /** Main heading */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button or link */
  action?: ReactNode;
  /** Size variant: 'sm' for widgets, 'md' for sections, 'lg' for full pages */
  size?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'py-6',
  md: 'py-8',
  lg: 'py-12',
};

const iconSizes = {
  sm: 'text-3xl',
  md: 'text-4xl',
  lg: 'text-6xl',
};

const titleSizes = {
  sm: 'text-base',
  md: 'text-base',
  lg: 'text-xl',
};

/**
 * Reusable empty state component with icon, title, description, and optional action
 */
export function EmptyState({ icon, title, description, action, size = 'md' }: EmptyStateProps) {
  return (
    <div className={`text-center ${paddingClasses[size]}`}>
      <div className={`${iconSizes[size]} mb-3`}>{icon}</div>
      <h3 className={`text-gray-900 font-medium mb-1 ${titleSizes[size]}`}>{title}</h3>
      <p className="text-gray-500 text-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
