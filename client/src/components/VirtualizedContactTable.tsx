import { CSSProperties, ReactElement } from 'react';
import { List } from 'react-window';
import { Link } from 'react-router-dom';
import { TagBadgeList } from './TagBadge';
import type { ContactWithTags, ContactSortField, SortOrder } from '../types';

const ROW_HEIGHT = 64;
const HEADER_HEIGHT = 48;

interface VirtualizedContactTableProps {
  contacts: ContactWithTags[];
  sortBy: ContactSortField;
  sortOrder: SortOrder;
  onSort: (field: ContactSortField) => void;
  height?: number;
}

interface ContactRowProps {
  contacts: ContactWithTags[];
}

/**
 * Row component for the virtualized list.
 * Receives index, style, ariaAttributes from react-window,
 * plus contacts array spread from rowProps.
 */
function ContactRowComponent(
  props: {
    index: number;
    style: CSSProperties;
    ariaAttributes: {
      'aria-posinset': number;
      'aria-setsize': number;
      role: 'listitem';
    };
  } & ContactRowProps
): ReactElement {
  const { index, style, contacts } = props;
  const contact = contacts[index];

  return (
    <div
      style={style}
      className="flex items-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      {/* Name */}
      <div className="flex-1 px-6 py-4 min-w-[200px]">
        <Link
          to={`/contacts/${contact.id}`}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {contact.firstName} {contact.lastName}
        </Link>
      </div>
      {/* Email */}
      <div className="flex-1 px-6 py-4 min-w-[200px]">
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {contact.email || '-'}
        </span>
      </div>
      {/* Company */}
      <div className="flex-1 px-6 py-4 min-w-[150px]">
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {contact.company || '-'}
        </span>
      </div>
      {/* Tags */}
      <div className="flex-1 px-6 py-4 min-w-[150px]">
        {contact.tags && contact.tags.length > 0 ? (
          <TagBadgeList tags={contact.tags} size="sm" maxDisplay={3} />
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        )}
      </div>
      {/* Actions */}
      <div className="w-24 px-6 py-4 text-right">
        <Link
          to={`/contacts/${contact.id}`}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
        >
          View
        </Link>
      </div>
    </div>
  );
}

/**
 * Sortable table header component
 */
interface SortableHeaderProps {
  field: ContactSortField;
  label: string;
  currentSortBy: ContactSortField;
  currentSortOrder: SortOrder;
  onSort: (field: ContactSortField) => void;
  className?: string;
}

function SortableHeader({
  field,
  label,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = 'flex-1 min-w-[200px]',
}: SortableHeaderProps) {
  const isActive = currentSortBy === field;

  return (
    <div
      className={`${className} px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className="flex flex-col">
          <svg
            className={`w-3 h-3 -mb-1 ${
              isActive && currentSortOrder === 'asc'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className={`w-3 h-3 -mt-1 ${
              isActive && currentSortOrder === 'desc'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

/**
 * Virtualized contact table for efficient rendering of large datasets.
 * Uses react-window to only render visible rows plus a small overscan buffer.
 */
export function VirtualizedContactTable({
  contacts,
  sortBy,
  sortOrder,
  onSort,
  height = 600,
}: VirtualizedContactTableProps) {
  // Calculate the actual list height (accounting for header)
  const listHeight = height - HEADER_HEIGHT;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div
        className="flex bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        style={{ height: HEADER_HEIGHT }}
      >
        <SortableHeader
          field="name"
          label="Name"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
        <SortableHeader
          field="email"
          label="Email"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />
        <SortableHeader
          field="company"
          label="Company"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
          className="flex-1 min-w-[150px]"
        />
        <div className="flex-1 min-w-[150px] px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Tags
        </div>
        <div className="w-24 px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Actions
        </div>
      </div>

      {/* Virtualized List */}
      <List<ContactRowProps>
        style={{ height: listHeight }}
        rowCount={contacts.length}
        rowHeight={ROW_HEIGHT}
        rowProps={{ contacts }}
        rowComponent={ContactRowComponent}
        overscanCount={5}
      />
    </div>
  );
}

/**
 * Threshold for when to use virtualized vs regular table.
 * Virtualization has some overhead, so only use for larger lists.
 */
export const VIRTUALIZATION_THRESHOLD = 50;
