# Daymark — Task Manager

A focused, responsive task-management dashboard built for the Hammoq Infosystems Pvt. Ltd. MERN Stack Developer assessment. Daymark keeps task data in MongoDB and exposes it through a validated Express API; the React client never uses hardcoded demo tasks.

## Features

- Create, edit, delete (with confirmation), and complete/reopen tasks.
- Task title, optional description and due date, and Low / Medium / High priority.
- Search titles and descriptions; filter by status and priority.
- Sort by creation or due date, with server-side pagination.
- Total, pending, and completed statistics; loading, empty, success, and error states.
- Responsive desktop/mobile layout and keyboard-accessible labelled forms.
- Server-side input validation, strict field allow-list, CORS, body-size limit, centralized error responses, and safe handling of invalid IDs.

## Technology

- **Client:** React 18, Vite, JavaScript, Axios, Lucide React, CSS.
- **Server:** Node.js, Express 4, Mongoose 8, MongoDB, dotenv, cors.
- **Tests:** Node's built-in test runner, Supertest, and an isolated `mongodb-memory-server` database.

## Project structure

```text
client/
  src/components/     Reusable stats, form, task card, and toolbar
  src/services/       Axios API client
  src/utils/          Date helpers
  src/App.jsx         Dashboard and task interactions
  src/index.css       Responsive design system
server/
  src/config/         MongoDB connection
  src/controllers/    Task CRUD, query parsing, and validation
  src/middleware/     Centralized HTTP errors
  src/models/         Mongoose Task model
  src/routes/         REST routes
  tests/              API tests using an ephemeral MongoDB instance
```

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended) and npm.
- A local MongoDB server, or a MongoDB Atlas database and connection URI.
- Network access on the first test run so `mongodb-memory-server` can download its MongoDB binary if it is not cached.

## Install and configure

From the repository root:

```bash
npm install
```

Create local environment files by copying `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Never commit `.env` files. Example values:

```dotenv
# server/.env
MONGODB_URI=mongodb://127.0.0.1:27017/daymark
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

```dotenv
# client/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

`CLIENT_ORIGIN` accepts a comma-separated allow-list if the UI is served from more than one known origin. `VITE_API_BASE_URL` is public client configuration, not a secret. Restart Vite after changing it.

### MongoDB Atlas

1. Create a cluster and a database user in Atlas.
2. In Network Access, allow the development machine's IP address; avoid opening access to all IPs for production.
3. Select **Connect → Drivers**, copy the Node.js URI, replace the password placeholder, and use the database name `daymark`.
4. Put the URI in `server/.env` as `MONGODB_URI`. URL-encode special characters in the database password.

The API intentionally exits with a clear startup error if `MONGODB_URI` is missing or the database cannot be reached; it does not pretend to serve persisted data while disconnected.

## Run locally

Start both API and frontend from the root:

```bash
npm run dev
```

Or in separate terminals:

```bash
npm run dev --workspace server
npm run dev --workspace client
```

The Vite UI is at `http://localhost:5173`; the API listens on `http://localhost:5000` by default. Check database/API health at `http://localhost:5000/api/health`.

## REST API

Successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }`. A task contains `title`, `description`, `priority`, `status`, `dueDate`, `createdAt`, and `updatedAt`.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/health` | API and database connectivity; returns 503 when MongoDB is unavailable. |
| GET | `/api/tasks` | List tasks with stats and pagination metadata. |
| GET | `/api/tasks/:id` | Fetch one task. |
| POST | `/api/tasks` | Create a task; title is required. |
| PATCH | `/api/tasks/:id` | Partially update allowed task fields. |
| DELETE | `/api/tasks/:id` | Delete a task. |

`GET /api/tasks` query parameters:

- `search`: case-insensitive title/description search (max 100 characters).
- `status`: `Pending` or `Completed`.
- `priority`: `Low`, `Medium`, or `High`.
- `sort`: `createdAt:asc`, `createdAt:desc` (default), `dueDate:asc`, or `dueDate:desc`.
- `page`: positive integer (default 1); `limit`: 1–100 (default 50).

Response data includes `tasks`, global `stats` (`total`, `pending`, `completed`), and filtered-result `pagination` (`page`, `limit`, `total`, `pages`). Unknown write fields and invalid query values are rejected.

## Tests and production build

```bash
npm test
npm run build
```

Tests use a temporary in-memory MongoDB, never the configured application database. The production client output is written to `client/dist`.

## Deployment

- **Backend:** Deploy `server` on a Node.js host, set `MONGODB_URI`, `PORT` as required by the host, and `CLIENT_ORIGIN` to the deployed frontend origin. Build/start command from the repository root: `npm install` then `npm start` (or set the host root to `server` and use `npm start` there).
- **Frontend:** Build the `client` workspace with `npm run build --workspace client`; publish `client/dist` on a static host. Set `VITE_API_BASE_URL` at build time to the deployed API's `/api` base URL. Configure the API CORS allow-list to match the frontend origin.
- Use TLS, secret storage, restricted database network access, and monitoring at the hosting layer. No deployment URL is assumed or included.

## Manual testing checklist

- [ ] Create a task with only a title; confirm default Medium priority and Pending status.
- [ ] Create a task with description, priority, and due date; confirm values render.
- [ ] Edit the title/details/date; confirm the list and counts refresh.
- [ ] Complete then reopen a task; confirm status filter and counts update.
- [ ] Delete a task and cancel a separate deletion at the confirmation prompt.
- [ ] Search by title and description; combine with status/priority filters.
- [ ] Sort by oldest/newest and due date; exercise empty states.
- [ ] Try blank/overlength input and confirm visible validation.
- [ ] Stop MongoDB/API and confirm startup or client errors are clear and recoverable.
- [ ] Check narrow mobile viewport and keyboard navigation for task form controls.

## Assessment submission checklist

- [ ] Verify `ASSESSMENT_NOTES.md` accurately reflects the final code and personalize the draft responses.
- [ ] Run `npm test` and `npm run build` locally and record only actual results.
- [ ] Confirm `.env` files and credentials are not staged; configure deployment environment values.
- [ ] Replace no URLs with guesses: add repository/deployment links only after creating them.
- [ ] Review the manual test checklist and submit any requested assessment materials.

## Known limitations

- This assessment build is intentionally single-workspace and has no authentication or per-user access control.
- Task statistics are global to this deployment; do not expose the API publicly with private data without adding authentication/authorization.
- The UI fetches the first 50 matching tasks; the API offers further pages, but the current UI does not include page navigation.
- Due dates are date-only in the UI but represented as MongoDB dates; deployments across time zones should review the chosen date semantics.
- Automated tests require a MongoDB binary download on first run unless one is already cached.

## Future improvements

Add secure authentication and ownership-scoped queries, explicit pagination controls, accessibility/browser integration tests, a deliberate timezone/date-only representation, and deployment monitoring/rate limiting.
