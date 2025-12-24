import { useState } from 'react';
import { Spinner } from './ui';
import {
  inputStyles,
  labelStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
  dangerButtonStyles,
} from '../lib/formStyles';
import type { Tag, CreateTagInput, UpdateTagInput } from '../types';

// Predefined color palette for tags
const TAG_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#84CC16', // lime
  '#22C55E', // green
  '#10B981', // emerald
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#0EA5E9', // sky
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#D946EF', // fuchsia
  '#EC4899', // pink
  '#6B7280', // gray (default)
];

interface TagFormProps {
  tag?: Tag;
  onSubmit: (data: CreateTagInput | UpdateTagInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

/**
 * Form for creating or editing a tag
 *
 * Features:
 * - Name input with validation
 * - Color picker with predefined palette
 * - Preview of the tag appearance
 * - Delete option for existing tags
 */
export function TagForm({
  tag,
  onSubmit,
  onCancel,
  onDelete,
  isLoading = false,
  isDeleting = false,
}: TagFormProps) {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || '#6B7280');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!tag;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }

    if (name.length > 50) {
      setError('Tag name must be 50 characters or less');
      return;
    }

    try {
      await onSubmit({ name: name.trim(), color });
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to save tag');
    }
  };

  // Calculate contrasting text color for preview
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Tag name */}
      <div>
        <label htmlFor="tagName" className={labelStyles}>
          Tag Name *
        </label>
        <input
          type="text"
          id="tagName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputStyles}
          placeholder="e.g., Work, Family, VIP"
          maxLength={50}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">{name.length}/50 characters</p>
      </div>

      {/* Color picker */}
      <div>
        <label className={labelStyles}>Tag Color</label>
        <div className="grid grid-cols-8 gap-2 mt-2">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c
                  ? 'border-gray-900 scale-110 shadow-md'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
              disabled={isLoading}
            />
          ))}
        </div>
        {/* Custom color input */}
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor="customColor" className="text-sm text-gray-600">
            Or custom:
          </label>
          <input
            type="color"
            id="customColor"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
            disabled={isLoading}
          />
          <span className="text-xs text-gray-500 font-mono">{color}</span>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className={labelStyles}>Preview</label>
        <div className="mt-2">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: color, color: getContrastColor(color) }}
          >
            {name || 'Tag Name'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <div>
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isLoading || isDeleting}
              className={dangerButtonStyles}
            >
              {isDeleting ? (
                <>
                  <Spinner size="xs" color="white" />
                  Deleting...
                </>
              ) : (
                'Delete Tag'
              )}
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading || isDeleting}
            className={secondaryButtonStyles}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isDeleting || !name.trim()}
            className={`${primaryButtonStyles} disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Spinner size="xs" color="white" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Create Tag'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
