import type { Tag } from '../types';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md';
  onRemove?: () => void;
  onClick?: () => void;
}

/**
 * Displays a colored tag badge/pill
 *
 * Features:
 * - Colored background based on tag color
 * - Optional remove button (X)
 * - Optional click handler for selection
 * - Automatic text color contrast (white/black based on background)
 */
export function TagBadge({ tag, size = 'md', onRemove, onClick }: TagBadgeProps) {
  // Calculate contrasting text color based on background luminance
  const getContrastColor = (hexColor: string): string => {
    // Default to gray if no valid color provided
    if (!hexColor || typeof hexColor !== 'string') {
      return '#ffffff';
    }
    const hex = hexColor.replace('#', '');
    // Validate hex format (must be 6 characters)
    if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return '#ffffff';
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Using relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Use default gray color if tag.color is missing
  const tagColor = tag.color || '#6B7280';
  const textColor = getContrastColor(tagColor);
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm';

  const baseClasses = `inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';

  return (
    <span
      className={`${baseClasses} ${interactiveClasses}`}
      style={{ backgroundColor: tagColor, color: textColor }}
      onClick={onClick}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${tag.name} tag`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

interface TagBadgeListProps {
  tags: Tag[];
  size?: 'sm' | 'md';
  onRemove?: (tagId: string) => void;
  maxDisplay?: number;
}

/**
 * Displays a list of tag badges with optional overflow indicator
 */
export function TagBadgeList({ tags, size = 'md', onRemove, maxDisplay }: TagBadgeListProps) {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const hiddenCount = maxDisplay ? Math.max(0, tags.length - maxDisplay) : 0;

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          size={size}
          onRemove={onRemove ? () => onRemove(tag.id) : undefined}
        />
      ))}
      {hiddenCount > 0 && (
        <span className={`inline-flex items-center rounded-full bg-gray-100 text-gray-600 font-medium ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
        }`}>
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}
