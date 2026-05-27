# Dev Weekends Fellowship 2026 — Technical Assessment Answers

## 1. How to run

**Prerequisites:** Node.js 22.20.0, MongoDB (local or Atlas).

```bash
cd persistent_todo_app
cp .env.example .env.local
npm install
npm run dev
```

Then open **http://localhost:3000**.

- **Local MongoDB:** ensure `mongod` is running; `.env.example` already points to `mongodb://127.0.0.1:27017/devweekends_todos`.
- **Atlas:** set `MONGODB_URI` in `.env.local` to your cluster connection string.

**Production:**

```bash
npm run build && npm start
```

To verify persistence: add tasks → stop the dev server (`Ctrl+C`) → run `npm run dev` again → tasks remain.

---

## 2. Stack choice

**Chosen:** Next.js 16 (App Router) + React + MongoDB (Mongoose) + Tailwind CSS.

**Why this stack**

- **Next.js** gives one repo for UI and API (`/api/todos`), which matches how I build small products: fast to run, easy to deploy, no separate backend boilerplate.
- **MongoDB** fits document-shaped todos (title, description, priority, due date) and satisfies the persistence requirement without ORM migration overhead for an assessment-sized app.
- **Mongoose** adds schema validation at the DB layer and a stable connection pattern for serverless-style route handlers.

**Worse choice: JSON file on disk**

- Concurrent writes from multiple API requests can corrupt or lose data without file locking.
- No query/index support for search and filters.
- Harder to evolve fields (priority, due dates) safely than with a schema.

**Worse choice: SQLite + separate Express API**

- Valid and simple, but two processes (API + Next frontend) and more wiring for the same CRUD scope. Next.js API routes keep the submission self-contained with one `npm run dev`.

---

## 3. One real edge case

**Edge case:** A client calls `PATCH /api/todos/not-a-valid-id` with a malformed ID.

**Handling:** `isValidObjectId()` in `src/lib/validation.js` (lines 7–9) rejects strings that are not valid 24-character hex ObjectIds. The route handler returns **400 Bad Request** before hitting the database:

```16:18:src/app/api/todos/[id]/route.js
  if (!isValidObjectId(id)) {
    return errorResponse("invalid todo id", 400);
  }
```

**Without this:** Mongoose would throw a `CastError` on `findByIdAndUpdate`, often surfacing as a **500** with a stack trace in logs—confusing for API consumers and hiding the real problem (bad input).

**Related:** `parseTitle()` (validation.js lines 21–28) rejects empty or whitespace-only titles so users cannot create blank todos.

---

## 4. AI usage

| Tool | What I asked | What it gave me | What I changed |
|------|----------------|-----------------|----------------|
| **Cursor** | Scaffold Next.js todo app with MongoDB CRUD, API validation, and assessment docs | Project structure, Mongoose model, API routes, React components, README/ANSWERS drafts | Tightened `isValidObjectId` to avoid false positives on arbitrary strings; moved `MONGODB_URI` check inside `connectDB()` so `next build` does not fail without env; chose overdue + priority as the defended “beyond CRUD” feature set |
| **Cursor** | Explain Next.js 16 `params` in route handlers | Note that `params` is a Promise in App Router | Used `const { id } = await params` in `[id]/route.js` |
| **MongoDB docs** (manual) | Connection pooling in Next.js | Official cached `mongoose` singleton pattern | Adapted to this repo’s `src/lib/mongodb.js` |

**Example change (why):** AI initially suggested throwing if `MONGODB_URI` is missing at **import** time. That breaks `next build` on CI/machines without `.env.local`. I moved the check to **runtime** inside `connectDB()` so builds succeed and only live API calls require the variable.

---

## 5. Honest gap

**Gap:** No automated tests (API or UI) and no `docker-compose.yml` to spin up MongoDB in one command.

**Fix with another day:**

1. Add **Vitest** + **mongodb-memory-server** tests for API validation (invalid ID, empty title, 404 on missing todo).
2. Add `docker-compose.yml` with a `mongo` service and document `docker compose up -d` in the README so reviewers never install MongoDB manually.
3. Optional: one Playwright smoke test (create todo → reload page → todo still visible).

---

## Beyond-basic-CRUD feature (defense)

**Feature:** **Due dates with overdue awareness**, plus **priority levels** and **smart list behavior** (filter by status + search).

Plain CRUD lets you store a due date as a string. This app **surfaces** it: incomplete tasks past their due date show an **Overdue** badge and rose border (`src/lib/todo-utils.js`, `src/components/TodoItem.jsx`). The API sorts by priority then due date so urgent work appears first (`src/app/api/todos/route.js`). Status tabs and search help once the list grows—behavior I actually want in a todo app, not just a database demo.
