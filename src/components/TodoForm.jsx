"use client";

import { useState } from "react";

const initialState = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

export default function TodoForm({ onCreate, disabled }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      dueDate: form.dueDate || null,
    };

    try {
      await onCreate(payload);
      setForm(initialState);
    } catch (err) {
      setError(err.message || "Failed to create todo");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        New task
      </h2>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none ring-indigo-500 transition focus:border-indigo-400 focus:ring-2 disabled:opacity-60"
          maxLength={200}
          required
        />

        <textarea
          placeholder="Notes (optional)"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          disabled={disabled}
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none ring-indigo-500 transition focus:border-indigo-400 focus:ring-2 disabled:opacity-60"
          maxLength={1000}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-slate-600">
            Priority
            <select
              value={form.priority}
              onChange={(e) => updateField("priority", e.target.value)}
              disabled={disabled}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="block text-sm text-slate-600">
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
              disabled={disabled}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </label>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled || !form.title.trim()}
        className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Add task
      </button>
    </form>
  );
}
