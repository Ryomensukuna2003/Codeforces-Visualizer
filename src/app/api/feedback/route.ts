import { NextRequest, NextResponse } from "next/server";
import { requirePrisma } from "@/lib/prisma";
import { HONEYPOT_FIELD, validateFeedback } from "@/lib/feedback";

/**
 * There is no application-level throttle here any more.
 *
 * The Redis one that used to live here had been dead for a long time — the
 * configured host stopped resolving, and `isRateLimited` returned `false` on
 * every call, so the endpoint was already unthrottled in production. Removing it
 * drops the pretence, not the protection.
 *
 * What still guards this route: the honeypot field, and the length bounds in
 * `validateFeedback`. If you want a real limit, put it at the platform edge
 * (Vercel Firewall rate limiting on /api/feedback) rather than in application
 * code that a cold start resets.
 */

export async function POST(request: NextRequest) {
  let prisma;
  try {
    prisma = requirePrisma();
  } catch {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  // Honeypot: answer as if it worked so a bot has nothing to tune against,
  // but store nothing.
  if (typeof payload[HONEYPOT_FIELD] === "string" && payload[HONEYPOT_FIELD]) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const result = validateFeedback(payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    await prisma.feedback.create({ data: result.value });
    // Deliberately returns no row: the response can't become a read channel
    // for other people's notes.
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[feedback] failed to save:", error);
    return NextResponse.json({ error: "Could not save that note." }, { status: 500 });
  }
}

/** Total notes received — the only thing this endpoint will read back out. */
export async function GET() {
  let prisma;
  try {
    prisma = requirePrisma();
  } catch {
    return NextResponse.json({ count: 0 });
  }

  try {
    return NextResponse.json({ count: await prisma.feedback.count() });
  } catch (error) {
    console.error("[feedback] failed to count:", error);
    return NextResponse.json({ count: 0 });
  }
}
