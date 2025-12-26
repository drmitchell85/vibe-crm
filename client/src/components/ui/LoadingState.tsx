import { Spinner } from './Spinner';

interface LoadingStateProps {
  message?: string;
  /** Padding size: 'sm' for widgets, 'md' for sections, 'lg' for full pages */
  size?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'py-6',
  md: 'py-8',
  lg: 'py-12',
};

const spinnerSizes = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
};

/**
 * Reusable loading state component with spinner and optional message
 */
export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  return (
    <div className={`text-center ${paddingClasses[size]}`}>
      <Spinner size={spinnerSizes[size]} />
      <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
}
