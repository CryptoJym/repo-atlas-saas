export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse mb-8">
          <div className="h-6 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md" />
          <div className="h-4 w-72 bg-[var(--card)] border border-[var(--border)] rounded-md mt-4" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`card-${index}`}
              className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
            >
              <div className="h-5 w-32 rounded bg-[var(--background)]" />
              <div className="mt-4 h-3 w-full rounded bg-[var(--background)]" />
              <div className="mt-2 h-3 w-5/6 rounded bg-[var(--background)]" />
              <div className="mt-8 h-8 w-24 rounded bg-[var(--background)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
