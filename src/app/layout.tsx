import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repo Atlas - GitHub Repository Scanner & Mapper",
  description:
    "Scan, analyze, and map your GitHub repositories. Get health scores, activity metrics, and dependency analysis for your entire codebase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#141414",
          colorText: "#ededed",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#ededed",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
