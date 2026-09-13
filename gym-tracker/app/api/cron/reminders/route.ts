import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders/sendDue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function envReady() {
  return {
    vapidPublic: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    vapidPrivate: Boolean(process.env.VAPID_PRIVATE_KEY),
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await sendDueReminders();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cron failed";
    return NextResponse.json({ error: message, env: envReady() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
