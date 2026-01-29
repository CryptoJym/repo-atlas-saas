export default function AnalysisLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md" />
          <div className="h-4 w-72 bg-[var(--card)] border border-[var(--border)] rounded-md mt-3" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`analysis-${index}`}
              className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
            >
              <div className="h-4 w-36 rounded bg-[var(--background)]" />
              <div className="mt-4 h-32 w-full rounded bg-[var(--background)]" />
              <div className="mt-4 h-3 w-2/3 rounded bg-[var(--background)]" />
              <div className="mt-2 h-3 w-1/2 rounded bg-[var(--background)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
