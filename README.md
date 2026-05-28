Assessment answers: see [ANSWERS.md](./ANSWERS.md).

# check live preview - https://persistent-todo-app-livid.vercel.app/

# Persistent Tasks — Dev Weekends Assessment

A full-stack todo app built with **Next.js** (App Router) and **MongoDB**. Tasks persist across server restarts: create items, stop the app, start it again, and your data is still there.

## Prerequisites

- [Node.js](https://nodejs.org/) 22.20.0
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

## Quick start (fresh machine)

```bash
cd persistent_todo_app
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### MongoDB locally

Start MongoDB, then use the default URI in `.env.example`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/devweekends_todos
```

### MongoDB Atlas

Replace `MONGODB_URI` in `.env.local` with your Atlas connection string.

### SEO base URL (recommended)

For correct canonical/robots/sitemap URLs in production, set:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Production build

```bash
npm run build
npm start
```

## Features

- **CRUD** — create, read, update, delete todos
- **Persistence** — MongoDB via Mongoose
- **Beyond plain CRUD** — priority levels, due dates with overdue highlighting, status filters (All / Active / Completed), and text search
- **Technical SEO** — metadata, canonical tags, OpenGraph/Twitter cards, `robots.txt`, `sitemap.xml`, and `manifest.webmanifest`

## API

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/todos` | List todos (`?status=`, `?priority=`, `?q=`) |
| `POST` | `/api/todos` | Create a todo |
| `GET` | `/api/todos/:id` | Get one todo |
| `PATCH` | `/api/todos/:id` | Update a todo |
| `DELETE` | `/api/todos/:id` | Delete a todo |

## Project structure

```
src/
  app/api/todos/     # REST API routes
  components/        # React UI
  lib/               # DB connection, validation, helpers
  models/            # Mongoose schema
```
