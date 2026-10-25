# TaskFlow

TaskFlow is a full-stack task management application for teams to plan work, track progress, and manage deadlines with clear permissions and automation.

## Features

- Email/password registration and JWT-based login
- Public signup creates standard users only; a one-time admin bootstrap key can create the first admin
- Server-enforced task access rules for admins, creators, and assignees
- Create, assign, update, filter, search, and delete tasks
- List and Kanban task views with drag-and-drop status updates
- Dashboard analytics for workload and task status
- Task comments and activity tracking
- Automated reminder emails for tasks due in the next 24 hours
- CSV export of the current filtered task list
- Docker Compose setup and OpenAPI API docs

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Authentication: JWT and bcryptjs
- Email: Resend

## Project structure

```text
.
├── backend/                  # Express + MongoDB API
│   ├── src/                 # TypeScript source
│   ├── tests/               # Backend permission / behavior tests
│   ├── package.json         # Backend scripts and dependencies
│   └── .env                 # Local environment variables
├── frontend/                # React + Vite client
│   ├── src/                 # Frontend app source
│   ├── package.json         # Frontend scripts and dependencies
│   └── .env                 # Optional local frontend settings
├── docs/
│   └── openapi.yaml         # OpenAPI specification
├── docker-compose.yml       # MongoDB + backend + frontend stack
├── README.md                # Project documentation
└── .gitignore
```

## Requirements

- Node.js 22+
- npm
- MongoDB (local or Atlas)
- A Resend API key and a verified sender address for reminder emails

## Local development

### 1) Configure backend environment

Create `backend/.env` and add the following values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task-management
JWT_SECRET=your-long-random-jwt-secret
JWT_EXPIRES_IN=1d
ADMIN_SETUP_KEY=your-unique-random-secret-of-at-least-32-characters
RESEND_API_KEY=re_your_resend_api_key
REMINDER_FROM_EMAIL=TaskFlow <reminders@your-verified-domain.com>
```

Generate a secure admin setup key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Notes:
- Keep secrets in `backend/.env` or your deployment secret manager.
- Never store secrets in a `VITE_` variable.
- Reminder emails are disabled unless both `RESEND_API_KEY` and `REMINDER_FROM_EMAIL` are configured.

### 2) Configure the frontend (optional)

If you want to point the frontend at a custom API base URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

If this file does not exist, the frontend uses `http://localhost:5000/api` by default.

### 3) Install and run

Start the API:

```bash
cd backend
npm ci
npm run dev
```

In a second terminal, start the frontend:

```bash
cd frontend
npm ci
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

The backend health endpoint is:

```text
http://localhost:5000/health
```

### 4) Create the first admin

1. Set a strong `ADMIN_SETUP_KEY` in `backend/.env` and restart the backend.
2. Open `/setup-admin` in the frontend.
3. Enter the admin details and the same setup key.
4. The backend creates the first admin and permanently closes bootstrap.

If an admin already exists, the bootstrap route is unavailable. Public registration always creates a regular user account, not an admin.

## Docker

From the project root, run:

```bash
docker compose up --build
```

This starts:
- the backend on `http://localhost:5000`
- the frontend on `http://localhost:8080`
- MongoDB with a persistent `mongo-data` volume

The Docker backend uses the Compose MongoDB container automatically via `MONGO_URI`. You can override the frontend API URL with a `VITE_API_URL` build arg or environment variable if needed.

## API overview

The API base path is `/api`. Protected routes require an `Authorization` bearer token.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a standard user |
| `POST` | `/auth/login` | Authenticate a user or admin |
| `GET` | `/auth/me` | Get the current authenticated user |
| `GET` | `/auth/admin-setup-status` | Check whether first-admin setup is still available |
| `POST` | `/auth/setup-admin` | Bootstrap the first admin |
| `GET` | `/users` | List users for task assignment |
| `GET`, `POST` | `/tasks` | List or create tasks |
| `GET`, `PUT`, `DELETE` | `/tasks/:id` | Read, update, or delete a task |
| `GET`, `POST` | `/tasks/:id/comments` | List or add comments to an accessible task |

Authorization is enforced on the backend. Users can access tasks they created or tasks they are assigned to; assignees can update task status; creators can edit or delete their own tasks; admins can manage all tasks.

The full OpenAPI specification is available in [`docs/openapi.yaml`](docs/openapi.yaml).

## Scripts

| Directory | Command | Description |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the API in development |
| `backend` | `npm run build` | Compile the TypeScript backend |
| `backend` | `npm test` | Build and run the backend test suite |
| `backend` | `npm start` | Run the compiled backend |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Type-check and build the frontend |
| `frontend` | `npm run lint` | Lint the frontend |
| `frontend` | `npm run preview` | Preview the production frontend build |

No live deployment URL or demo account is configured in this repository.
