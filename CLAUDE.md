# FPH CRM - Claude Code Guide

## Project Overview

FPH CRM is a personal CRM application for managing contacts, interactions, reminders, notes, and tags. It follows a phased development approach documented in `ROADMAP.md`.

## Architecture

**Monorepo Structure:**
```
fph-crm/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express.js backend (TypeScript + Prisma)
├── shared/          # Shared types (future use)
├── postman/         # Postman collection for API testing
├── ROADMAP.md       # Development phases and progress tracking
└── Makefile         # Common development commands
```

## Tech Stack

### Backend (`server/`)
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Prisma with PostgreSQL
- **Validation:** Zod schemas
- **API Docs:** Swagger/OpenAPI (JSDoc inline annotations)
- **Testing:** Jest + Supertest

### Frontend (`client/`)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State/Data:** TanStack React Query
- **Routing:** React Router DOM
- **HTTP Client:** Axios

## Common Commands

```bash
# Development
make dev              # Start both client (port 5173) and server (port 3001)
make dev-server       # Start backend only
make dev-client       # Start frontend only

# Testing
make test             # Run all server tests
make test-watch       # Run tests in watch mode
make test-coverage    # Run tests with coverage report

# Build
make build            # Build both client and server
npm run build         # From client/ or server/ directories

# Database
make db-migrate       # Run Prisma migrations
make db-generate      # Generate Prisma client
make db-studio        # Open Prisma Studio GUI
```

## Project Conventions

### Backend Patterns

**File Structure:**
- `routes/` - Express route definitions with Swagger JSDoc
- `controllers/` - Request handlers, validation, response formatting
- `services/` - Business logic, Prisma queries
- `schemas/` - Zod validation schemas
- `test/` - Unit and integration tests

**API Response Format:**
```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { message: string, code?: string } }
```

**Swagger Documentation:** Use JSDoc block comments in route files:
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: Description
 *     tags: [TagName]
 *     ...
 */
```

### Frontend Patterns

**File Structure:**
- `pages/` - Route components (ContactsPage, RemindersPage, etc.)
- `components/` - Reusable UI components
- `components/ui/` - Base UI primitives (LoadingState, ErrorState, etc.)
- `hooks/` - Custom React hooks (useDebounce, etc.)
- `lib/api.ts` - Axios client wrapper with typed methods
- `types/index.ts` - TypeScript interfaces and types

**State Management:**
- React Query for server state (caching, refetching)
- URL search params for filter/sort state (persisted in URL)
- Local component state for UI-only state

**Common Patterns:**
```typescript
// URL state persistence
const [searchParams, setSearchParams] = useSearchParams();
const filters = useMemo(() => parseFiltersFromUrl(searchParams), [searchParams]);

// Debounced search
const debouncedSearch = useDebounce(searchQuery, 400);

// React Query mutations with cache invalidation
const mutation = useMutation({
  mutationFn: (data) => api.createContact(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
});
```

## Data Models

**Core Entities:**
- `Contact` - firstName, lastName, email, phone, company, jobTitle, address, birthday, socialMedia (JSON)
- `Interaction` - type (CALL/MEETING/EMAIL/TEXT/COFFEE/LUNCH/EVENT/OTHER), subject, notes, date, duration, location
- `Reminder` - title, description, dueDate, isCompleted, completedAt
- `Note` - content, isPinned
- `Tag` - name, color (hex)

**Relationships:**
- Contact has many Interactions, Reminders, Notes
- Contact has many Tags (many-to-many via ContactTag)

## Typical Workflow

When working on a new feature phase:

1. **Check ROADMAP.md** - Identify the current chunk and its requirements
2. **Backend first** - Create/update service, controller, routes, Swagger docs
3. **Frontend second** - Create/update types, API client, components, pages
4. **Update documentation:**
   - Mark completed items in `ROADMAP.md`
   - Update Swagger JSDoc if API changed
   - Update Postman collection if endpoints added/changed
5. **Provide commit message** when requested

**Commit Message Format:**
```
feat: brief description

- Backend changes
- Frontend changes
- Documentation updates

[Claude Code]
```

## Testing

**Backend Tests:**
- Unit tests in `server/src/test/unit/`
- Integration tests in `server/src/test/integration/`
- Run with: `cd server && npm test`

**Test Patterns:**
```typescript
// Unit tests mock Prisma
jest.mock('@prisma/client');

// Integration tests use Supertest
const response = await request(app)
  .get('/api/contacts')
  .expect(200);
```

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/contacts | List contacts (with filters/sorting) |
| GET | /api/contacts/:id | Get single contact |
| POST | /api/contacts | Create contact |
| PUT | /api/contacts/:id | Update contact |
| DELETE | /api/contacts/:id | Delete contact |
| GET | /api/contacts/search?q= | Search contacts |
| GET | /api/contacts/companies | Get distinct companies |
| GET | /api/search?q= | Global search |
| GET | /api/tags | List tags |
| GET | /api/reminders | List reminders |
| GET | /api/reminders/upcoming | Upcoming reminders |
| GET | /api/reminders/overdue | Overdue reminders |

## Key Files to Know

- `ROADMAP.md` - Development phases, progress tracking, next tasks
- `server/prisma/schema.prisma` - Database schema
- `server/src/routes/*.ts` - API routes with Swagger docs
- `client/src/lib/api.ts` - API client with all endpoints
- `client/src/types/index.ts` - Frontend TypeScript types
- `postman/FPH-CRM-API.postman_collection.json` - API testing collection
