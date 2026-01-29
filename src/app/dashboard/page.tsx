import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getScanner } from "@/lib/github";
import { DashboardOverview } from "@/components/dashboard-overview";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const scanner = await getScanner();
  const hasGitHub = !!scanner;

  // If GitHub is connected, do a quick scan
  let scanResult = null;
  if (scanner) {
    try {
      scanResult = await scanner.scanUserRepos();
    } catch (error) {
      console.error("Dashboard scan error:", error);
    }
  }

  return <DashboardOverview hasGitHub={hasGitHub} scanResult={scanResult} />;
}
