"use client";

import { useEffect } from "react";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-xl mx-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-[var(--muted)] mb-6">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
