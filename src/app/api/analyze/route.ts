import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getScanner } from "@/lib/github";
import { getCachedAnalysis, getOrCreateUser, saveAnalysis } from "@/lib/scan-cache";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scanner = await getScanner();
  if (!scanner) {
    return NextResponse.json(
      { error: "GitHub not connected" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { owner, repo } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing owner or repo" },
        { status: 400 }
      );
    }

    let supabaseUserId: string | null = null;
    try {
      supabaseUserId = await getOrCreateUser(userId);
    } catch (error) {
      console.error("Supabase user sync error:", error);
    }

    if (supabaseUserId) {
      try {
        const cached = await getCachedAnalysis(supabaseUserId, owner, repo);
        if (cached) {
          return NextResponse.json(cached);
        }
      } catch (error) {
        console.error("Supabase analysis cache error:", error);
      }
    }

    const analysis = await scanner.analyzeRepo(owner, repo);
    if (supabaseUserId) {
      try {
        await saveAnalysis(supabaseUserId, owner, repo, analysis);
      } catch (error) {
        console.error("Supabase analysis save error:", error);
      }
    }
    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
