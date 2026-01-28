import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getScanner } from "@/lib/github";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scanner = await getScanner();
  if (!scanner) {
    return NextResponse.json(
      { error: "GitHub not connected. Please connect your GitHub account via Settings." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const org = body.org as string | undefined;

    let result;
    if (org) {
      result = await scanner.scanOrgRepos(org);
    } else {
      result = await scanner.scanUserRepos();
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Scan error:", error);
    const message = error instanceof Error ? error.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
