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

**Chunk 5.1: Tag Service & Validation** ✅ COMPLETED
- [x] Created Zod validation schemas (`server/src/schemas/tagSchema.ts`)
  - `createTagSchema` (name required, color optional with default `#6B7280`)
  - `updateTagSchema` (all fields optional)
  - Hex color validation regex, 50 char name limit
- [x] Created tag service (`server/src/services/tagService.ts`)
  - `getAllTags()` — list all tags with contact count
  - `getTagById(id)` — get single tag with contact count
  - `createTag(data)` — create new tag (unique name validation, P2002 handling)
  - `updateTag(id, data)` — update tag
  - `deleteTag(id)` — delete tag (cascade removes from contacts)
- [x] Unit tests for tag service (`server/src/services/__tests__/tagService.test.ts`) — 26 tests

**Chunk 5.2: Tag API (Controller & Routes)** ✅ COMPLETED
- [x] Created tag controller (`server/src/controllers/tagController.ts`)
- [x] Created tag routes (`server/src/routes/tags.ts`)
  - `GET /api/tags` — list all tags with contact counts
  - `GET /api/tags/:id` — get single tag
  - `POST /api/tags` — create tag (returns 409 on duplicate name)
  - `PUT /api/tags/:id` — update tag (partial updates allowed)
  - `DELETE /api/tags/:id` — delete tag (cascade removes from contacts)
- [x] Added Swagger/OpenAPI documentation with schema definitions
- [x] Registered routes in `app.ts`
- [x] Integration tests for tag API — 27 tests
- [x] Updated Postman collection with Tags folder

**Chunk 5.3: Contact-Tag Linking** ✅ COMPLETED
- [x] Added service methods to contactService (`server/src/services/contactService.ts`)
  - `getContactsWithTagFilter(tagIds?)` — filter contacts by multiple tag IDs (AND logic)
  - `addTagToContact(contactId, tagId)` — idempotent tag assignment using Prisma upsert
  - `removeTagFromContact(contactId, tagId)` — remove tag from contact
  - `getContactsByTag(tagId)` — get all contacts with specific tag
- [x] Added API endpoints
  - `GET /api/contacts?tags=tag1,tag2` — enhanced to support tag filtering (AND logic)
  - `POST /api/contacts/:id/tags` — add tag to contact (idempotent, returns 201)
  - `DELETE /api/contacts/:id/tags/:tagId` — remove tag from contact
  - `GET /api/tags/:tagId/contacts` — list all contacts with specific tag
- [x] Added Swagger/OpenAPI documentation for all endpoints
- [x] Unit tests for service methods — 18 tests
- [x] Integration tests for API endpoints — 19 tests

**Chunk 5.4: Note Service & Validation** ✅ COMPLETED
- [x] Created Zod validation schemas (`server/src/schemas/noteSchema.ts`)
  - `createNoteSchema` (content required; isPinned optional)
  - `updateNoteSchema` (all fields optional for partial updates)
- [x] Created note service (`server/src/services/noteService.ts`)
  - `getNotesForContact(contactId)` — list notes for a contact (pinned first, then by date)
  - `getNoteById(id)` — get single note with contact info
  - `createNote(contactId, data)` — create note for a contact
  - `updateNote(id, data)` — update note (partial updates allowed)
  - `deleteNote(id)` — delete note
  - `togglePin(id)` — toggle isPinned status
- [x] Unit tests for note service (`server/src/services/__tests__/noteService.test.ts`) — 26 tests

**Chunk 5.5: Note API (Controller & Routes)** ✅ COMPLETED
- [x] Created note controller (`server/src/controllers/noteController.ts`)
- [x] Created note routes (`server/src/routes/notes.ts`)
  - `GET /api/contacts/:contactId/notes` — list notes for a contact (pinned first)
  - `GET /api/notes/:id` — get single note with contact info
  - `POST /api/contacts/:contactId/notes` — create note
  - `PUT /api/notes/:id` — update note (partial updates allowed)
  - `PATCH /api/notes/:id/pin` — toggle pin status
  - `DELETE /api/notes/:id` — delete note
- [x] Added Swagger/OpenAPI documentation with schema definitions
- [x] Registered routes in `app.ts`
- [x] Integration tests for note API (`server/src/controllers/__tests__/noteController.test.ts`) — 30 tests
- [x] Updated Postman collection with Notes folder

**Chunk 5.6: Documentation & Cleanup** ✅ COMPLETED
- [x] Swagger/OpenAPI docs updated (tags, notes routes include full documentation)
- [x] Postman collection updated with Tags and Notes folders
- [x] Update README.md with new API endpoints (Tags, Notes, Contact-Tag linking)
- [x] Run full test suite to ensure no regressions (358 tests passing)

**Chunk 5.7: Notes & Tags Frontend** ✅ COMPLETED
**Completed**: 2025-12-23

**Tags UI:** ✅ COMPLETED
- [x] TagBadge component (colored pill with tag name, auto-contrast text)
- [x] TagBadgeList component (displays multiple tags with overflow indicator)
- [x] TagSelector component (dropdown for adding/removing tags from contacts)
- [x] TagFilter component (multi-select filter for contact list)
- [x] TagForm component (create/edit with color picker)
- [x] Tags management page (`/tags`) — list, create, edit, delete tags
- [x] Tag color picker with 17 predefined colors + custom hex input
- [x] Display tags on Contact detail page with inline editing
- [x] Display tags on Contact list (as badges, max 3 shown)
- [x] Tag filter on Contact list page (URL-persisted, AND logic)
- [x] Navigation link added to header

**Tags API Integration:** ✅ COMPLETED
- [x] TypeScript types: `Tag`, `TagWithContacts`, `CreateTagInput`, `UpdateTagInput`, `ContactWithTags`
- [x] API methods: `getAllTags`, `getTagById`, `createTag`, `updateTag`, `deleteTag`
- [x] API methods: `getContactsByTag`, `addTagToContact`, `removeTagFromContact`, `getContactsWithTags`

**Notes UI:** ✅ COMPLETED
- [x] NotesList component on Contact detail page (pinned first, then by date)
- [x] NoteCard component with pin indicator and timestamps
- [x] Create note modal with content textarea
- [x] Edit note modal
- [x] Delete note confirmation
- [x] Pin/unpin toggle button on each note

**Notes API Integration:** ✅ COMPLETED
- [x] TypeScript types for Note entity (`Note`, `NoteWithContact`, `CreateNoteInput`, `UpdateNoteInput`)
- [x] API methods: `getNotesForContact`, `getNoteById`, `createNote`, `updateNote`, `deleteNote`, `toggleNotePin`

**Deliverable:** Complete notes and tag-based organization system with full frontend UI

---

## Phase 6: Enhanced UI/UX & Search ⏳ PENDING

**Tasks:**
- [ ] Global search implementation
- [ ] Advanced filtering (by tag, company, date)
- [ ] Sorting options
- [ ] Dashboard page with stats and widgets
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Performance optimization

**Deliverable:** Polished, fast UI with comprehensive search

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

**Last Updated**: 2025-12-23
**Next Up**: Phase 6 - Enhanced UI/UX & Search (Global search, dashboard, dark mode)
