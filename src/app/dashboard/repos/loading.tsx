export default function ReposLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse mb-6">
          <div className="h-6 w-56 bg-[var(--card)] border border-[var(--border)] rounded-md" />
          <div className="h-4 w-80 bg-[var(--card)] border border-[var(--border)] rounded-md mt-3" />
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`repo-${index}`} className="animate-pulse p-4">
              <div className="h-4 w-52 bg-[var(--background)] rounded" />
              <div className="mt-2 h-3 w-72 bg-[var(--background)] rounded" />
              <div className="mt-3 h-3 w-24 bg-[var(--background)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
