"use client";

import type { ScanResult, RepoInfo } from "@/lib/github-scanner";

interface Props {
  hasGitHub: boolean;
  scanResult: ScanResult | null;
}

function StatCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="text-sm text-[var(--muted)] mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function HealthDistribution({ repos }: { repos: RepoInfo[] }) {
  const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  repos.forEach((r) => grades[r.healthGrade]++);
  const total = repos.length || 1;

  const colors = {
    A: "bg-[var(--success)]",
    B: "bg-blue-500",
    C: "bg-[var(--warning)]",
    D: "bg-orange-500",
    F: "bg-[var(--danger)]",
  };

  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <h3 className="font-semibold mb-4">Health Distribution</h3>
      <div className="space-y-3">
        {(Object.entries(grades) as [keyof typeof grades, number][]).map(([grade, count]) => (
          <div key={grade} className="flex items-center gap-3">
            <span className="w-8 font-mono font-bold">{grade}</span>
            <div className="flex-1 h-6 bg-[var(--background)] rounded-full overflow-hidden">
              <div
                className={`h-full ${colors[grade]} rounded-full transition-all duration-500`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
            <span className="w-12 text-right text-sm text-[var(--muted)]">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityBreakdown({ repos }: { repos: RepoInfo[] }) {
  const activity = { active: 0, moderate: 0, stale: 0, dormant: 0 };
  repos.forEach((r) => activity[r.activityLevel]++);

  const colors = {
    active: "text-[var(--success)]",
    moderate: "text-[var(--primary)]",
    stale: "text-[var(--warning)]",
    dormant: "text-[var(--danger)]",
  };

  const icons = {
    active: "🟢",
    moderate: "🔵",
    stale: "🟡",
    dormant: "🔴",
  };

  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <h3 className="font-semibold mb-4">Activity Levels</h3>
      <div className="grid grid-cols-2 gap-4">
        {(Object.entries(activity) as [keyof typeof activity, number][]).map(([level, count]) => (
          <div key={level} className="text-center p-3 rounded-lg bg-[var(--background)]">
            <div className="text-2xl mb-1">{icons[level]}</div>
            <div className={`text-2xl font-bold ${colors[level]}`}>{count}</div>
            <div className="text-xs text-[var(--muted)] capitalize">{level}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageSummary({ repos }: { repos: RepoInfo[] }) {
  const langCounts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });

  const sorted = Object.entries(langCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const langColors: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-500",
    Python: "bg-green-500",
    Rust: "bg-orange-600",
    Go: "bg-cyan-500",
    Java: "bg-red-500",
    Ruby: "bg-red-400",
    C: "bg-gray-500",
    "C++": "bg-pink-500",
    Swift: "bg-orange-500",
    Kotlin: "bg-purple-500",
    Shell: "bg-emerald-600",
  };

  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <h3 className="font-semibold mb-4">Top Languages</h3>
      <div className="space-y-2">
        {sorted.map(([lang, count]) => (
          <div key={lang} className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${langColors[lang] || "bg-gray-400"}`}
            />
            <span className="flex-1 text-sm">{lang}</span>
            <span className="text-sm text-[var(--muted)]">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentRepos({ repos }: { repos: RepoInfo[] }) {
  const recent = [...repos]
    .sort((a, b) => {
      const aDate = a.pushedAt || a.updatedAt;
      const bDate = b.pushedAt || b.updatedAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })
    .slice(0, 5);

  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <h3 className="font-semibold mb-4">Recently Active</h3>
      <div className="space-y-3">
        {recent.map((repo) => (
          <div
            key={repo.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)]"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                repo.activityLevel === "active"
                  ? "bg-[var(--success)]"
                  : repo.activityLevel === "moderate"
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--warning)]"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{repo.name}</div>
              <div className="text-xs text-[var(--muted)]">
                {repo.language || "No language"} · ★{repo.starCount}
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${
                repo.healthGrade === "A"
                  ? "bg-green-500/20 text-green-400"
                  : repo.healthGrade === "B"
                  ? "bg-blue-500/20 text-blue-400"
                  : repo.healthGrade === "C"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {repo.healthGrade}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardOverview({ hasGitHub, scanResult }: Props) {
  if (!hasGitHub) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🔗</div>
        <h2 className="text-2xl font-bold mb-4">Connect Your GitHub Account</h2>
        <p className="text-[var(--muted)] max-w-md mx-auto mb-8">
          Repo Atlas needs access to your GitHub repos to scan and analyze them.
          Connect your GitHub account to get started.
        </p>
        <p className="text-sm text-[var(--muted)]">
          Click your profile icon → Manage Account → Connected Accounts → Connect GitHub
        </p>
      </div>
    );
  }

  if (!scanResult || scanResult.repos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">📭</div>
        <h2 className="text-2xl font-bold mb-4">No Repos Found</h2>
        <p className="text-[var(--muted)]">
          We couldn&apos;t find any repositories. Make sure your GitHub account has repos.
        </p>
      </div>
    );
  }

  const repos = scanResult.repos;
  const avgHealth = Math.round(
    repos.reduce((sum, r) => sum + r.healthScore, 0) / repos.length
  );
  const totalStars = repos.reduce((sum, r) => sum + r.starCount, 0);
  const privateCount = repos.filter((r) => r.isPrivate).length;
  const activeCount = repos.filter(
    (r) => r.activityLevel === "active" || r.activityLevel === "moderate"
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-[var(--muted)]">
          {repos.length} repositories scanned · Last scan:{" "}
          {new Date(scanResult.scannedAt).toLocaleString()} ·{" "}
          {scanResult.scanDurationMs}ms
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Repos" value={repos.length} />
        <StatCard
          label="Avg Health"
          value={`${avgHealth}%`}
          color={avgHealth >= 60 ? "text-[var(--success)]" : "text-[var(--warning)]"}
        />
        <StatCard label="Total Stars" value={totalStars} color="text-[var(--warning)]" />
        <StatCard
          label="Active Repos"
          value={`${activeCount}/${repos.length}`}
          color="text-[var(--primary)]"
        />
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthDistribution repos={repos} />
        <ActivityBreakdown repos={repos} />
        <LanguageSummary repos={repos} />
        <div className="md:col-span-2 lg:col-span-3">
          <RecentRepos repos={repos} />
        </div>
      </div>
    </div>
  );
}
