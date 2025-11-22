# Colly - Personal Productivity App

A full-stack application with a Next.js backend and React frontend, featuring authentication, routines, budgets, events, wellness tracking, and flashcards.

## Project Structure

- `backend/` - Next.js API server with tRPC
- `frontend/web-veil-maker/` - React frontend with Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis (optional, for rate limiting)

### Install Dependencies

```bash
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend/web-veil-maker && npm install
```

### Environment Variables

#### Backend

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/colly
JWT_SECRET=your-secret-key-here-change-in-production
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

**Important:** Set a strong `JWT_SECRET` in production!

#### Frontend

No environment variables needed. The frontend is configured to connect to `http://localhost:3000/api/trpc`.

### Database Setup

1. Start PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE colly;
   ```
3. Run migrations:
   ```bash
   cd backend
   npm run db:push
   # or
   npm run db:migrate
   ```

### Run Both Frontend and Backend

From the root directory:

```bash
npm run dev
```

This will start:
- Backend on `http://localhost:3000`
- Frontend on `http://localhost:8080`

### Run Individually

**Backend only:**
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

**Frontend only:**
```bash
npm run dev:frontend
# or
cd frontend/web-veil-maker && npm run dev
```

## Features

- 🔐 **Authentication** - JWT-based auth with signup/login
- 📊 **Dashboard** - Overview of all your data
- 📅 **Routines** - Weekly recurring routines
- 💰 **Budgets** - Budget categories, monthly budgets, and transaction tracking
- 🎉 **Events** - Calendar events with dates, times, and locations
- 💪 **Wellness** - Track mood, sleep, water intake, and notes
- 📚 **Flashcards** - Create decks and study with quiz mode

## API

The backend uses tRPC for type-safe APIs. All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Development

### Backend Commands

```bash
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm test             # Run tests
```

### Frontend Commands

```bash
cd frontend/web-veil-maker
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Tech Stack

### Backend
- Next.js 16
- tRPC
- Drizzle ORM
- PostgreSQL
- JWT Authentication
- Redis (rate limiting)

### Frontend
- React 18
- Vite
- tRPC React Query
- React Router
- Tailwind CSS
- shadcn/ui components

## License

MIT
