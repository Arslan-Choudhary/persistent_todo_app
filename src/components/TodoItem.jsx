"use client";

import { useState } from "react";
import {
  formatDueDate,
  isOverdue,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
} from "@/lib/todo-utils";

export default function TodoItem({ todo, onUpdate, onDelete, disabled }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: todo.title,
    description: todo.description || "",
    priority: todo.priority,
    dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : "",
  });
  const [error, setError] = useState("");

  const overdue = isOverdue(todo);

  async function saveEdit() {
    setError("");
    try {
      await onUpdate(todo._id, {
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        dueDate: draft.dueDate || null,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update todo");
    }
  }

  async function toggleCompleted() {
    setError("");
    try {
      await onUpdate(todo._id, { completed: !todo.completed });
    } catch (err) {
      setError(err.message || "Failed to update todo");
    }
  }

  if (isEditing) {
    return (
      <li className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
        <div className="space-y-3">
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            maxLength={200}
          />
          <textarea
            value={draft.description}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2"
            maxLength={1000}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={draft.priority}
              onChange={(e) =>
                setDraft((d) => ({ ...d, priority: e.target.value }))
              }
              className="rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={draft.dueDate}
              onChange={(e) =>
                setDraft((d) => ({ ...d, dueDate: e.target.value }))
              }
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveEdit}
              disabled={disabled || !draft.title.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setDraft({
                  title: todo.title,
                  description: todo.description || "",
                  priority: todo.priority,
                  dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : "",
                });
                setError("");
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
        todo.completed
          ? "border-slate-200 opacity-75"
          : overdue
            ? "border-rose-300 ring-1 ring-rose-100"
            : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={toggleCompleted}
          disabled={disabled}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? "active" : "completed"}`}
          className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-base font-medium text-slate-900 ${
                todo.completed ? "line-through text-slate-500" : ""
              }`}
            >
              {todo.title}
            </h3>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PRIORITY_STYLES[todo.priority]}`}
            >
              {PRIORITY_LABELS[todo.priority]}
            </span>
            {overdue ? (
              <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                Overdue
              </span>
            ) : null}
          </div>

          {todo.description ? (
            <p
              className={`mt-1 text-sm text-slate-600 ${
                todo.completed ? "line-through" : ""
              }`}
            >
              {todo.description}
            </p>
          ) : null}

          {todo.dueDate ? (
            <p
              className={`mt-2 text-xs font-medium ${
                overdue ? "text-rose-600" : "text-slate-500"
              }`}
            >
              Due {formatDueDate(todo.dueDate)}
            </p>
          ) : null}

          {error ? (
            <p className="mt-2 text-sm text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo._id)}
            disabled={disabled}
            className="rounded-lg px-2 py-1 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
