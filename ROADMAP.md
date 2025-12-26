# FPH CRM - Development Roadmap

This document tracks the implementation progress of the FPH CRM application, organized into phases and chunks for incremental development.

**Current Phase**: Phase 7 - Data Management & Export
**Status**: Phases 1-6 Complete | Phase 7 Pending

---

## Phase 1: Foundation & Basic Contact Management ✅ COMPLETED
**Completed**: 2025-12-19

**Backend:**
- PostgreSQL database with Prisma ORM
- Contact model with flexible `socialMedia` JSON field (twitter, linkedin, github, etc.)
- Contact service with CRUD operations and search
- Zod validation schemas
- REST API endpoints: `GET/POST/PUT/DELETE /api/contacts`, `GET /api/contacts/search`
- Swagger/OpenAPI documentation at `/api-docs`
- Postman collection

**Frontend:**
- React + TypeScript + Vite foundation
- Axios API client with React Query integration
- Layout with navigation
- Contact list page with table display and debounced search (400ms)
- Contact detail page with formatted display
- Create/Edit contact forms with validation
- Delete confirmation dialog
- Dynamic social media field management
- Loading, error, and empty states throughout

---

## Phase 2: Interaction Tracking ✅ COMPLETED

**Backend:**
- Interaction model with 8 types: CALL, MEETING, EMAIL, TEXT, COFFEE, LUNCH, EVENT, OTHER
- Fields: subject, notes, date, duration, location
- Interaction service with CRUD and filtering (by type, date range)
- REST API endpoints nested under contacts
- Swagger documentation updated

**Frontend:**
- InteractionTimeline component with smart date grouping (Today, Yesterday, etc.)
- Color-coded type badges with emoji icons
- Create/Edit/Delete interaction modals
- Collapsible filter panel (type, date range, sort order)
- Filter state persisted in URL search params

---

## Phase 3: Reminders & Follow-ups ✅ COMPLETED
**Completed**: 2025-12-21

**Backend:**
- Reminder model with title, description, dueDate, isCompleted, completedAt
- Reminder service with CRUD, mark complete/incomplete, upcoming/overdue queries
- REST API: 9 endpoints including `/api/reminders/upcoming` and `/api/reminders/overdue`
- Swagger documentation and Postman collection updated

**Frontend:**
- Dedicated Reminders page with tab views: Upcoming, Overdue, Completed, All
- Relative time formatting ("in 2 days", "3 days overdue")
- Color-coded cards (red for overdue, gray for completed)
- Create/Edit/Delete reminder modals with contact selector
- Mark complete/incomplete with checkbox
- RemindersList component on Contact detail page
- UpcomingRemindersWidget on Dashboard/HomePage with overdue alert badge

---

## Phase 4: API Testing ✅ COMPLETED
**Completed**: 2025-12-22

**Test Infrastructure:**
- Jest with TypeScript support (ts-jest)
- Supertest for HTTP integration testing
- Refactored Express app into `app.ts` for testability (separate from server startup)
- Test scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`

**Test Coverage (358 tests total):**
- **Contact API**: Unit tests (service layer) + Integration tests (HTTP endpoints) + Tag linking tests
- **Tag API**: Unit tests + Integration tests including contact-by-tag lookup
- **Interaction API**: Unit tests + Integration tests with filter validation
- **Reminder API**: Unit tests + Integration tests including upcoming/overdue endpoints
- **Note API**: Unit tests (26 tests) + Integration tests (30 tests)
- Edge cases: Validation errors, 404s, duplicate handling, malformed JSON

---

## Phase 5: Notes & Tagging ✅ COMPLETED
**Completed**: 2025-12-23

**Backend:**
- Tag model with name and hex color fields (default `#6B7280`)
- Tag service with CRUD operations and contact count aggregation
- Note model with content, isPinned, and timestamps
- Note service with CRUD, pin toggle, and pinned-first ordering
- Contact-Tag many-to-many relationship with linking endpoints
- REST API: `GET/POST/PUT/DELETE /api/tags`, `GET /api/tags/:id/contacts`
- REST API: `GET/POST /api/contacts/:id/notes`, `GET/PUT/PATCH/DELETE /api/notes/:id`
- REST API: `POST/DELETE /api/contacts/:id/tags/:tagId`, tag filtering via `?tags=id1,id2`
- Zod validation schemas with hex color regex and character limits
- Swagger documentation and Postman collection updated
- Unit tests (70+) and integration tests (76+) — 358 tests total

**Frontend:**
- Tags management page (`/tags`) with create, edit, delete functionality
- TagBadge component with auto-contrast text based on background color
- TagSelector dropdown for adding/removing tags from contacts
- TagFilter multi-select on contact list (URL-persisted, AND logic)
- Color picker with 17 predefined colors + custom hex input
- Tags displayed on contact list (max 3 shown) and detail page
- NotesList component on Contact detail page (pinned first, then by date)
- NoteCard component with pin indicator, timestamps, and actions
- Create/Edit note modals and delete confirmation
- Pin/unpin toggle with optimistic updates

---

## Phase 6: Enhanced UI/UX & Search ✅ COMPLETED
**Completed**: 2025-12-25

**Backend:**
- Global search service searching across contacts, notes, interactions, reminders
- Search API endpoint (`GET /api/search?q=query&limit=10`) with relevance scoring
- Dashboard stats API (`/api/stats`, `/stats/growth`, `/stats/interactions`, `/stats/activity`)
- Contact filtering by company, date range, reminder status
- Sortable contact queries with null-last handling
- Pagination support with metadata (page, limit, total, totalPages, hasMore)
- Swagger documentation and unit/integration tests for all new endpoints

**Frontend:**
- Command palette search modal (Cmd/Ctrl+K) with keyboard navigation
- Recent searches stored in localStorage with debounced API calls
- Advanced contact filtering: company dropdown, date range, reminder toggles
- Collapsible filter panel with active filter chips and URL persistence
- Sortable table columns with visual indicators and direction toggle
- Dashboard with stat cards, contact growth chart, interaction breakdown, activity feed
- Dark mode with ThemeContext (light/dark/system), CSS variables, localStorage persistence
- Global keyboard shortcuts: `g+c/r/t/h` navigation, `n` new contact, `?` help modal
- Performance: React Query optimization, virtualized lists (react-window), code splitting
- Bundle analysis with rollup-plugin-visualizer (`npm run build:analyze`)

---

## Phase 7: Data Management & Export ⏳ PENDING

**Chunk 7.1: CSV Export** ⏳ PENDING
- [ ] Create export service (`server/src/services/exportService.ts`)
  - `exportContacts(options)` — generate CSV from contacts with selected fields
  - Support field selection (name, email, phone, company, tags, etc.)
  - Handle related data (flatten tags to comma-separated, count interactions)
- [ ] Export API endpoint (`GET /api/contacts/export?format=csv&fields=...`)
- [ ] Swagger documentation for export endpoint
- [ ] Frontend: Export button on Contacts page
- [ ] Export options modal (field selection, include/exclude filters)
- [ ] Download handling with proper filename (fph-crm-contacts-YYYY-MM-DD.csv)

**Chunk 7.2: CSV Import** ⏳ PENDING
- [ ] Create import service (`server/src/services/importService.ts`)
  - `parseCSV(file)` — parse uploaded CSV with header detection
  - `validateImportData(rows)` — validate against contact schema
  - `importContacts(rows, options)` — bulk create with duplicate handling
- [ ] Import API endpoint (`POST /api/contacts/import`)
  - Accept multipart/form-data with CSV file
  - Return import summary (created, skipped, errors)
- [ ] Swagger documentation for import endpoint
- [ ] Frontend: Import button on Contacts page
- [ ] Import modal with file upload dropzone
- [ ] CSV preview table with column mapping
- [ ] Duplicate detection options (skip, update, create new)
- [ ] Import progress and results summary

**Chunk 7.3: Bulk Operations** ⏳ PENDING
- [ ] Bulk delete endpoint (`DELETE /api/contacts/bulk` with body: { ids: [...] })
- [ ] Bulk tag endpoint (`POST /api/contacts/bulk/tags` with body: { ids: [...], tagIds: [...], action: 'add'|'remove' })
- [ ] Swagger documentation for bulk endpoints
- [ ] Frontend: Selection mode on contact list (checkboxes)
- [ ] Select all / deselect all functionality
- [ ] Bulk action toolbar (appears when items selected)
  - Delete selected (with confirmation)
  - Add tags to selected
  - Remove tags from selected
- [ ] Selection count indicator
- [ ] Keyboard shortcuts: `Ctrl+A` select all, `Escape` clear selection

**Chunk 7.4: Settings Page** ⏳ PENDING
- [ ] Create settings routes and controller
- [ ] Settings storage (localStorage for frontend preferences)
- [ ] Settings page (`/settings`) with sections:
  - **Display**: Default sort order, items per page, date format
  - **Theme**: Light/Dark/System (move from sidebar)
  - **Keyboard Shortcuts**: View and customize shortcuts
  - **Data**: Export all data, clear local cache
- [ ] Settings context for app-wide preference access
- [ ] Persist settings to localStorage with migration support

**Chunk 7.5: Production Hardening** ⏳ PENDING
- [ ] Rate limiting middleware (`express-rate-limit`)
  - Global rate limit (100 req/min)
  - Stricter limits for write operations (20 req/min)
  - Custom error response format
- [ ] Structured logging (`pino` or `winston`)
  - Request/response logging with correlation IDs
  - Error logging with stack traces
  - Log levels based on NODE_ENV
- [ ] Security headers (`helmet` middleware)
- [ ] Input sanitization review
- [ ] Environment configuration validation (fail fast on missing vars)
- [ ] Health check endpoint enhancements (`/health` with DB connectivity check)
- [ ] Graceful shutdown handling

**Deliverable:** Import/export, bulk operations, settings, and production-ready configuration

---

## Phase 8: Deployment & Polish ⏳ PENDING

**Tasks:**
- [ ] Database deployment (Railway/Supabase)
- [ ] Backend deployment (Railway/Render)
- [ ] Frontend deployment (Vercel/Netlify)
- [ ] Complete documentation
- [ ] Accessibility improvements (ARIA, keyboard nav)
- [ ] Loading states and empty states
- [ ] Toast notifications

**Deliverable:** Live, publicly accessible application with complete docs

---

**Last Updated**: 2025-12-25
**Next Up**: Phase 7 - Data Management & Export
