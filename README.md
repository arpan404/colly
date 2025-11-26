# Colly — College Life Management Suite

Colly is a full-stack productivity app for students: routines, budgets, events, wellness tracking, and study tools — built to be fast, type-safe, and pleasant to use.

This README contains everything a developer needs to set up, run, test, extend, and deploy the app.

---

## Table of contents
- Features
- Architecture (frontend + backend)
- Quick setup (Docker) and manual setup
- Required environment variables
- Useful scripts
- API overview (tRPC)
- Frontend developer guide
- Database & migrations
- Testing
- Deployment
- Contributing
- License & attribution

---

## Features
- Weekly routines and visual calendar
- Budgeting: budgets, categories, and transactions
- Events and calendar integration
- Wellness logging and trend tracking
- Flashcards and study tools (decks, quiz, study sessions)
- Auth + protected routes (JWT) and solid UX patterns

These features are implemented in a modular way so you can add more apps or micro-features quickly.

---

## Architecture

Overview: Next.js (App Router) frontend with a tRPC API running alongside it — backed by PostgreSQL (Drizzle ORM) and Redis for caching and sessions.

Frontend
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS for utility-first styling
- shadcn/ui components (Radix primitives)
- React Query + tRPC for server-state and API calls

Backend
- tRPC router implemented inside the Next.js app routes
- Drizzle ORM (Postgres) for schema-first DB modeling
- Redis used for fast cache, rate-limits, and ephemeral state
- Auth via JWT + bcrypt for password hashing

Data layer: Database schema lives under `db/schema.ts` (Drizzle) — generate migrations with drizzle-kit.

---

## Quick start — recommended (Docker)

Prereqs: Node v18+, Docker & Docker Compose, Git

1) Clone and run setup script (recommended)

```bash
git clone https://github.com/arpan404/colly.git
cd colly
./setup.sh
```

What `setup.sh` does:
- copies `.env.example` -> `.env`
- `docker compose up -d` to boot PostgreSQL and Redis
- installs dependencies and runs migrations
- starts the dev server on http://localhost:3000

2) Manually if you prefer not to run the script:

```bash
git clone https://github.com/arpan404/colly.git
cd colly
npm install
cp .env.example .env
# edit .env for secrets
npm run dev
```

---

## Required environment variables

Copy `.env.example` and set your own values for local or CI. The important variables are:

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/colly"
DATABASE_URL_TEST="postgresql://postgres:password@localhost:5432/colly_test"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="<strong_random_secret_for_signing_tokens>"
BCRYPT_ROUNDS=12   # reduce in CI if needed
```

Notes:
- Keep `JWT_SECRET` secret and unique per environment.
- `DATABASE_URL_TEST` is used by tests.
- Adjust `BCRYPT_ROUNDS` for dev/test vs production (lower in tests to speed runs).

---

## Important scripts

Run these from project root:

```bash
npm run dev         # start Next dev server
npm run build       # build production assets
npm run start       # start production server
npm run lint        # lint using eslint
npm run db:generate # drizzle-kit generate migrations
npm run db:migrate  # apply migrations
npm run db:push     # push schema to DB
npm run db:studio   # open drizzle studio
```

Recommended testing scripts:

```bash
npm test            # vitest in watch mode
npm run test:run    # single test run (CI)
npm run test:coverage
```

---

## API overview (tRPC)

The app uses type-safe tRPC procedures mounted at `/api/trpc`. The Next.js frontend consumes these via the tRPC client in `lib/trpc-client.ts`.

Key procedure groups
- `auth.*` — signup/login, session management
- `user.*` — profile, preferences
- `routines.*` — get/create/update/delete routines
- `budgets.*` — categories, budgets, transactions
- `events.*` — calendar events CRUD
- `flashcards.*` — decks, cards, quizzes
- `wellness.*` — wellness logs CRUD

Example (frontend):

```ts
// client-side usage
const { data } = trpc.routines.get.useQuery();
const create = trpc.routines.create.useMutation();
```

Server procedure calls are fully typed via `lib/trpc-types.ts` and `trpc/router`.

---

## Frontend developer guide

Where to work:
- `app/` — pages and routing (App Router)
- `components/` — shared components & design system
- `components/ui/` — shadcn/ui components and overrides
- `lib/` — utilities, trpc client, and db connection

Tips
- Keep UI components small, accessible, and prop-driven
- Reuse shadcn patterns for consistent UX
- Use `trpc.*.useQuery` and `useMutation` for server interactions

---

## Database & migrations

Schema lives in `db/schema.ts`. Use drizzle-kit tooling:

```bash
npm run db:generate  # create a migration from schema changes
npm run db:migrate   # apply to DB
npm run db:push      # push schema directly (useful for local dev)
npm run db:studio    # open drizzle studio to inspect data
```

---

## Deployment

High-level steps for production:

1. Ensure production `DATABASE_URL` and `REDIS_URL` point to managed services.
2. Set `JWT_SECRET` and production `BCRYPT_ROUNDS` in environment.
3. Build and run the app:

```bash
npm run build
npm run start
```

Alternatively, containerize the app (Dockerfile) and deploy behind a process manager or platform (Vercel, Fly, Railway, etc.). Production also requires running migrations.

---

## Extending the project (developer notes)

- Add new tRPC procedure: create server logic under `trpc/` and expose it in the router
- Create React components under `components/` and re-use the `ui/` components for consistent design
- Keep business logic decoupled from UI – use hooks (e.g., `lib/trpc-client.ts`) for data fetching

---

## Troubleshooting

- DB connection issues: check `DATABASE_URL` & docker-compose logs (`docker compose logs -f`)
- Redis errors: verify `REDIS_URL` and container status
- Migrations failing: run `npm run db:generate` locally then `npm run db:migrate` with proper DB credentials

---

## Contributing

1. Fork the repo and create a feature branch
2. Add tests for new features or fixes
3. Run lint and tests
4. Open a PR with a clear description and screenshots if applicable

---

## License

MIT © 2025 Works On My End
