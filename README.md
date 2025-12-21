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

### Phase 2: Interaction Tracking ⏳ IN PROGRESS

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

**Chunk 2.4: Frontend — Interaction Timeline UI** ⏳ Pending
- [ ] Create `InteractionTimeline` component (`client/src/components/InteractionTimeline.tsx`)
  - Chronological list view with date grouping
  - Type icons/badges for each interaction type
  - Duration and location display
  - Empty state when no interactions
- [ ] Replace placeholder in `ContactDetailPage` with `InteractionTimeline`
- [ ] Add "Add Interaction" button in header

**Chunk 2.5: Frontend — Interaction Form (Create/Edit/Delete)** ⏳ Pending
- [ ] Create `InteractionForm` component (`client/src/components/InteractionForm.tsx`)
  - Type dropdown with all 8 interaction types
  - Date picker, subject, notes, duration, location fields
  - Form validation
- [ ] Add create interaction modal (triggered from "Add Interaction" button)
- [ ] Add edit functionality (click on timeline item → edit modal)
- [ ] Add delete confirmation dialog
- [ ] React Query mutations with cache invalidation

**Chunk 2.6: Frontend — Filtering & Sorting** ⏳ Pending
- [ ] Add type filter dropdown (show only CALL, MEETING, etc.)
- [ ] Add date range filter
- [ ] Add sort toggle (newest first / oldest first)
- [ ] Persist filter state in URL or local storage

**Deliverable:** Full interaction logging with timeline view, CRUD operations, and filtering

---

### Phase 3: Reminders & Follow-ups ⏳ PENDING

**Tasks:**
- [ ] Reminder database model
- [ ] Backend reminder API
- [ ] Reminders page UI (upcoming/overdue/completed views)
- [ ] Mark as complete functionality
- [ ] Overdue reminder indicators
- [ ] Dashboard widget for upcoming reminders

**Deliverable:** Complete reminder system with notifications

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

### Health
- `GET /health` - API health check

More endpoints will be added in subsequent phases (reminders, notes, tags).

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

**Last Updated**: 2025-12-20
**Current Phase**: Phase 2 - Interaction Tracking ⏳ IN PROGRESS
**Current Chunk**: 2.4 - Frontend Interaction Timeline UI
**Status**: ✅ Phase 1 Complete | ✅ Chunks 2.1-2.3 Complete
