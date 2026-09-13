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

function keyKind(value: string | undefined): string {
  if (!value) return "missing";
  if (value.startsWith("sb_secret_")) return "sb_secret";
  if (value.startsWith("sb_publishable_")) return "sb_publishable";
  if (value.startsWith("eyJ")) return "legacy_jwt";
  return "unknown";
}

function envReady() {
  return {
    vapidPublic: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    vapidPrivate: Boolean(process.env.VAPID_PRIVATE_KEY),
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleKind: keyKind(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

function serializeError(err: unknown) {
  if (err instanceof Error) {
    const extra = err as Error & {
      statusCode?: number;
      body?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    return {
      error: extra.message || extra.name || "Cron failed",
      code: extra.code,
      details: extra.details,
      hint: extra.hint,
      statusCode: extra.statusCode,
      body: typeof extra.body === "string" ? extra.body.slice(0, 400) : undefined,
    };
  }
  if (err && typeof err === "object") {
    const extra = err as {
      message?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
      statusCode?: unknown;
      body?: unknown;
    };
    return {
      error: String(extra.message ?? "Cron failed"),
      code: extra.code,
      details: extra.details,
      hint: extra.hint,
      statusCode: extra.statusCode,
      body: typeof extra.body === "string" ? extra.body.slice(0, 400) : undefined,
    };
  }
  return { error: String(err) };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await sendDueReminders();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ...serializeError(err), env: envReady() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
