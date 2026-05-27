"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FilterBar from "./FilterBar";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dbError, setDbError] = useState("");

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setDbError("");

    const params = new URLSearchParams({ status: "all" });
    if (search.trim()) params.set("q", search.trim());

    try {
      const data = await request(`/api/todos?${params}`);
      setTodos(data.todos);
    } catch (error) {
      setDbError(error.message);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadTodos, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [loadTodos, search]);

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos],
  );

  const visibleTodos = useMemo(() => {
    if (status === "active") return todos.filter((t) => !t.completed);
    if (status === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, status]);

  async function createTodo(payload) {
    setBusy(true);
    try {
      const data = await request("/api/todos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTodos((prev) => [data.todo, ...prev]);
    } finally {
      setBusy(false);
    }
  }

  async function updateTodo(id, updates) {
    setBusy(true);
    try {
      const data = await request(`/api/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? data.todo : todo)),
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteTodo(id) {
    setBusy(true);
    try {
      await request(`/api/todos/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Dev Weekends Assessment</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Persistent Tasks
        </h1>
        <p className="mt-2 max-w-xl text-slate-600">
          Create, edit, complete, and delete tasks. Data is stored in MongoDB and
          survives app restarts.
        </p>
      </header>

      {dbError ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          <strong className="font-semibold">Database unavailable.</strong>{" "}
          {dbError}. Ensure MongoDB is running and{" "}
          <code className="rounded bg-amber-100 px-1">MONGODB_URI</code> is set in{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code>.
        </div>
      ) : null}

      <TodoForm onCreate={createTodo} disabled={busy || !!dbError} />

      <FilterBar
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
      />

      <section aria-live="polite">
        {loading ? (
          <p className="text-center text-sm text-slate-500">Loading tasks...</p>
        ) : visibleTodos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            {dbError
              ? "Connect MongoDB to start adding tasks."
              : status === "all" && !search
                ? "No tasks yet. Add your first one above."
                : "No tasks match your filters."}
          </p>
        ) : (
          <ul className="space-y-3">
            {visibleTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
                disabled={busy}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
