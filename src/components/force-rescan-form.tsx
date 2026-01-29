"use client";

import { useState } from "react";

export function ForceRescanForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Scan failed");
      }

      setStatus("success");
      setMessage("Rescan started. Results will refresh shortly.");
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Scan failed";
      setStatus("error");
      setMessage(messageText);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Rescanning..." : "Force Rescan"}
      </button>
      {message && (
        <p
          className={`text-sm ${
            status === "error" ? "text-[var(--danger)]" : "text-[var(--muted)]"
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </form>
  );
}
