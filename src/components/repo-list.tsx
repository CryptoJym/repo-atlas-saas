"use client";

import { useState, useMemo } from "react";
import type { RepoInfo } from "@/lib/github-scanner";

interface Props {
  repos: RepoInfo[];
  scannedAt: string;
}

type SortKey = "name" | "healthScore" | "starCount" | "pushedAt" | "size";
type FilterKey = "all" | "active" | "moderate" | "stale" | "dormant";

export function RepoList({ repos, scannedAt }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("healthScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showPrivate, setShowPrivate] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...repos];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.language?.toLowerCase().includes(q) ||
          r.topics.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Activity filter
    if (filter !== "all") {
      result = result.filter((r) => r.activityLevel === filter);
    }

    // Private filter
    if (!showPrivate) {
      result = result.filter((r) => !r.isPrivate);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "healthScore":
          cmp = a.healthScore - b.healthScore;
          break;
        case "starCount":
          cmp = a.starCount - b.starCount;
          break;
        case "pushedAt":
          cmp =
            new Date(a.pushedAt || 0).getTime() -
            new Date(b.pushedAt || 0).getTime();
          break;
        case "size":
          cmp = a.size - b.size;
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [repos, search, sortBy, sortDir, filter, showPrivate]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const handleExport = (format: "json" | "csv") => {
    const exportRows = filtered;
    let blob: Blob;

    if (format === "json") {
      blob = new Blob([JSON.stringify(exportRows, null, 2)], {
        type: "application/json",
      });
    } else {
      const headers = [
        "name",
        "fullName",
        "language",
        "healthScore",
        "healthGrade",
        "activityLevel",
        "starCount",
        "forkCount",
        "isPrivate",
        "pushedAt",
      ];

      const escapeCsv = (value: string) => {
        if (value.includes("\"")) {
          value = value.replace(/\"/g, "\"\"");
        }
        return value.includes(",") || value.includes("\n") || value.includes("\"")
          ? `"${value}"`
          : value;
      };

      const csvRows = [
        headers.join(","),
        ...exportRows.map((repo) => {
          const row = [
            repo.name,
            repo.fullName,
            repo.language || "",
            String(repo.healthScore),
            repo.healthGrade,
            repo.activityLevel,
            String(repo.starCount),
            String(repo.forkCount),
            String(repo.isPrivate),
            repo.pushedAt || "",
          ];
          return row.map((value) => escapeCsv(String(value))).join(",");
        }),
      ];

      blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `repo-atlas-export.${format === "json" ? "json" : "csv"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const gradeColors: Record<string, string> = {
    A: "bg-green-500/20 text-green-400 border-green-500/30",
    B: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    C: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    D: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    F: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const activityColors: Record<string, string> = {
    active: "bg-green-500",
    moderate: "bg-blue-500",
    stale: "bg-yellow-500",
    dormant: "bg-red-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-sm text-[var(--muted)]">
            {repos.length} total · {filtered.length} shown ·
            Scanned {new Date(scannedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search repos, languages, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] w-72"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((prev) => !prev)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-white hover:bg-[var(--card-hover)] transition"
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              aria-label="Export repositories"
            >
              Export
            </button>
            {exportOpen && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg z-10"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => handleExport("json")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--card-hover)] transition"
                  role="menuitem"
                >
                  Export as JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--card-hover)] transition"
                  role="menuitem"
                >
                  Export as CSV
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-1">
          {(["all", "active", "moderate", "stale", "dormant"] as FilterKey[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm capitalize transition ${
                filter === f
                  ? "bg-[var(--primary)] text-white"
                  : "hover:bg-[var(--card)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={showPrivate}
            onChange={(e) => setShowPrivate(e.target.checked)}
            className="rounded"
          />
          Show private
        </label>
      </div>

      {/* Sort buttons */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-[var(--muted)]">Sort by:</span>
        {(
          [
            ["healthScore", "Health"],
            ["starCount", "Stars"],
            ["pushedAt", "Last Push"],
            ["name", "Name"],
            ["size", "Size"],
          ] as [SortKey, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleSort(key)}
            className={`px-3 py-1 rounded-lg transition ${
              sortBy === key
                ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30"
                : "hover:bg-[var(--card)] border border-transparent"
            }`}
          >
            {label}
            {sortBy === key && (
              <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>
            )}
          </button>
        ))}
      </div>

      {/* Repo Grid */}
      <div className="grid gap-3">
        {filtered.map((repo) => (
          <div
            key={repo.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition"
          >
            {/* Activity indicator */}
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${activityColors[repo.activityLevel]}`}
              title={repo.activityLevel}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-[var(--primary)] transition truncate"
                >
                  {repo.fullName}
                </a>
                {repo.isPrivate && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--muted)]">
                    private
                  </span>
                )}
                {repo.isFork && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--muted)]">
                    fork
                  </span>
                )}
                {repo.isArchived && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    archived
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted)] truncate">
                {repo.description || "No description"}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted)]">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                    {repo.language}
                  </span>
                )}
                <span>★ {repo.starCount}</span>
                <span>🍴 {repo.forkCount}</span>
                {repo.daysSinceLastPush !== null && (
                  <span>
                    {repo.daysSinceLastPush === 0
                      ? "Pushed today"
                      : `${repo.daysSinceLastPush}d ago`}
                  </span>
                )}
                {repo.topics.length > 0 && (
                  <span className="truncate max-w-48">
                    {repo.topics.slice(0, 3).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Health badge */}
            <div
              className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${gradeColors[repo.healthGrade]}`}
            >
              {repo.healthGrade}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--muted)]">
          <p className="text-xl mb-2">No repos match your filters</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
