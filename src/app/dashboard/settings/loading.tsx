export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-lg bg-[var(--card)]" />
        <div className="h-4 w-72 rounded bg-[var(--card)]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-xl border border-[var(--border)] bg-[var(--card)]"
          />
        ))}
      </div>
      <div className="h-40 rounded-xl border border-[var(--border)] bg-[var(--card)]" />
    </div>
  );
}
