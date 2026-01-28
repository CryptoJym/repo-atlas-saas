import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-xl font-bold">Repo Atlas</span>
        </Link>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium">
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

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-[var(--muted)]">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Clerk PricingTable - plans configured in Clerk Dashboard */}
        <SignedIn>
          <div className="max-w-4xl mx-auto">
            <PricingTable />
          </div>
        </SignedIn>

        {/* Fallback pricing cards for signed-out users */}
        <SignedOut>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-[var(--muted)]">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Scan up to 10 repos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Basic health scores
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Public repos only
                </li>
              </ul>
              <SignInButton mode="modal">
                <button className="w-full py-2 rounded-lg border border-[var(--border)] hover:border-[var(--muted)] transition font-medium">
                  Get Started
                </button>
              </SignInButton>
            </div>

            {/* Dev - $15/mo */}
            <div className="rounded-xl border-2 border-[var(--primary)] bg-[var(--card)] p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] rounded-full text-xs font-bold">
                POPULAR
              </div>
              <h3 className="text-lg font-semibold mb-2">Developer</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$15</span>
                <span className="text-[var(--muted)]">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Unlimited repo scans
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Private repos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Advanced health scoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Dependency analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Export reports
                </li>
              </ul>
              <SignInButton mode="modal">
                <button className="w-full py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium">
                  Start Free Trial
                </button>
              </SignInButton>
            </div>

            {/* Team - $49/mo */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
              <h3 className="text-lg font-semibold mb-2">Team</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-[var(--muted)]">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Everything in Developer
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Organization scanning
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Team activity reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> API access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--success)]">✓</span> Priority support
                </li>
              </ul>
              <SignInButton mode="modal">
                <button className="w-full py-2 rounded-lg border border-[var(--border)] hover:border-[var(--muted)] transition font-medium">
                  Start Free Trial
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
