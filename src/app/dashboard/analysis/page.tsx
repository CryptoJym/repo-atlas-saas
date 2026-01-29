import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getScanner } from "@/lib/github";
import { AnalysisDashboard } from "@/components/analysis-dashboard";

export const dynamic = "force-dynamic";

export default async function AnalysisPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const scanner = await getScanner();
  if (!scanner) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Connect GitHub</h2>
        <p className="text-[var(--muted)]">
          Connect your GitHub account to generate analysis reports.
        </p>
      </div>
    );
  }

  let scanResult = null;
  try {
    scanResult = await scanner.scanUserRepos();
  } catch (error) {
    console.error("Analysis scan error:", error);
  }

  return <AnalysisDashboard repos={scanResult?.repos || []} />;
}
