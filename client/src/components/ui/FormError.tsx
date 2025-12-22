interface FormErrorProps {
  /** Error message to display */
  message: string | null | undefined;
}

/**
 * Inline form error display component
 * Shows a styled error message box when message is provided
 * Renders nothing when message is null/undefined/empty
 */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800 text-sm">{message}</p>
    </div>
  );
}
