import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-xl font-bold">Repo Atlas</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-[var(--muted)] hover:text-white transition">
            Pricing
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-sm text-[var(--muted)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            Now scanning GitHub repos via API
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Map your entire
            <br />
            <span className="text-[var(--primary)]">GitHub universe</span>
          </h1>
          <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10">
            Scan, analyze, and visualize all your GitHub repositories. Get health
            scores, dependency maps, activity metrics, and actionable insights — all
            from one dashboard.
          </p>
          <div className="flex items-center justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-8 py-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium text-lg"
                >
                  Get Started Free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-8 py-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium text-lg"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <Link
              href="/pricing"
              className="px-8 py-3 rounded-lg border border-[var(--border)] hover:border-[var(--muted)] transition font-medium text-lg"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 py-16">
          {[
            {
              title: "Repository Scanner",
              description: "Scan all your GitHub repos instantly. Get branch info, commit history, language breakdown, and contributor stats.",
              icon: "🔍",
            },
            {
              title: "Health Scores",
              description: "Automated health scoring based on activity, documentation, test coverage, and code quality signals.",
              icon: "💊",
            },
            {
              title: "Dependency Map",
              description: "Visualize cross-repo dependencies, shared packages, and potential security vulnerabilities.",
              icon: "🗺️",
            },
            {
              title: "Activity Timeline",
              description: "Track commit velocity, PR throughput, and contributor engagement across your entire portfolio.",
              icon: "📊",
            },
            {
              title: "Analysis Reports",
              description: "Generate comprehensive reports on repository health, tech debt, and improvement recommendations.",
              icon: "📋",
            },
            {
              title: "Team Insights",
              description: "Understand team velocity, bus factor risks, and knowledge distribution across repositories.",
              icon: "👥",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-[var(--muted)]">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="text-center py-16 border-t border-[var(--border)]">
          <p className="text-[var(--muted)] mb-4">Built by developers, for developers</p>
          <div className="flex items-center justify-center gap-8 text-2xl font-bold">
            <div>
              <div className="text-[var(--primary)]">230+</div>
              <div className="text-sm text-[var(--muted)]">Repos Scanned</div>
            </div>
            <div>
              <div className="text-[var(--success)]">179</div>
              <div className="text-sm text-[var(--muted)]">Tests Passing</div>
            </div>
            <div>
              <div className="text-[var(--warning)]">100%</div>
              <div className="text-sm text-[var(--muted)]">GitHub API</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--muted)]">
          <span>© 2026 Repo Atlas by Utlyze</span>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
