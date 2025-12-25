interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Optional title for the error */
  title?: string;
  /** Size variant: 'sm' for inline, 'md' for sections */
  size?: 'sm' | 'md';
}

/**
 * Reusable error state component
 */
export function ErrorState({ message, title, size = 'sm' }: ErrorStateProps) {
  if (size === 'sm') {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <p className="text-red-700 dark:text-red-400 text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
      {title && <h3 className="text-red-900 dark:text-red-300 font-semibold mb-2">{title}</h3>}
      <p className="text-red-700 dark:text-red-400">{message}</p>
    </div>
  );
}
