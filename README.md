# TaskFlow

TaskFlow is a full-stack task management system for tracking work, organizing team tasks, and monitoring deadlines.

## Features

- Email/password registration and login with JWT authentication
- Public signup is always user-only; a server-validated key can bootstrap the first admin once
- Role-aware dashboard and server-enforced task permissions
- Create, assign, edit, filter, search, and delete tasks
- List and Kanban views with drag-and-drop status changes
- Dashboard task statistics and charts
- Comments and activity on tasks
- Resend email reminders for tasks due in the next 24 hours (checked hourly)
- CSV export of the currently filtered task list
- Docker Compose setup and OpenAPI specification

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
- **Authentication:** JWT and bcrypt
- **Email:** Resend API

## Requirements

- Node.js 22+ and npm
- MongoDB (local or MongoDB Atlas)
- A Resend API key and a verified sender address for email reminders

## Local setup

### Configure the backend

Copy `backend/.env.example` to `backend/.env`, then set the values for your environment:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task-management
JWT_SECRET=your-long-random-jwt-secret
JWT_EXPIRES_IN=1d
ADMIN_SETUP_KEY=your-unique-random-secret-of-at-least-32-characters
RESEND_API_KEY=re_your_resend_api_key
REMINDER_FROM_EMAIL=TaskFlow <reminders@your-verified-domain.com>
```

Generate a suitable setup key locally with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep backend secrets only in `backend/.env` or your deployment's secret manager. Never use a `VITE_` variable for secrets. Reminders are disabled unless both Resend variables are configured.

### Install and run

In one terminal:

```bash
cd backend
npm ci
npm run dev
```

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend defaults to `http://localhost:5000/api`. To change it, create `frontend/.env` and set `VITE_API_URL`. Open the Vite URL shown in the terminal. The backend health endpoint is `http://localhost:5000/health`.

### Create the first admin

1. Set `ADMIN_SETUP_KEY` in `backend/.env` to a unique random value of at least 32 characters and restart the backend.
2. Open `/setup-admin` in the frontend, then enter the account details and the same setup key.
3. The backend creates the first admin and permanently closes bootstrap in the database. Admin setup can only run once.

If an admin already exists, bootstrap is unavailable. Public registration ignores any requested role and creates only regular users. Admins and users sign in through the same login page.

## Docker

Create and configure `backend/.env` as above, then from the project root:

```bash
docker compose up --build
```

Open `http://localhost:8080`. The API is exposed on `http://localhost:5000`; MongoDB data is persisted in the `mongo-data` volume. The frontend API URL can be changed with the `VITE_API_URL` build argument/environment variable. The backend Compose service overrides `MONGO_URI` to use the Compose MongoDB container.

## API

The API base path is `/api`; protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a regular user |
| `POST` | `/auth/login` | Authenticate any account |
| `GET` | `/auth/me` | Get the authenticated account |
| `GET` | `/auth/admin-setup-status` | Check first-admin setup availability |
| `POST` | `/auth/setup-admin` | One-time first-admin bootstrap |
| `GET` | `/users` | List team members for task assignment |
| `GET`, `POST` | `/tasks` | List or create tasks |
| `GET`, `PUT`, `DELETE` | `/tasks/:id` | Read, update, or delete a task |
| `GET`, `POST` | `/tasks/:id/comments` | List or add comments to an accessible task |

Users can access tasks they created or are assigned. Assignees can update task status; creators can edit/delete their own tasks; admins can access and manage all tasks. The frontend role-specific navigation is convenience only—the API performs authorization independently.

The full OpenAPI 3 specification is in [`docs/openapi.yaml`](docs/openapi.yaml).

## Scripts

| Directory | Command | Description |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the API in development |
| `backend` | `npm run build` | Compile the TypeScript API |
| `backend` | `npm test` | Build and run backend permission tests |
| `backend` | `npm start` | Run the compiled API |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Type-check and build the frontend |
| `frontend` | `npm run lint` | Lint the frontend |
| `frontend` | `npm run preview` | Preview the production frontend build |

No live deployment URL or demo account is configured in this repository.
