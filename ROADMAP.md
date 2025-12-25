# FPH CRM - Development Roadmap

This document tracks the implementation progress of the FPH CRM application, organized into phases and chunks for incremental development.

**Current Phase**: Phase 6 - Enhanced UI/UX & Search
**Status**: Phases 1-5 Complete | Phase 6 Pending

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

## Phase 6: Enhanced UI/UX & Search ⏳ PENDING

**Chunk 6.1: Global Search Backend** ✅ COMPLETED
- [x] Create search service (`server/src/services/searchService.ts`)
  - `globalSearch(query)` — search across contacts, notes, interactions, reminders
  - Return unified results with entity type, relevance score, and preview text
  - Case-insensitive matching with Prisma `contains` + `mode: 'insensitive'`
- [x] Create search controller and routes (`GET /api/search?q=query&limit=10`)
- [x] Swagger documentation for search endpoint
- [x] Unit tests (30) and integration tests (21) for search service

**Chunk 6.2: Global Search Frontend** ✅ COMPLETED
- [x] SearchInput component in header (persistent across pages)
- [x] Command palette modal (Cmd/Ctrl+K to open)
- [x] Search results with type badges (Contact, Note, Interaction, Reminder)
- [x] Keyboard navigation in results (arrow keys, Enter to select)
- [x] Click/select navigates to relevant page
- [x] Recent searches stored in localStorage
- [x] Debounced API calls (300ms)

**Chunk 6.3: Advanced Contact Filtering** ⏳ PENDING
- [ ] Company filter dropdown on contact list
- [ ] Date range filter (created date, last interaction date)
- [ ] "Has reminders" / "Has overdue reminders" filter toggles
- [ ] Combine with existing tag filter (all filters work together)
- [ ] URL parameter persistence for all filters
- [ ] Filter summary chip/badge showing active filter count

**Chunk 6.4: Sorting Options** ⏳ PENDING
- [ ] Sortable column headers on contact list table
- [ ] Sort options: Name (A-Z, Z-A), Company, Last Interaction, Created Date, Updated Date
- [ ] Sort direction toggle (ascending/descending)
- [ ] URL parameter persistence (`?sort=name&order=asc`)
- [ ] Visual indicator on active sort column

**Chunk 6.5: Dashboard & Analytics** ⏳ PENDING
- [ ] Dashboard stats API endpoint (`GET /api/stats`)
  - Total contacts, interactions this week/month, pending reminders, overdue count
- [ ] Dashboard page layout with stat cards
- [ ] Contact growth chart (contacts added over time)
- [ ] Interaction breakdown by type (pie/bar chart)
- [ ] Recent activity feed (latest interactions, notes, reminders)
- [ ] Quick action buttons (Add Contact, Add Reminder)

**Chunk 6.6: Dark Mode** ⏳ PENDING
- [ ] ThemeContext provider with light/dark/system modes
- [ ] CSS variables for all colors (backgrounds, text, borders, accents)
- [ ] Theme toggle button in header
- [ ] LocalStorage persistence of theme preference
- [ ] Respect system preference with `prefers-color-scheme` media query
- [ ] Update Tailwind config for dark mode classes
- [ ] Test all components in dark mode

**Chunk 6.7: Keyboard Shortcuts** ⏳ PENDING
- [ ] Global keyboard shortcut handler (useHotkeys or custom hook)
- [ ] Navigation shortcuts: `g+c` → Contacts, `g+r` → Reminders, `g+t` → Tags, `g+h` → Home
- [ ] Action shortcuts: `n` → New Contact, `?` → Help modal
- [ ] Modal shortcuts: `Escape` → Close, `Cmd+Enter` → Submit form
- [ ] Keyboard shortcuts help modal (show all available shortcuts)
- [ ] Visual hints in UI (show shortcuts in tooltips)

**Chunk 6.8: Performance Optimization** ⏳ PENDING
- [ ] React Query caching strategy review and optimization
- [ ] Virtualized lists for large datasets (react-window or similar)
- [ ] Code splitting with React.lazy for route-based chunks
- [ ] Bundle size analysis with `vite-bundle-visualizer`
- [ ] Image optimization and lazy loading
- [ ] API response pagination for large result sets
- [ ] Lighthouse audit and performance metrics

**Deliverable:** Polished, fast UI with comprehensive search, dark mode, and keyboard shortcuts

---

## Phase 7: Data Management & Export ⏳ PENDING

**Tasks:**
- [ ] CSV import/export functionality
- [ ] Bulk operations (delete, tag multiple contacts)
- [ ] Settings page
- [ ] Production configuration
- [ ] Rate limiting
- [ ] Error logging

**Deliverable:** Import/export and production-ready configuration

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
**Next Up**: Phase 6, Chunk 6.3 - Advanced Contact Filtering
