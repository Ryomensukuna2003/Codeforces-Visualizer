import { NextRequest, NextResponse } from "next/server";
import { requirePrisma } from "@/lib/prisma";
import { isMetricName, today } from "@/lib/analytics";

/**
 * Bump one aggregate counter for today.
 *
 * Only failure paths call this, so the happy path costs no extra request — a
 * successful load is already counted by the snapshot it writes. The name has to
 * be one of the closed set in `analytics.ts`, so the table cannot grow a long
 * tail of typos, and nothing here identifies a caller.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = (body as { name?: unknown } | null)?.name;
  if (!isMetricName(name)) {
    return NextResponse.json({ error: "Unknown metric" }, { status: 400 });
  }

  let prisma;
  try {
    prisma = requirePrisma();
  } catch {
    return NextResponse.json({ counted: false }, { status: 200 });
  }

  try {
    await prisma.dailyMetric.upsert({
      where: { day_name: { day: today(), name } },
      create: { day: today(), name, count: 1 },
      update: { count: { increment: 1 } },
    });
    return NextResponse.json({ counted: true }, { status: 200 });
  } catch (error) {
    console.error("[metric] failed to count:", error);
    return NextResponse.json({ counted: false }, { status: 200 });
  }
}

/** The last 30 days of counters, plus daily snapshot volume for context. */
export async function GET() {
  let prisma;
  try {
    prisma = requirePrisma();
  } catch {
    return NextResponse.json({ metrics: [], snapshots: [] });
  }

  const since = new Date(today().getTime() - 29 * 24 * 60 * 60 * 1000);

  try {
    const [metrics, snapshots] = await Promise.all([
      prisma.dailyMetric.findMany({
        where: { day: { gte: since } },
        orderBy: [{ day: "asc" }, { name: "asc" }],
      }),
      prisma.snapshot.groupBy({
        by: ["capturedOn"],
        where: { capturedOn: { gte: since } },
        _count: { _all: true },
        orderBy: { capturedOn: "asc" },
      }),
    ]);

    return NextResponse.json({
      metrics,
      snapshots: snapshots.map((s) => ({
        day: s.capturedOn,
        handles: s._count._all,
      })),
    });
  } catch (error) {
    console.error("[metric] failed to read:", error);
    return NextResponse.json({ metrics: [], snapshots: [] });
  }
}
