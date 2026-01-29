import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getScanner } from "@/lib/github";
import { getCachedScan, getOrCreateUser, saveScanResult } from "@/lib/scan-cache";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const org = body.org as string | undefined;
    const force = Boolean(body.force);

    let supabaseUserId: string | null = null;
    try {
      supabaseUserId = await getOrCreateUser(userId);
    } catch (error) {
      console.error("Supabase user sync error:", error);
    }

    if (supabaseUserId && !force) {
      try {
        const cached = await getCachedScan(supabaseUserId);
        if (cached && (!org || cached.owner === org)) {
          return NextResponse.json(cached);
        }
      } catch (error) {
        console.error("Supabase scan cache error:", error);
      }
    }

    const scanner = await getScanner();
    if (!scanner) {
      return NextResponse.json(
        { error: "GitHub not connected. Please connect your GitHub account via Settings." },
        { status: 400 }
      );
    }

    let result;
    if (org) {
      result = await scanner.scanOrgRepos(org);
    } else {
      result = await scanner.scanUserRepos();
    }

    if (supabaseUserId) {
      try {
        await saveScanResult(supabaseUserId, result);
      } catch (error) {
        console.error("Supabase scan save error:", error);
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Scan error:", error);
    const message = error instanceof Error ? error.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
