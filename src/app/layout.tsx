import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Repo Atlas", template: "%s | Repo Atlas" },
  description:
    "Scan, analyze, and map your GitHub repositories. Health scores, dependency maps, and actionable insights.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Repo Atlas",
    description: "Map your entire GitHub universe",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
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
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded-lg"
        >
          Skip to content
        </a>
        {children}
      </body>
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
