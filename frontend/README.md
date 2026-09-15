# Duty Frontend

Web client for the Duty to-do list, built with React and TypeScript in strict mode using Vite. Pure client-side app — no server-side rendering, no Next.js.

## Prerequisites

- Node.js 18 or later
- npm
- The [backend](../backend/README.md) running and reachable (defaults to `http://localhost:3000/api`)

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

(On Windows without Git Bash/WSL, use `copy .env.example .env` instead of `cp`.)

Edit `.env` if the backend runs somewhere other than `http://localhost:3000/api`.

## Running

```bash
npm run dev       # starts the Vite dev server with hot reload
npm run build     # type-checks and builds a production bundle to dist/
npm run preview   # serves the production build locally
```

Vite prints the local URL to open (`http://localhost:5173` by default).

## Testing

```bash
npm test
```

Runs Jest with React Testing Library — component and hook tests only, no browser or backend required (network calls are mocked).

## Architecture

```
src/
├── main.tsx                # React root, wraps the app in antd's ConfigProvider
├── App.tsx
├── config/env.ts            # reads VITE_API_BASE_URL, isolated so it can be mocked in Jest
├── types/duty.ts            # the Duty shape shared with the backend's API contract
├── services/
│   ├── ApiError.ts          # typed error thrown by dutiesApi, mirrors the backend's error shape
│   └── dutiesApi.ts         # the only place that calls fetch()
├── hooks/useDuties.ts        # single source of truth for the duty list (state via useState only)
├── components/
│   ├── DutyForm/             # create/edit form, client-side validation
│   ├── DutyList/              # renders the list, empty state
│   ├── DutyItem/              # one row: inline edit, delete with confirmation
│   └── ErrorAlert/            # shown when the initial fetch fails, with a retry action
└── pages/DutiesPage.tsx      # composes useDuties() with the components above
```

`useDuties` is the only hook that talks to the API. Every component below it receives data and callbacks as props — no component fetches on its own. State management is plain `useState` (no `useReducer`, no Redux); Ant Design's `Form` component manages its own internal field state, which is the UI library's own concern rather than an application-level state management solution.

## Screenshot

See the root [README](../README.md) for a screenshot of the running app.
