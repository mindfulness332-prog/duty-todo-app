# Duty Backend

REST API for the Duty to-do list, built with Node.js, Express, and TypeScript in strict mode. Data is stored in PostgreSQL and accessed with plain SQL through the `pg` driver — no ORM, no query builder.

## Prerequisites

- Node.js 20.6 or later (uses the built-in `--env-file` flag to load `.env`, no `dotenv` dependency needed)
- npm
- A PostgreSQL 16 database, reachable via a connection string. Two ways to get one locally:
  - **Docker** (recommended, works the same on Windows/macOS/Linux): see the root [README](../README.md) or just run `docker compose up -d db` from the repository root.
  - **A native PostgreSQL install**: create a database, then run the SQL in [`db/init/001_init.sql`](db/init/001_init.sql) against it once.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

(On Windows without Git Bash/WSL, use `copy .env.example .env` instead of `cp`.)

Edit `.env` if your database connection string differs from the default (it matches the root `docker-compose.yml` out of the box).

## Running

```bash
npm run dev      # starts the API with hot reload (tsx)
npm run build    # type-checks and compiles to dist/
npm start        # runs the compiled build (after npm run build)
```

The server listens on the port from `PORT` in `.env` (default `3000`).

## Testing

```bash
npm test               # unit tests — no database required
npm run test:integration   # integration tests — requires a running database (see Prerequisites)
```

## API

All responses are JSON. Successful responses wrap their payload in `{ "data": ... }`; errors use `{ "error": { "code", "message", "details"?, "requestId"? } }`.

| Method | Path              | Description          | Body            |
| ------ | ----------------- | --------------------- | --------------- |
| GET    | `/api/duties`     | List all duties        | —               |
| POST   | `/api/duties`     | Create a duty          | `{ "name": string }` |
| PUT    | `/api/duties/:id` | Update a duty's name   | `{ "name": string }` |
| DELETE | `/api/duties/:id` | Delete a duty          | —               |
| GET    | `/health`         | Liveness check         | —               |
| GET    | `/health/db`      | Database readiness check | —             |

`name` must be a non-empty string (after trimming) of at most 200 characters. `id` must be a valid UUID.

## Architecture

```
src/
├── index.ts       # process bootstrap: listen(), graceful shutdown
├── app.ts         # Express app factory: wires middleware and routes together
├── config/        # environment variable loading and validation
├── db/            # PostgreSQL connection pool
├── errors/        # typed application errors (ValidationError, NotFoundError, ...)
├── middlewares/    # request id, request logging, CORS, error handling
├── health/        # liveness/readiness endpoints
└── modules/
    └── duties/    # routes -> controller -> service -> repository, one file per layer
```

Each layer only talks to the one below it: controllers never touch SQL, and the repository never touches HTTP. This keeps each piece independently testable and makes it straightforward to add another module (e.g. a new resource) following the same pattern.
