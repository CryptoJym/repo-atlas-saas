import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardOverview } from "@/components/dashboard-overview";
import { getScanner } from "@/lib/github";
import { getCachedScan, getOrCreateUser, saveScanResult } from "@/lib/scan-cache";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const scanner = await getScanner();
  const hasGitHub = !!scanner;

  let scanResult = null;
  let supabaseUserId: string | null = null;

  try {
    supabaseUserId = await getOrCreateUser(userId);
  } catch (error) {
    console.error("Supabase user sync error:", error);
  }

  if (supabaseUserId) {
    try {
      scanResult = await getCachedScan(supabaseUserId);
    } catch (error) {
      console.error("Supabase scan cache error:", error);
    }
  }

  if (!scanResult && scanner) {
    try {
      scanResult = await scanner.scanUserRepos();
      if (scanResult && supabaseUserId) {
        await saveScanResult(supabaseUserId, scanResult);
      }
    } catch (error) {
      console.error("Dashboard scan error:", error);
    }
  }

  return <DashboardOverview hasGitHub={hasGitHub} scanResult={scanResult} />;
}
