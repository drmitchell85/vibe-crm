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
- pnpm (package manager)
- ESLint + Prettier (code quality)
- Monorepo structure

## Features

### Current Features
- Contact Management (CRUD operations)

### Planned Features
- Interaction Tracking
- Reminders & Follow-ups
- Notes & Tagging
- Search & Filtering
- Data Import/Export
- Dashboard with Analytics

## Implementation Progress

### Phase 1: Foundation & Basic Contact Management 🔄 IN PROGRESS
**Started**: 2025-12-18

- [ ] Project setup (monorepo, dependencies)
- [ ] Database schema for contacts
- [ ] Backend API for contact CRUD
- [ ] Frontend contact list and detail pages
- [ ] Basic styling with Tailwind

**Deliverable:** Working contact CRUD system with database

---

### Phase 2: Interaction Tracking ⏳ PENDING

**Tasks:**
- [ ] Interaction database model
- [ ] Backend API for interactions
- [ ] Interaction timeline UI
- [ ] Multiple interaction types (call, meeting, email, text, coffee, lunch, event)
- [ ] Filters and sorting

**Deliverable:** Full interaction logging with timeline view

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

## Development Workflow

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173`
- Database GUI: `npm run prisma studio` (from `/server` directory)

## API Endpoints

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

More endpoints will be added in subsequent phases.

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

**Last Updated**: 2025-12-18
**Current Phase**: Phase 1 - Foundation & Basic Contact Management
**Status**: 🔄 IN PROGRESS
