"use client";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
      <div className="text-3xl mb-3">⚠️</div>
      <h2 className="text-xl font-bold mb-2">Settings failed to load</h2>
      <p className="text-sm text-[var(--muted)] mb-6">
        {error.message || "Something went wrong while loading settings."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium"
      >
        Try Again
      </button>
    </div>
  );
}
