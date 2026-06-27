"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  const deferredSearch = useDeferredValue(search);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [dbError, setDbError] = useState("");

  const markPending = useCallback((id) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const clearPending = useCallback((id) => {
    setPendingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const loadTodos = useCallback(async () => {
    if (!hasLoadedOnce) {
      setLoading(true);
    } else {
      setIsSearching(true);
    }
    setDbError("");

    const params = new URLSearchParams({ status: "all" });
    if (deferredSearch.trim()) params.set("q", deferredSearch.trim());

    try {
      const data = await request(`/api/todos?${params}`);
      setTodos(data.todos);
    } catch (error) {
      setDbError(error.message);
      console.error("Error loading todos:", error);
      setTodos([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
      setHasLoadedOnce(true);
    }
  }, [deferredSearch, hasLoadedOnce]);

  useEffect(() => {
    const timer = setTimeout(loadTodos, deferredSearch ? 250 : 0);
    return () => clearTimeout(timer);
  }, [loadTodos, deferredSearch]);

  const counts = useMemo(() => {
    return todos.reduce(
      (acc, todo) => {
        if (todo.completed) acc.completed += 1;
        else acc.active += 1;
        return acc;
      },
      { all: todos.length, active: 0, completed: 0 },
    );
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (status === "active") return todos.filter((t) => !t.completed);
    if (status === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, status]);

  async function createTodo(payload) {
    try {
      const data = await request("/api/todos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTodos((prev) => [data.todo, ...prev]);
    } catch (error) {
      // Surface to the form so it can show a message.
      throw error;
    }
  }

  async function updateTodo(id, updates) {
    markPending(id);

    let previousTodo;
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo._id !== id) return todo;
        previousTodo = todo;
        return { ...todo, ...updates };
      }),
    );

    try {
      const data = await request(`/api/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setTodos((prev) => prev.map((todo) => (todo._id === id ? data.todo : todo)));
    } catch (error) {
      if (previousTodo) {
        setTodos((prev) =>
          prev.map((todo) => (todo._id === id ? previousTodo : todo)),
        );
      }
      throw error;
    } finally {
      clearPending(id);
    }
  }

  async function deleteTodo(id) {
    markPending(id);
    try {
      await request(`/api/todos/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (error) {
      throw error;
    } finally {
      clearPending(id);
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

      <TodoForm onCreate={createTodo} disabled={!!dbError} />

      <FilterBar
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
      />

      {isSearching ? (
        <p className="text-xs text-slate-500" aria-live="polite">
          Updating results...
        </p>
      ) : null}

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
                disabled={pendingIds.has(todo._id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
