import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServerSupabase } from "@/lib/supabase";

type ClerkWebhookEvent = {
  type: string;
  data: ClerkUser;
};

type ClerkUser = {
  id: string;
  email_addresses?: { id: string; email_address: string }[];
  primary_email_address_id?: string | null;
  external_accounts?: { provider?: string | null; username?: string | null }[];
  username?: string | null;
};

function getPrimaryEmail(user: ClerkUser) {
  if (!user.email_addresses || user.email_addresses.length === 0) return null;

  if (user.primary_email_address_id) {
    const primary = user.email_addresses.find(
      (email) => email.id === user.primary_email_address_id
    );
    if (primary) return primary.email_address;
  }

  return user.email_addresses[0].email_address;
}

function getGithubUsername(user: ClerkUser) {
  const account = user.external_accounts?.find((acct) =>
    acct.provider?.toLowerCase().includes("github")
  );
  return account?.username || null;
}

async function upsertUser(user: ClerkUser) {
  const supabase = createServerSupabase();
  const payload = {
    clerk_user_id: user.id,
    email: getPrimaryEmail(user),
    github_username: getGithubUsername(user),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "clerk_user_id" });

  if (error) throw error;
}

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 });
  }

  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  const wh = new Webhook(secret);

  let evt: ClerkWebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (error) {
    console.error("Clerk webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    try {
      await upsertUser(evt.data);
    } catch (error) {
      console.error("Failed to sync Clerk user:", error);
      return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
