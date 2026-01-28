"use client";

import { useState } from "react";
import type { RepoInfo, RepoAnalysis } from "@/lib/github-scanner";

interface Props {
  repos: RepoInfo[];
}

function AnalysisReport({ analysis }: { analysis: RepoAnalysis }) {
  const { repo, branches, recentCommits, contributors, languageBreakdown } = analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{repo.fullName}</h2>
            <p className="text-[var(--muted)]">{repo.description || "No description"}</p>
          </div>
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl border ${
              repo.healthGrade === "A"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : repo.healthGrade === "B"
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                : repo.healthGrade === "C"
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}
          >
            {repo.healthGrade}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-[var(--background)]">
            <div className="text-xl font-bold">{repo.healthScore}</div>
            <div className="text-xs text-[var(--muted)]">Health Score</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--background)]">
            <div className="text-xl font-bold">{repo.starCount}</div>
            <div className="text-xs text-[var(--muted)]">Stars</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--background)]">
            <div className="text-xl font-bold">{branches.length}</div>
            <div className="text-xs text-[var(--muted)]">Branches</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--background)]">
            <div className="text-xl font-bold">{contributors.length}</div>
            <div className="text-xs text-[var(--muted)]">Contributors</div>
          </div>
        </div>
      </div>

      {/* Languages */}
      {languageBreakdown.length > 0 && (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="font-semibold mb-4">Language Breakdown</h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            {languageBreakdown.map((lang) => (
              <div
                key={lang.language}
                className="h-full"
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: getLanguageColor(lang.language),
                }}
                title={`${lang.language}: ${lang.percentage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {languageBreakdown.map((lang) => (
              <div key={lang.language} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(lang.language) }}
                />
                <span>
                  {lang.language} ({lang.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Commits */}
      {recentCommits.length > 0 && (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="font-semibold mb-4">Recent Commits</h3>
          <div className="space-y-3">
            {recentCommits.slice(0, 10).map((commit) => (
              <div
                key={commit.sha}
                className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background)]"
              >
                <code className="text-xs text-[var(--primary)] shrink-0 mt-0.5">
                  {commit.sha.slice(0, 7)}
                </code>
                <div className="flex-1 min-w-0">
                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-[var(--primary)] transition truncate block"
                  >
                    {commit.message}
                  </a>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    {commit.author} · {new Date(commit.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contributors */}
      {contributors.length > 0 && (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="font-semibold mb-4">Top Contributors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contributors.slice(0, 8).map((c) => (
              <div
                key={c.login}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatarUrl}
                  alt={c.login}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="text-sm font-medium">{c.login}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {c.contributions} commits
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Branches */}
      {branches.length > 0 && (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="font-semibold mb-4">Branches ({branches.length})</h3>
          <div className="flex flex-wrap gap-2">
            {branches.map((branch) => (
              <span
                key={branch.name}
                className={`text-xs px-3 py-1 rounded-full ${
                  branch.name === repo.defaultBranch
                    ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30"
                    : "bg-[var(--background)] border border-[var(--border)]"
                }`}
              >
                {branch.name}
                {branch.isProtected && " 🔒"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Rust: "#dea584",
    Go: "#00ADD8",
    Java: "#b07219",
    Ruby: "#701516",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Shell: "#89e051",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Dockerfile: "#384d54",
    Makefile: "#427819",
  };
  return colors[language] || "#8b949e";
}

export function AnalysisDashboard({ repos }: Props) {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (owner: string, repo: string) => {
    setSelectedRepo(`${owner}/${repo}`);
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // Sort by health score for the selector
  const sortedRepos = [...repos].sort((a, b) => b.healthScore - a.healthScore);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analysis</h1>
        <p className="text-[var(--muted)]">
          Select a repository to generate a detailed analysis report.
        </p>
      </div>

      {/* Repo selector */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedRepos.slice(0, 20).map((repo) => (
            <button
              key={repo.id}
              onClick={() => handleAnalyze(repo.owner, repo.name)}
              className={`p-4 rounded-xl border text-left transition ${
                selectedRepo === repo.fullName
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]"
              }`}
            >
              <div className="font-medium text-sm truncate">{repo.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[var(--muted)]">
                  {repo.language || "—"}
                </span>
                <span
                  className={`text-xs font-bold ${
                    repo.healthGrade === "A"
                      ? "text-green-400"
                      : repo.healthGrade === "B"
                      ? "text-blue-400"
                      : "text-yellow-400"
                  }`}
                >
                  {repo.healthGrade}
                </span>
              </div>
            </button>
          ))}
        </div>
        {repos.length > 20 && (
          <p className="text-sm text-[var(--muted)] mt-4">
            Showing top 20 repos by health score. {repos.length - 20} more available.
          </p>
        )}
      </div>

      {/* Analysis content */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-3 text-[var(--muted)]">
            <svg
              className="animate-spin w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Analyzing {selectedRepo}...
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-[var(--danger)] bg-red-500/10 text-[var(--danger)]">
          {error}
        </div>
      )}

      {analysis && <AnalysisReport analysis={analysis} />}

      {!selectedRepo && !loading && (
        <div className="text-center py-16 text-[var(--muted)]">
          <div className="text-4xl mb-4">🔬</div>
          <p>Select a repository above to start analysis</p>
        </div>
      )}
    </div>
  );
}
