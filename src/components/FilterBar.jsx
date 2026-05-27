"use client";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function FilterBar({
  status,
  onStatusChange,
  search,
  onSearchChange,
  counts,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Filter todos by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={status === option.value}
              onClick={() => onStatusChange(option.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                status === option.value
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {option.label}
              <span className="ml-1 text-xs text-slate-400">
                ({counts[option.value] ?? 0})
              </span>
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 sm:max-w-xs"
        />
      </div>
    </div>
  );
}
