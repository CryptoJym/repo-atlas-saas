import Link from "next/link";
import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <DashboardNav />

      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8 flex-1">
        {children}
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[var(--muted)]">
          <span>© 2026 Repo Atlas by Utlyze</span>
          <div className="flex gap-4">
            <Link href="/pricing">Pricing</Link>
            <Link href="/dashboard/settings">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
