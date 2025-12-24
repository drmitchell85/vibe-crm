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
- ✅ Interaction Tracking
- ✅ Reminders & Follow-ups
- ✅ API Testing (Unit & Integration)
- ✅ Notes & Tagging
- Advanced Search & Filtering
- Data Import/Export
- Dashboard with Analytics

> **Development Progress**: See [ROADMAP.md](./ROADMAP.md) for detailed phase-by-phase implementation tracking.

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
├── ROADMAP.md                   # Development progress tracking
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
| `make test` | Run all tests |
| `make test-watch` | Run tests in watch mode |
| `make test-coverage` | Run tests with coverage |
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
- `GET /api/contacts` - List all contacts (supports `?tags=id1,id2` filter with AND logic)
- `GET /api/contacts/search?q={query}` - Search contacts by name, email, twitter, or company
- `GET /api/contacts/:id` - Get single contact with related data
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `POST /api/contacts/:id/tags` - Add a tag to contact (idempotent)
- `DELETE /api/contacts/:id/tags/:tagId` - Remove a tag from contact

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

### Tags
- `GET /api/tags` - List all tags with contact counts
- `GET /api/tags/:id` - Get single tag with contact count
- `POST /api/tags` - Create tag (returns 409 on duplicate name)
- `PUT /api/tags/:id` - Update tag (partial updates allowed)
- `DELETE /api/tags/:id` - Delete tag (removes from all contacts)
- `GET /api/tags/:id/contacts` - List all contacts with specific tag

### Notes
- `GET /api/contacts/:contactId/notes` - List notes for contact (pinned first)
- `GET /api/notes/:id` - Get single note with contact info
- `POST /api/contacts/:contactId/notes` - Create note
- `PUT /api/notes/:id` - Update note (partial updates allowed)
- `PATCH /api/notes/:id/pin` - Toggle pin status
- `DELETE /api/notes/:id` - Delete note

### Health
- `GET /health` - API health check

## Testing

The backend includes comprehensive unit and integration tests using Jest and Supertest.

```bash
# Run backend tests
cd server && npm test

# Run tests in watch mode
cd server && npm run test:watch

# Run tests with coverage report
cd server && npm run test:coverage

# Run frontend tests
cd client && npm test
```

**Test Coverage:** 358 tests across 11 test suites covering:
- Contact API (CRUD, search, tag linking)
- Tag API (CRUD, contact lookup)
- Interaction API (CRUD, filtering)
- Reminder API (CRUD, upcoming/overdue)
- Note API (CRUD, pinning)

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

---

**Last Updated**: 2025-12-23 | **Current Phase**: 5 - Notes & Tagging (Complete) | See [ROADMAP.md](./ROADMAP.md) for details
