/**
 * GitHub Repository Scanner
 * Ported from ~/repo-atlas/scanner.js to work with GitHub API instead of local filesystem.
 * Original: scans local .git directories via child_process git commands.
 * SaaS version: scans GitHub repos via Octokit REST API.
 */

import { Octokit } from "@octokit/rest";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RepoInfo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  language: string | null;
  languages: Record<string, number>;
  topics: string[];
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  starCount: number;
  forkCount: number;
  openIssueCount: number;
  watcherCount: number;
  size: number; // KB
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  license: string | null;
  hasIssues: boolean;
  hasProjects: boolean;
  hasWiki: boolean;
  hasPages: boolean;
  // Computed
  healthScore: number;
  healthGrade: "A" | "B" | "C" | "D" | "F";
  daysSinceLastPush: number | null;
  activityLevel: "active" | "moderate" | "stale" | "dormant";
}

export interface RepoAnalysis {
  repo: RepoInfo;
  branches: BranchInfo[];
  recentCommits: CommitInfo[];
  contributors: ContributorInfo[];
  languageBreakdown: LanguageBreakdown[];
}

export interface BranchInfo {
  name: string;
  isProtected: boolean;
  commitSha: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface ContributorInfo {
  login: string;
  avatarUrl: string;
  contributions: number;
}

export interface LanguageBreakdown {
  language: string;
  bytes: number;
  percentage: number;
}

export interface ScanResult {
  repos: RepoInfo[];
  totalCount: number;
  scannedAt: string;
  owner: string;
  scanDurationMs: number;
}

export interface ScanProgress {
  reposScanned: number;
  totalRepos: number;
  currentRepo: string;
}

// ─── Health Scoring (ported from scanner.js enrichRepo logic) ────────────────

function calculateHealthScore(repo: {
  pushedAt: string | null;
  description: string | null;
  license: string | null;
  hasIssues: boolean;
  openIssueCount: number;
  starCount: number;
  forkCount: number;
  isArchived: boolean;
  topics: string[];
  language: string | null;
  size: number;
}): { score: number; grade: "A" | "B" | "C" | "D" | "F" } {
  let score = 0;

  // Activity (0-30 points)
  if (repo.pushedAt) {
    const daysSincePush = Math.floor(
      (Date.now() - new Date(repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePush <= 7) score += 30;
    else if (daysSincePush <= 30) score += 25;
    else if (daysSincePush <= 90) score += 15;
    else if (daysSincePush <= 365) score += 5;
  }

  // Documentation (0-20 points)
  if (repo.description && repo.description.length > 10) score += 10;
  if (repo.topics.length > 0) score += 5;
  if (repo.license) score += 5;

  // Community (0-20 points)
  if (repo.starCount > 0) score += Math.min(10, repo.starCount);
  if (repo.forkCount > 0) score += Math.min(5, repo.forkCount);
  if (repo.hasIssues) score += 5;

  // Code quality signals (0-20 points)
  if (repo.language) score += 5;
  if (repo.size > 0 && repo.size < 500000) score += 5; // Not bloated
  if (!repo.isArchived) score += 5;
  if (repo.openIssueCount < 50) score += 5;

  // Penalty
  if (repo.isArchived) score = Math.max(0, score - 20);

  // Normalize to 0-100
  score = Math.min(100, Math.max(0, score));

  const grade =
    score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : score >= 20 ? "D" : "F";

  return { score, grade };
}

function getActivityLevel(pushedAt: string | null): "active" | "moderate" | "stale" | "dormant" {
  if (!pushedAt) return "dormant";
  const days = Math.floor(
    (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 7) return "active";
  if (days <= 30) return "moderate";
  if (days <= 180) return "stale";
  return "dormant";
}

function getDaysSinceLastPush(pushedAt: string | null): number | null {
  if (!pushedAt) return null;
  return Math.floor(
    (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ─── Scanner Class ───────────────────────────────────────────────────────────

export class GitHubScanner {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  /**
   * Scan all repositories for the authenticated user.
   * Equivalent to scanRepos() from the Electron version but uses GitHub API.
   */
  async scanUserRepos(
    onProgress?: (progress: ScanProgress) => void
  ): Promise<ScanResult> {
    const startTime = Date.now();

    // Get authenticated user
    const { data: user } = await this.octokit.users.getAuthenticated();

    // Fetch all repos (paginated)
    const repos: RepoInfo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        sort: "updated",
        direction: "desc",
        per_page: perPage,
        page,
        type: "all",
      });

      if (data.length === 0) break;

      for (const ghRepo of data) {
        const pushedAt = ghRepo.pushed_at ?? null;
        const health = calculateHealthScore({
          pushedAt,
          description: ghRepo.description ?? null,
          license: ghRepo.license?.spdx_id || null,
          hasIssues: ghRepo.has_issues ?? false,
          openIssueCount: ghRepo.open_issues_count,
          starCount: ghRepo.stargazers_count,
          forkCount: ghRepo.forks_count,
          isArchived: ghRepo.archived ?? false,
          topics: ghRepo.topics || [],
          language: ghRepo.language ?? null,
          size: ghRepo.size,
        });

        repos.push({
          id: ghRepo.id,
          name: ghRepo.name,
          fullName: ghRepo.full_name,
          owner: ghRepo.owner?.login || user.login,
          description: ghRepo.description ?? null,
          url: ghRepo.html_url,
          cloneUrl: ghRepo.clone_url ?? "",
          defaultBranch: ghRepo.default_branch,
          language: ghRepo.language ?? null,
          languages: {},
          topics: ghRepo.topics || [],
          isPrivate: ghRepo.private,
          isFork: ghRepo.fork,
          isArchived: ghRepo.archived ?? false,
          isTemplate: ghRepo.is_template ?? false,
          starCount: ghRepo.stargazers_count,
          forkCount: ghRepo.forks_count,
          openIssueCount: ghRepo.open_issues_count,
          watcherCount: ghRepo.watchers_count,
          size: ghRepo.size,
          createdAt: ghRepo.created_at ?? "",
          updatedAt: ghRepo.updated_at ?? "",
          pushedAt,
          license: ghRepo.license?.spdx_id || null,
          hasIssues: ghRepo.has_issues ?? false,
          hasProjects: ghRepo.has_projects ?? false,
          hasWiki: ghRepo.has_wiki ?? false,
          hasPages: ghRepo.has_pages ?? false,
          healthScore: health.score,
          healthGrade: health.grade,
          daysSinceLastPush: getDaysSinceLastPush(pushedAt),
          activityLevel: getActivityLevel(pushedAt),
        });

        onProgress?.({
          reposScanned: repos.length,
          totalRepos: -1, // Unknown until we finish paginating
          currentRepo: ghRepo.full_name,
        });
      }

      if (data.length < perPage) break;
      page++;
    }

    return {
      repos,
      totalCount: repos.length,
      scannedAt: new Date().toISOString(),
      owner: user.login,
      scanDurationMs: Date.now() - startTime,
    };
  }

  /**
   * Scan repos for a specific organization.
   */
  async scanOrgRepos(
    org: string,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<ScanResult> {
    const startTime = Date.now();
    const repos: RepoInfo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const { data } = await this.octokit.repos.listForOrg({
        org,
        sort: "updated",
        direction: "desc",
        per_page: perPage,
        page,
        type: "all",
      });

      if (data.length === 0) break;

      for (const ghRepo of data) {
        const pushedAt = ghRepo.pushed_at ?? null;
        const health = calculateHealthScore({
          pushedAt,
          description: ghRepo.description ?? null,
          license: ghRepo.license?.spdx_id || null,
          hasIssues: ghRepo.has_issues ?? false,
          openIssueCount: ghRepo.open_issues_count ?? 0,
          starCount: ghRepo.stargazers_count ?? 0,
          forkCount: ghRepo.forks_count ?? 0,
          isArchived: ghRepo.archived ?? false,
          topics: ghRepo.topics || [],
          language: ghRepo.language ?? null,
          size: ghRepo.size ?? 0,
        });

        repos.push({
          id: ghRepo.id,
          name: ghRepo.name,
          fullName: ghRepo.full_name,
          owner: org,
          description: ghRepo.description ?? null,
          url: ghRepo.html_url,
          cloneUrl: ghRepo.clone_url ?? "",
          defaultBranch: ghRepo.default_branch ?? "main",
          language: ghRepo.language ?? null,
          languages: {},
          topics: ghRepo.topics || [],
          isPrivate: ghRepo.private ?? false,
          isFork: ghRepo.fork ?? false,
          isArchived: ghRepo.archived ?? false,
          isTemplate: ghRepo.is_template ?? false,
          starCount: ghRepo.stargazers_count ?? 0,
          forkCount: ghRepo.forks_count ?? 0,
          openIssueCount: ghRepo.open_issues_count ?? 0,
          watcherCount: ghRepo.watchers_count ?? 0,
          size: ghRepo.size ?? 0,
          createdAt: ghRepo.created_at ?? "",
          updatedAt: ghRepo.updated_at ?? "",
          pushedAt,
          license: ghRepo.license?.spdx_id || null,
          hasIssues: ghRepo.has_issues ?? false,
          hasProjects: ghRepo.has_projects ?? false,
          hasWiki: ghRepo.has_wiki ?? false,
          hasPages: ghRepo.has_pages ?? false,
          healthScore: health.score,
          healthGrade: health.grade,
          daysSinceLastPush: getDaysSinceLastPush(pushedAt),
          activityLevel: getActivityLevel(pushedAt),
        });

        onProgress?.({
          reposScanned: repos.length,
          totalRepos: -1,
          currentRepo: ghRepo.full_name,
        });
      }

      if (data.length < perPage) break;
      page++;
    }

    return {
      repos,
      totalCount: repos.length,
      scannedAt: new Date().toISOString(),
      owner: org,
      scanDurationMs: Date.now() - startTime,
    };
  }

  /**
   * Get detailed analysis for a single repository.
   * Equivalent to enrichRepo() from scanner.js but with more data.
   */
  async analyzeRepo(owner: string, repo: string): Promise<RepoAnalysis> {
    const [repoData, branchesData, commitsData, contributorsData, languagesData] =
      await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.octokit.repos.listBranches({ owner, repo, per_page: 100 }).catch(() => ({ data: [] })),
        this.octokit.repos
          .listCommits({ owner, repo, per_page: 20 })
          .catch(() => ({ data: [] })),
        this.octokit.repos
          .listContributors({ owner, repo, per_page: 30 })
          .catch(() => ({ data: [] })),
        this.octokit.repos.listLanguages({ owner, repo }).catch(() => ({ data: {} })),
      ]);

    const ghRepo = repoData.data;
    const pushedAt = ghRepo.pushed_at ?? null;
    const health = calculateHealthScore({
      pushedAt,
      description: ghRepo.description ?? null,
      license: ghRepo.license?.spdx_id || null,
      hasIssues: ghRepo.has_issues ?? false,
      openIssueCount: ghRepo.open_issues_count,
      starCount: ghRepo.stargazers_count,
      forkCount: ghRepo.forks_count,
      isArchived: ghRepo.archived ?? false,
      topics: ghRepo.topics || [],
      language: ghRepo.language ?? null,
      size: ghRepo.size,
    });

    // Language breakdown
    const totalBytes = Object.values(languagesData.data as Record<string, number>).reduce(
      (sum, b) => sum + b,
      0
    );
    const languageBreakdown: LanguageBreakdown[] = Object.entries(
      languagesData.data as Record<string, number>
    )
      .map(([lang, bytes]) => ({
        language: lang,
        bytes,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.bytes - a.bytes);

    const repoInfo: RepoInfo = {
      id: ghRepo.id,
      name: ghRepo.name,
      fullName: ghRepo.full_name,
      owner: ghRepo.owner?.login || owner,
      description: ghRepo.description ?? null,
      url: ghRepo.html_url,
      cloneUrl: ghRepo.clone_url ?? "",
      defaultBranch: ghRepo.default_branch,
      language: ghRepo.language ?? null,
      languages: languagesData.data as Record<string, number>,
      topics: ghRepo.topics || [],
      isPrivate: ghRepo.private,
      isFork: ghRepo.fork,
      isArchived: ghRepo.archived ?? false,
      isTemplate: ghRepo.is_template ?? false,
      starCount: ghRepo.stargazers_count,
      forkCount: ghRepo.forks_count,
      openIssueCount: ghRepo.open_issues_count,
      watcherCount: ghRepo.watchers_count,
      size: ghRepo.size,
      createdAt: ghRepo.created_at ?? "",
      updatedAt: ghRepo.updated_at ?? "",
      pushedAt,
      license: ghRepo.license?.spdx_id || null,
      hasIssues: ghRepo.has_issues ?? false,
      hasProjects: ghRepo.has_projects ?? false,
      hasWiki: ghRepo.has_wiki ?? false,
      hasPages: ghRepo.has_pages ?? false,
      healthScore: health.score,
      healthGrade: health.grade,
      daysSinceLastPush: getDaysSinceLastPush(pushedAt),
      activityLevel: getActivityLevel(pushedAt),
    };

    return {
      repo: repoInfo,
      branches: branchesData.data.map((b) => ({
        name: b.name,
        isProtected: b.protected,
        commitSha: b.commit.sha,
      })),
      recentCommits: commitsData.data.map((c) => ({
        sha: c.sha,
        message: c.commit.message.split("\n")[0],
        author: c.commit.author?.name || c.author?.login || "unknown",
        date: c.commit.author?.date || "",
        url: c.html_url,
      })),
      contributors: (contributorsData.data as Array<{login?: string; avatar_url?: string; contributions?: number}>).map((c) => ({
        login: c.login || "unknown",
        avatarUrl: c.avatar_url || "",
        contributions: c.contributions || 0,
      })),
      languageBreakdown,
    };
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { calculateHealthScore, getActivityLevel, getDaysSinceLastPush };
