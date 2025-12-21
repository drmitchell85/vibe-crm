# FPH CRM - Personal Contact Relationship Manager

A full-stack personal CRM application for managing contacts, tracking interactions, setting reminders, and organizing relationships in your personal life.

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + Shadcn/ui (UI components)
- React Query (server state management)
- React Router v6 (routing)

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (database)
- Prisma ORM (type-safe database operations)
- RESTful API

**Development:**
- npm workspaces (package manager)
- ESLint + Prettier (code quality)
- Monorepo structure

## Features

### Current Features
- ✅ Database setup with PostgreSQL and Prisma
- ✅ Complete database schema (Contact, Interaction, Reminder, Note, Tag models)
- ✅ RESTful API for contact management (CRUD operations + search)
- ✅ API documentation with Swagger UI at /api-docs
- ✅ Postman collection for API testing
- ✅ Frontend foundation with React + TypeScript + Tailwind CSS
- ✅ API client with axios and React Query
- ✅ Responsive layout with navigation
- ✅ Dashboard homepage with API status and contact count
- ✅ Contact list page with table display and search (debounced)
- ✅ Contact detail page with formatted information
- ✅ Create contact form with validation
- ✅ Edit contact form with pre-populated data
- ✅ Delete contact with confirmation dialog
- ✅ Dynamic social media fields (twitter, linkedin, github, mastodon, etc.)
- ✅ Loading, error, and empty states throughout UI

### Planned Features
- Interaction Tracking
- Reminders & Follow-ups
- Notes & Tagging
- Advanced Search & Filtering
- Data Import/Export
- Dashboard with Analytics

## Implementation Progress

### Phase 1: Foundation & Basic Contact Management ✅ COMPLETED
**Started**: 2025-12-18 | **Completed**: 2025-12-19

**Chunk 1.1: Database Setup** ✅ Completed
- [x] Project setup (monorepo, dependencies)
- [x] Database schema for contacts (PostgreSQL + Prisma migration)
- [x] Migrated from twitterUsername to flexible socialMedia JSON field

**Chunk 1.2: Service Layer** ✅ Completed
- [x] Zod validation schemas
- [x] Contact service with business logic (CRUD + search)

**Chunk 1.3: API Endpoints & Documentation** ✅ Completed
- [x] Contact controller (request handlers)
- [x] REST API routes (GET, POST, PUT, DELETE, search)
- [x] Swagger/OpenAPI documentation at /api-docs
- [x] Postman collection and environment

**Chunk 1.4: Frontend Foundation & API Client** ✅ Completed
- [x] API client with axios wrapper
- [x] React Query configuration
- [x] Layout component with navigation
- [x] HomePage with API connection test
- [x] Verified frontend <-> backend communication

**Chunk 1.5: Contact List Page** ✅ Completed
- [x] ContactsPage component with table display
- [x] Search functionality with debouncing (400ms)
- [x] Loading and error states
- [x] Empty state (no contacts and no search results variants)
- [x] Social media badges display
- [x] useDebounce custom hook

**Chunk 1.6: Contact Forms & Detail View** ✅ Completed
- [x] ContactDetailPage with formatted display (email/phone links, date formatting)
- [x] Reusable ContactForm component (works for create and edit)
- [x] Modal component (backdrop, ESC key, scroll lock)
- [x] Create contact modal with validation
- [x] Edit contact modal with pre-populated data
- [x] Delete confirmation dialog
- [x] Dynamic social media fields (add/remove platforms)
- [x] React Query mutations with cache invalidation
- [x] Full CRUD operations tested

**Deliverable:** ✅ Working contact CRUD system with database - COMPLETE!

---

### Phase 2: Interaction Tracking ✅ COMPLETED

**Chunk 2.1: Backend — Interaction Service Layer** ✅ Completed
- [x] Create Zod validation schemas (`server/src/schemas/interactionSchema.ts`)
  - `createInteractionSchema` (type, contactId required; subject, notes, date, duration, location optional)
  - `updateInteractionSchema` (all fields optional)
- [x] Create interaction service (`server/src/services/interactionService.ts`)
  - `getInteractionsForContact(contactId)` with optional filtering (type, date range)
  - `getInteractionById(id)`
  - `createInteraction(data)`
  - `updateInteraction(id, data)`
  - `deleteInteraction(id)`

**Chunk 2.2: Backend — API Routes & Swagger Docs** ✅ Completed
- [x] Create interaction controller (`server/src/controllers/interactionController.ts`)
- [x] Create interaction routes (`server/src/routes/interactions.ts`)
  - `GET /api/contacts/:contactId/interactions` — list all for a contact (with type/date filters)
  - `GET /api/interactions/:id` — get single interaction
  - `POST /api/contacts/:contactId/interactions` — create new
  - `PUT /api/interactions/:id` — update
  - `DELETE /api/interactions/:id` — delete
- [x] Add Swagger/OpenAPI documentation
- [x] Register routes in main `index.ts`

**Chunk 2.3: Frontend — API Client & Types** ✅ Completed
- [x] Add `CreateInteractionInput`, `UpdateInteractionInput`, and `InteractionFilters` types (`client/src/types/index.ts`)
- [x] Add interaction methods to API client (`client/src/lib/api.ts`)
  - `getInteractionsForContact(contactId, filters?)`
  - `getInteractionById(id)`
  - `createInteraction(contactId, data)`
  - `updateInteraction(id, data)`
  - `deleteInteraction(id)`

**Chunk 2.4: Frontend — Interaction Timeline UI** ✅ Completed
- [x] Create `InteractionTimeline` component (`client/src/components/InteractionTimeline.tsx`)
  - Chronological list view with smart date grouping (Today, Yesterday, weekday, date)
  - Type icons/badges with color coding for all 8 interaction types
  - Duration and location display with icons
  - Loading, error, and empty states
- [x] Replace placeholder in `ContactDetailPage` with `InteractionTimeline`
- [x] Add "Add Interaction" button in header (modal placeholder for Chunk 2.5)

**Chunk 2.5: Frontend — Interaction Form (Create/Edit/Delete)** ✅ Completed
- [x] Create `InteractionForm` component (`client/src/components/InteractionForm.tsx`)
  - Type dropdown with all 8 interaction types (with emoji icons)
  - Date/time picker, subject, notes, duration, location fields
  - Inline delete confirmation dialog
- [x] Add create interaction modal (triggered from "Add Interaction" button)
- [x] Add edit functionality (click on timeline item → edit modal)
- [x] Add delete confirmation dialog (inline within form)
- [x] React Query mutations with cache invalidation for create/update/delete

**Chunk 2.6: Frontend — Filtering & Sorting** ✅ Completed
- [x] Add type filter dropdown (all 8 interaction types with emoji icons)
- [x] Add date range filter (From/To date pickers)
- [x] Add sort toggle (Newest First / Oldest First)
- [x] Persist filter state in URL search params (shareable filtered views)
- [x] Collapsible filter panel with active filter badges
- [x] "No results" state when filters return empty

**Deliverable:** ✅ Full interaction logging with timeline view, CRUD operations, and filtering - COMPLETE!

---

### Phase 3: Reminders & Follow-ups ✅ COMPLETED
**Started**: 2025-12-21 | **Completed**: 2025-12-21

**Chunk 3.1: Backend — Reminder Service Layer** ✅ Completed
- [x] Create Zod validation schemas (`server/src/schemas/reminderSchema.ts`)
  - `createReminderSchema` (title, dueDate, contactId required; description optional)
  - `updateReminderSchema` (all fields optional)
- [x] Create reminder service (`server/src/services/reminderService.ts`)
  - `getRemindersForContact(contactId)` with optional filtering (completed, date range)
  - `getReminderById(id)`
  - `createReminder(data)`
  - `updateReminder(id, data)`
  - `deleteReminder(id)`
  - `markAsComplete(id)` / `markAsIncomplete(id)`
  - `getUpcomingReminders(limit?)` — for dashboard widget
  - `getOverdueReminders()`
  - `getAllReminders(filters?)` — for reminders page

**Chunk 3.2: Backend — API Routes & Swagger Docs** ✅ Completed
- [x] Create reminder controller (`server/src/controllers/reminderController.ts`)
- [x] Create reminder routes (`server/src/routes/reminders.ts`)
  - `GET /api/contacts/:contactId/reminders` — list all for a contact
  - `GET /api/reminders` — list all reminders (for reminders page)
  - `GET /api/reminders/upcoming` — get upcoming reminders
  - `GET /api/reminders/overdue` — get overdue reminders
  - `GET /api/reminders/:id` — get single reminder
  - `POST /api/contacts/:contactId/reminders` — create new
  - `PUT /api/reminders/:id` — update
  - `PATCH /api/reminders/:id/complete` — mark as complete/incomplete
  - `DELETE /api/reminders/:id` — delete
- [x] Add Swagger/OpenAPI documentation
- [x] Register routes in main `index.ts`
- [x] Update Postman collection with all 9 reminder endpoints

**Chunk 3.3: Frontend — API Client & Types** ✅ Completed
- [x] Add `CreateReminderInput`, `UpdateReminderInput`, `ReminderFilters`, and `ReminderWithContact` types (`client/src/types/index.ts`)
- [x] Add reminder methods to API client (`client/src/lib/api.ts`)
  - `getRemindersForContact(contactId, filters?)`
  - `getAllReminders(filters?)`
  - `getUpcomingReminders(limit?)`
  - `getOverdueReminders()`
  - `getReminderById(id)`
  - `createReminder(contactId, data)`
  - `updateReminder(id, data)`
  - `markReminderComplete(id)` / `markReminderIncomplete(id)`
  - `deleteReminder(id)`

**Chunk 3.4: Frontend — Reminders Page UI** ✅ Completed
- [x] Create `RemindersPage` component (`client/src/pages/RemindersPage.tsx`)
  - Tab-based views: Upcoming / Overdue / Completed / All
  - Overdue count badge on tab
  - Due date formatting with relative time ("in 2 days", "3 days overdue")
  - Color-coded cards (red for overdue, gray for completed)
  - Loading, error, and empty states for each tab
- [x] Add route to `App.tsx` (`/reminders`)
- [x] Add navigation link to Layout

**Chunk 3.5: Frontend — Reminder Form (Create/Edit/Delete)** ✅ Completed
- [x] Create `ReminderForm` component (`client/src/components/ReminderForm.tsx`)
  - Title input (required), description textarea
  - Due date/time picker (defaults to tomorrow 9 AM)
  - Inline delete confirmation dialog
- [x] Add create reminder modal with contact selector dropdown
- [x] Add edit functionality (click on reminder title → edit modal)
- [x] Add delete confirmation dialog (inline in form)
- [x] Add mark complete/incomplete checkbox on each reminder card
- [x] React Query mutations with cache invalidation (create, update, delete, toggle complete)

**Chunk 3.6: Frontend — Contact Detail Integration & Mark Complete** ✅ Completed
- [x] Create `RemindersList` component for ContactDetailPage
- [x] Add "Add Reminder" button on contact detail page
- [x] Mark as complete functionality (checkbox/button with animation)
- [x] Overdue visual indicators (red styling, warning badge)
- [x] Update `ContactDetailPage` to display reminders section

**Chunk 3.7: Frontend — Dashboard Widget** ✅ Completed
- [x] Create `UpcomingRemindersWidget` component
- [x] Display next 5 upcoming reminders with quick actions
- [x] Show overdue count as alert/badge
- [x] Link to full Reminders page
- [x] Add widget to Dashboard/HomePage

**Deliverable:** ✅ Complete reminder system with CRUD, completion tracking, and dashboard integration - COMPLETE!

---

### Phase 4: Notes & Tagging ⏳ PENDING

**Tasks:**
- [ ] Notes and tags database models
- [ ] Backend APIs for notes and tags
- [ ] Notes UI on contact pages
- [ ] Tag management interface
- [ ] Tag-based filtering
- [ ] Tag color coding

**Deliverable:** Note-taking and tag-based organization system

---

### Phase 5: Enhanced UI/UX & Search ⏳ PENDING

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

### Phase 6: Data Management & Export ⏳ PENDING

**Tasks:**
- [ ] CSV import/export functionality
- [ ] Bulk operations (delete, tag multiple contacts)
- [ ] Settings page
- [ ] Production configuration
- [ ] Rate limiting
- [ ] Error logging

**Deliverable:** Import/export and production-ready configuration

---

### Phase 7: Deployment & Polish ⏳ PENDING

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

## Database Schema

### Core Entities

**Contact**
- Basic information: firstName, lastName, email, phone
- Social: socialMedia (JSON field for flexible social platform tracking: twitter, linkedin, github, mastodon, etc.)
- Additional: company, jobTitle, address, birthday
- Relationships: interactions, reminders, notes, tags

**Interaction**
- Type: CALL, MEETING, EMAIL, TEXT, COFFEE, LUNCH, EVENT, OTHER
- Fields: subject, notes, date, duration, location
- Links to: Contact

**Reminder**
- Fields: title, description, dueDate, isCompleted, completedAt
- Links to: Contact

**Note**
- Fields: content, isPinned
- Links to: Contact

**Tag**
- Fields: name, color
- Links to: Contacts (many-to-many)

## Project Structure

```
fph-crm/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # API client & utilities
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── routes/              # API routes
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Error handling, validation
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/
│   └── package.json
│
├── shared/                      # Shared TypeScript types
├── Makefile                     # Make commands for common tasks
├── README.md                    # This file
└── package.json                 # Root package.json
```

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher (comes with Node.js)
- PostgreSQL 14 or higher
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd fph-crm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:

   Create `/server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fph_crm"
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

   Create `/client/.env`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

4. Set up the database:
   ```bash
   cd server
   npm run prisma migrate dev
   npm run prisma db seed  # Optional: seed with sample data
   ```

5. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. Open http://localhost:5173 in your browser

## Make Commands

This project includes a Makefile for convenient command shortcuts. Run `make help` to see all available commands:

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make dev` | Start development servers (client + server) |
| `make dev-server` | Start backend server only |
| `make dev-client` | Start frontend client only |
| `make build` | Build for production |
| `make lint` | Run linting |
| `make format` | Format code with Prettier |
| `make db-migrate` | Run database migrations |
| `make db-generate` | Generate Prisma client |
| `make db-studio` | Open Prisma Studio |
| `make clean` | Remove build artifacts and node_modules |

## Development Workflow

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173`
- Database GUI: `make db-studio` or `npm run prisma studio` (from `/server` directory)

## API Endpoints

Full interactive API documentation is available at **http://localhost:3001/api-docs** (Swagger UI)

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/search?q={query}` - Search contacts by name, email, twitter, or company
- `GET /api/contacts/:id` - Get single contact with related data
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Interactions
- `GET /api/contacts/:contactId/interactions` - List interactions for a contact (supports `type`, `startDate`, `endDate` filters)
- `GET /api/interactions/:id` - Get single interaction
- `POST /api/contacts/:contactId/interactions` - Create interaction
- `PUT /api/interactions/:id` - Update interaction
- `DELETE /api/interactions/:id` - Delete interaction

### Reminders
- `GET /api/reminders` - List all reminders (supports `isCompleted`, `startDate`, `endDate` filters)
- `GET /api/reminders/upcoming` - Get upcoming incomplete reminders (supports `limit` param)
- `GET /api/reminders/overdue` - Get overdue incomplete reminders
- `GET /api/contacts/:contactId/reminders` - List reminders for a contact
- `GET /api/reminders/:id` - Get single reminder
- `POST /api/contacts/:contactId/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `PATCH /api/reminders/:id/complete` - Toggle reminder completion
- `DELETE /api/reminders/:id` - Delete reminder

### Health
- `GET /health` - API health check

More endpoints will be added in subsequent phases (notes, tags).

## Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests
cd server && npm test
```

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

---

**Last Updated**: 2025-12-21
**Current Phase**: Phase 4 - Notes & Tagging ⏳ PENDING
**Next Up**: Phase 4 - Notes and tag-based organization
**Status**: ✅ Phase 1 Complete | ✅ Phase 2 Complete | ✅ Phase 3 Complete
