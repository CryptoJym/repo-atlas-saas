import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-bold text-[var(--primary)] mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-[var(--muted)] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
