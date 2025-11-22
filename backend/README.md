# Colly – College Life Management App

## Overview
Colly is a full‑stack application that helps students manage their academic life, finances, wellness, and study resources. The backend is built with **Node.js**, **tRPC**, **Drizzle ORM**, **PostgreSQL**, and **Redis**. It provides a type‑safe, high‑performance API that can be consumed by any frontend (React, Next.js, mobile, etc.).

---

## Backend Setup Guide

### Prerequisites
- **Node.js** v18 or higher
- **Docker** & **Docker Compose** (recommended for quick start)
- **Git**
- **pnpm** (optional, but works with npm as well)

### 1️⃣ Quick Start with Docker (recommended)
```bash
# Clone the repo and cd into the project
git clone https://github.com/arpan404/colly.git && cd colly

# Run the automated setup script (creates .env and starts containers)
./setup.sh
```
The script will:
1. Copy `.env.example` to `.env`
2. Build and start PostgreSQL & Redis containers (`docker compose up -d`)
3. Install npm dependencies
4. Run database migrations
5. Start the development server (`npm run dev`)

You can now access the API at `http://localhost:3000/api/trpc`.

### 2️⃣ Manual Setup (without Docker)
If you prefer to run PostgreSQL and Redis locally:
```bash
# Install dependencies
npm install

# Create .env from the example
cp .env.example .env
```
Edit `.env` with your local connection strings:
```dotenv
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/colly"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="<your‑strong‑secret>"
BCRYPT_ROUNDS=12   # adjust for CI vs production
```
#### Database migration
```bash
# Generate migration files (if you change the schema)
npm run db:generate
# Apply migrations
npm run db:migrate
```
#### Run the server
```bash
npm run dev
```
The server will be available at `http://localhost:3000`.

---

## Authentication & Authorization
The API uses **JWT** for stateless authentication.
- **Signup** – `auth.signup` creates a user and returns a JWT.
- **Login** – `auth.login` validates credentials and returns a JWT.
- Every protected procedure expects the token in the `Authorization` header:
```
Authorization: Bearer <your‑jwt‑token>
```
The token expires in **7 days** and is signed with the `JWT_SECRET` environment variable.

---

## API Reference
All procedures are exposed under the **tRPC** router at `/api/trpc`. Below is a concise reference with example `curl` commands.

### Base URL
```
http://localhost:3000/api/trpc
```

### Frontend (Coming Soon)
The frontend will be built later using React and Next.js. Data fetching will be handled with **React TanStack Query**. The API endpoints are ready for consumption by any client.
### Authentication
#### Signup
Call the `auth.signup` procedure with a JSON payload containing `email`, `password`, and optional `name`. The procedure returns an object with a JWT token, e.g., `{ "token": "<jwt>" }`.
#### Login
Call the `auth.login` procedure with a JSON payload containing `email` and `password`. The procedure returns an object with a JWT token, e.g., `{ "token": "<jwt>" }`.
Both endpoints return `{ "token": "<jwt>" }`.

### User Management
### User Management
- `user.get`: Requires an authenticated request (Authorization header). Returns the current user's basic info (id, email, name).
- `user.profile.get`: Authenticated request. Returns the user's profile details.
- `user.profile.update`: Authenticated request with JSON body containing fields to update (e.g., `name`). Returns the updated profile.
- `user.preferences.get`: Authenticated request. Returns user preference settings.
- `user.preferences.update`: Authenticated request with JSON body (e.g., `{ "theme": "dark" }`). Returns the updated preferences.

### Dashboard
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/trpc/dashboard.get
```
Returns a JSON payload containing:
- `budgetSummary` (total budget & spent for the current month)
- `upcomingEvents`
- `recentFlashcards`
- `wellnessSummary`

### Routines
| Procedure | Method | Example |
|-----------|--------|---------|
| `routines.get` | GET | `curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/trpc/routines.get` |
| `routines.create` | POST | `curl -X POST -H "Authorization: Bearer $TOKEN" -d '{"title":"Gym","dayOfWeek":1,"startTime":"07:00"}' http://localhost:3000/api/trpc/routines.create` |
| `routines.update` | POST | `curl -X POST -H "Authorization: Bearer $TOKEN" -d '{"id":"r1","title":"Morning Yoga"}' http://localhost:3000/api/trpc/routines.update` |
| `routines.delete` | POST | `curl -X POST -H "Authorization: Bearer $TOKEN" -d '{"id":"r1"}' http://localhost:3000/api/trpc/routines.delete` |

### Budgets & Transactions
- **Categories**: `budgets.categories.get`, `budgets.categories.create`
- **Budgets**: `budgets.get` (requires `{ month, year }`), `budgets.create`
- **Transactions**: `budgets.transactions.get`, `budgets.transactions.create`

### Events
- `events.get` – optional `{ startDate, endDate, includePublic }`
- `events.create`, `events.update`, `events.delete`

### Wellness
- `wellness.logs.get`, `wellness.logs.create`, `wellness.logs.update`

### Flashcards
- Decks: `flashcards.decks.get`, `flashcards.decks.create`
- Cards: `flashcards.get`, `flashcards.create`, `flashcards.update`
- Quiz results: `flashcards.quiz.result.create`

---

## 🗄️ Database Schema Overview
The core tables are defined in `src/db/schema.ts` and managed by **Drizzle Kit**.
- `users` – authentication data
- `user_preferences` – UI/theme settings
- `events` – calendar events
- `routines` – weekly schedule entries
- `budget_categories` & `budgets` – budgeting structure
- `transactions` – expense/income records
- `wellness_logs` – daily health metrics
- `flashcard_decks` & `flashcards` – study cards
- `quiz_results` – quiz performance tracking

Run `npm run db:generate` after schema changes and `npm run db:migrate` to apply.

---

## 🧪 Testing Guide
The project uses **Vitest** for unit and integration tests.
```bash
# Run tests in watch mode (default)
npm test

# Run once (CI)
npm run test:run

# Generate coverage report
npm run test:coverage
```
All tests run against an isolated test database and clean up automatically.

---

## 📦 Scripts Overview
| Script | Description |
|--------|-------------|
| `dev` | Starts the dev server with hot reload |
| `build` | Compiles TypeScript for production |
| `lint` | Runs ESLint + Prettier |
| `docker:up` | Starts PostgreSQL & Redis containers |
| `docker:down` | Stops containers |
| `db:generate` | Generates migration files |
| `db:migrate` | Applies pending migrations |
| `test` / `test:run` / `test:coverage` | Vitest commands |

---

## 📖 Further Reading
- **tRPC Documentation** – https://trpc.io/docs
- **Drizzle ORM** – https://orm.drizzle.team/
- **JWT Best Practices** – https://jwt.io/introduction/
- **Docker Compose Reference** – https://docs.docker.com/compose/

---

## 🎉 Contributing
Feel free to open issues or submit PRs. Follow the contribution guidelines in `CONTRIBUTING.md`.

---

## License
MIT © 2025 Colly Team
