import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TagBadge, TagBadgeList } from './TagBadge';
import { Spinner } from './ui';
import type { Tag } from '../types';

interface TagSelectorProps {
  contactId: string;
  selectedTags: Tag[];
  onTagsChange?: () => void;
}

/**
 * Tag selector component for adding/removing tags from a contact
 *
 * Features:
 * - Displays current tags with remove buttons
 * - Dropdown to add new tags
 * - Filters available tags (excludes already selected)
 * - Inline mutations with optimistic updates feel
 */
export function TagSelector({ contactId, selectedTags, onTagsChange }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch all available tags
  const { data: allTags = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.getAllTags(),
  });

  // Filter out already selected tags and apply search
  const availableTags = allTags.filter(
    (tag) =>
      !selectedTags.some((selected) => selected.id === tag.id) &&
      tag.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add tag mutation
  const addTagMutation = useMutation({
    mutationFn: (tagId: string) => api.addTagToContact(contactId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onTagsChange?.();
      setSearch('');
    },
  });

  // Remove tag mutation
  const removeTagMutation = useMutation({
    mutationFn: (tagId: string) => api.removeTagFromContact(contactId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onTagsChange?.();
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tagId: string) => {
    addTagMutation.mutate(tagId);
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagMutation.mutate(tagId);
  };

  const isPending = addTagMutation.isPending || removeTagMutation.isPending;

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedTags.length > 0 ? (
          <TagBadgeList
            tags={selectedTags}
            onRemove={handleRemoveTag}
          />
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">No tags assigned</span>
        )}

        {/* Add tag button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Spinner size="xs" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Add Tag
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-10 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
              {/* Search input */}
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  autoFocus
                />
              </div>

              {/* Tag list */}
              <div className="max-h-48 overflow-y-auto">
                {isLoadingTags ? (
                  <div className="px-3 py-4 text-center">
                    <Spinner size="sm" />
                  </div>
                ) : availableTags.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {search ? 'No matching tags' : 'No more tags available'}
                  </div>
                ) : (
                  availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleAddTag(tag.id)}
                      disabled={addTagMutation.isPending}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <TagBadge tag={tag} size="sm" />
                      {tag.contactCount !== undefined && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                          {tag.contactCount} contact{tag.contactCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TagFilterProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

/**
 * Tag filter component for filtering contacts by tags
 *
 * Features:
 * - Multi-select dropdown for tags
 * - Shows selected tags as badges
 * - Clear all button
 */
export function TagFilter({ selectedTagIds, onChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all tags
  const { data: allTags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.getAllTags(),
  });

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        Filter by Tags
        {selectedTagIds.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
            {selectedTagIds.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
          {/* Header with clear button */}
          {selectedTagIds.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedTagIds.length} selected
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Tag list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {isLoading ? (
              <div className="px-3 py-4 text-center">
                <Spinner size="sm" />
              </div>
            ) : allTags.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No tags created yet
              </div>
            ) : (
              allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <TagBadge tag={tag} size="sm" />
                    {tag.contactCount !== undefined && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                        {tag.contactCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              size="sm"
              onRemove={() => toggleTag(tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
