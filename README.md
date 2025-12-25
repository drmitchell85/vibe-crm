# FPH CRM - Personal Contact Relationship Manager

A full-stack personal CRM application for managing contacts, tracking interactions, setting reminders, and organizing relationships.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Query, React Router v6 |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL |
| **Testing** | Jest, Supertest (358 tests) |
| **Docs** | Swagger/OpenAPI, Postman |

## Features

- **Contact Management** - Store contacts with flexible fields (name, email, phone, company, social media, etc.)
- **Interaction Tracking** - Log calls, meetings, emails, coffees, lunches, and events
- **Reminders** - Set follow-up reminders with due dates and completion tracking
- **Notes** - Attach notes to contacts with pinning support
- **Tags** - Organize contacts with color-coded tags
- **Global Search** - Search across contacts, notes, interactions, and reminders (Cmd/Ctrl+K)
- **Advanced Filtering** - Filter contacts by tags, company, date range, and reminder status
- **Sorting** - Sort contacts by name, email, company, or date with URL persistence

> **Development Progress**: See [ROADMAP.md](./ROADMAP.md) for phase-by-phase tracking.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd fph-crm
npm install

# 2. Configure environment
# Create server/.env:
DATABASE_URL="postgresql://user:password@localhost:5432/fph_crm"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# 3. Set up database
cd server
npm run prisma:migrate

# 4. Start development servers
make dev
# Or separately:
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs
- Database GUI: `make db-studio`

## Project Structure

```
fph-crm/
├── client/               # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Route pages
│       ├── hooks/        # Custom hooks
│       ├── lib/          # API client
│       └── types/        # TypeScript types
├── server/               # Express backend
│   ├── src/
│   │   ├── routes/       # API routes (with Swagger docs)
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   └── test/         # Unit & integration tests
│   └── prisma/           # Database schema & migrations
├── postman/              # API testing collection
├── ROADMAP.md            # Development progress
└── Makefile              # Common commands
```

## Common Commands

```bash
make dev            # Start client + server
make test           # Run backend tests
make test-coverage  # Tests with coverage report
make db-studio      # Open Prisma Studio
make build          # Production build
```

Run `make help` for all available commands.

## API Reference

Full interactive documentation at **http://localhost:3001/api-docs** (Swagger UI)

### Key Endpoints

| Resource | Endpoints |
|----------|-----------|
| **Contacts** | `GET/POST /api/contacts`, `GET/PUT/DELETE /api/contacts/:id` |
| **Search** | `GET /api/search?q=query` (global), `GET /api/contacts/search?q=query` |
| **Interactions** | `GET/POST /api/contacts/:id/interactions`, `GET/PUT/DELETE /api/interactions/:id` |
| **Reminders** | `GET /api/reminders`, `/upcoming`, `/overdue`, `PATCH /:id/complete` |
| **Notes** | `GET/POST /api/contacts/:id/notes`, `PATCH /api/notes/:id/pin` |
| **Tags** | `GET/POST /api/tags`, `GET /api/tags/:id/contacts` |

### Contact Filtering & Sorting

```
GET /api/contacts?tags=id1,id2&company=Acme&hasReminders=true&sortBy=name&sortOrder=desc
```

Parameters: `tags`, `company`, `createdAfter`, `createdBefore`, `hasReminders`, `hasOverdueReminders`, `sortBy`, `sortOrder`

## Testing

```bash
cd server && npm test           # Run all tests
cd server && npm run test:watch # Watch mode
cd server && npm run test:coverage
```

Coverage: 358 tests across Contact, Tag, Interaction, Reminder, Note, and Search APIs.

## License

MIT

---

**Current Phase**: 6 - Enhanced UI/UX & Search (6.1-6.5 Complete) | See [ROADMAP.md](./ROADMAP.md)
