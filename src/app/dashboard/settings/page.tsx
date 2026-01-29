import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getGitHubToken } from "@/lib/github";
import { getOrCreateUser } from "@/lib/scan-cache";
import { createServerSupabase } from "@/lib/supabase";
import { ForceRescanForm } from "@/components/force-rescan-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const supabase = createServerSupabase();
  const displayName =
    user.fullName || user.username || user.firstName || "Repo Atlas User";
  const primaryEmail = user.primaryEmailAddress?.emailAddress || "";

  let plan = "free";
  let lastScan: string | null = null;
  let githubConnected = false;
  let supabaseUserId: string | null = null;

  try {
    supabaseUserId = await getOrCreateUser(user.id);
  } catch (error) {
    console.error("Supabase user sync error:", error);
  }

  if (supabaseUserId) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("plan")
        .eq("id", supabaseUserId)
        .maybeSingle();
      if (error) throw error;
      if (data?.plan) plan = data.plan;
    } catch (error) {
      console.error("Supabase user fetch error:", error);
    }

    try {
      const { data, error } = await supabase
        .from("scan_results")
        .select("scanned_at")
        .eq("user_id", supabaseUserId)
        .order("scanned_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data?.scanned_at) lastScan = data.scanned_at;
    } catch (error) {
      console.error("Supabase scan fetch error:", error);
    }
  }

  try {
    githubConnected = !!(await getGitHubToken());
  } catch (error) {
    console.error("GitHub token check error:", error);
  }

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const lastScanLabel = lastScan
    ? new Date(lastScan).toLocaleString()
    : "No scans yet";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--muted)]">
          Manage your account, plan, and scanning preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Name</span>
              <span className="font-medium text-white">{displayName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Email</span>
              <span className="font-medium text-white">{primaryEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Clerk ID</span>
              <span className="font-mono text-xs text-[var(--muted)]">
                {user.id}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-lg font-semibold mb-4">Plan</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Current plan</span>
              <span className="font-medium text-white">{planLabel}</span>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition"
            >
              Manage plan
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-lg font-semibold mb-4">GitHub Connection</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Status</span>
              <span
                className={`font-medium ${
                  githubConnected ? "text-[var(--success)]" : "text-[var(--danger)]"
                }`}
              >
                {githubConnected ? "Connected" : "Not connected"}
              </span>
            </div>
            <p className="text-[var(--muted)]">
              Connect GitHub in your Clerk profile to enable scans.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-lg font-semibold mb-4">Last Scan</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Timestamp</span>
              <span className="font-medium text-white">{lastScanLabel}</span>
            </div>
            <p className="text-[var(--muted)]">
              Use a force rescan to refresh results immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <h2 className="text-lg font-semibold mb-2">Force Rescan</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Trigger a fresh scan of your repositories and overwrite cached results.
        </p>
        <ForceRescanForm />
      </div>
    </div>
  );
}
