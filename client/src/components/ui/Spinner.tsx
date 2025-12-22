/**
 * Reusable spinner component with size and color variants
 */

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
type SpinnerColor = 'blue' | 'white' | 'gray' | 'red' | 'green';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border-2',
  sm: 'w-5 h-5 border-2',
  md: 'w-6 h-6 border-4',
  lg: 'w-8 h-8 border-4',
};

const colorClasses: Record<SpinnerColor, string> = {
  blue: 'border-blue-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent',
  red: 'border-red-600 border-t-transparent',
  green: 'border-green-600 border-t-transparent',
};

export function Spinner({ size = 'md', color = 'blue', className = '' }: SpinnerProps) {
  return (
    <div
      className={`inline-block rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
