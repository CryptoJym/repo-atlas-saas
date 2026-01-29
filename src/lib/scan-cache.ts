import type { RepoAnalysis, ScanResult } from "@/lib/github-scanner";
import { createServerSupabase } from "@/lib/supabase";

const DEFAULT_MAX_AGE_MINUTES = 15;

function isFresh(timestamp: string, maxAgeMinutes: number) {
  const scannedAtMs = new Date(timestamp).getTime();
  if (Number.isNaN(scannedAtMs)) return false;
  const ageMs = Date.now() - scannedAtMs;
  return ageMs <= maxAgeMinutes * 60 * 1000;
}

export async function getCachedScan(userId: string, maxAgeMinutes = DEFAULT_MAX_AGE_MINUTES) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("scan_results")
    .select("owner, repos, total_count, scan_duration_ms, scanned_at")
    .eq("user_id", userId)
    .order("scanned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  if (!isFresh(data.scanned_at, maxAgeMinutes)) return null;

  return {
    owner: data.owner,
    repos: (data.repos || []) as ScanResult["repos"],
    totalCount: data.total_count,
    scanDurationMs: data.scan_duration_ms ?? 0,
    scannedAt: data.scanned_at,
  } satisfies ScanResult;
}

export async function saveScanResult(userId: string, result: ScanResult) {
  const supabase = createServerSupabase();
  const payload = {
    user_id: userId,
    owner: result.owner,
    repos: result.repos,
    total_count: result.totalCount,
    scan_duration_ms: result.scanDurationMs,
    scanned_at: result.scannedAt || new Date().toISOString(),
  };

  const { error } = await supabase.from("scan_results").insert(payload);
  if (error) throw error;
}

export async function getCachedAnalysis(
  userId: string,
  owner: string,
  repo: string,
  maxAgeMinutes = DEFAULT_MAX_AGE_MINUTES
) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("repo_analyses")
    .select("analysis, analyzed_at")
    .eq("user_id", userId)
    .eq("owner", owner)
    .eq("repo", repo)
    .order("analyzed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  if (!isFresh(data.analyzed_at, maxAgeMinutes)) return null;

  return data.analysis as RepoAnalysis;
}

export async function saveAnalysis(
  userId: string,
  owner: string,
  repo: string,
  analysis: RepoAnalysis
) {
  const supabase = createServerSupabase();
  const payload = {
    user_id: userId,
    owner,
    repo,
    analysis,
    analyzed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("repo_analyses")
    .upsert(payload, { onConflict: "user_id,owner,repo" });
  if (error) throw error;
}

export async function getOrCreateUser(clerkUserId: string) {
  const supabase = createServerSupabase();
  const payload = {
    clerk_user_id: clerkUserId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "clerk_user_id" })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}
