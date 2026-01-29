import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repo Atlas - GitHub Repository Scanner & Mapper",
  description:
    "Scan, analyze, and map your GitHub repositories. Get health scores, activity metrics, and dependency analysis for your entire codebase.",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#3b82f6",
    colorBackground: "#141414",
    colorText: "#ededed",
    colorInputBackground: "#1a1a1a",
    colorInputText: "#ededed",
  },
};

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasValidClerkKey =
  publishableKey.startsWith("pk_test_") && !publishableKey.includes("PLACEHOLDER");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shell = (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );

  if (!hasValidClerkKey) {
    // During build or when Clerk isn't configured yet, render without ClerkProvider
    // so static pages (_not-found, etc.) can still be generated.
    return shell;
  }

  return (
    <ClerkProvider appearance={clerkAppearance}>
      {shell}
    </ClerkProvider>
  );
}
