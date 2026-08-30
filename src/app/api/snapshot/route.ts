import { NextRequest, NextResponse } from "next/server";
import { requirePrisma } from "@/lib/prisma";
import { today, validateSnapshot } from "@/lib/analytics";

/**
 * Record one handle's derived stats for today.
 *
 * Upsert on `(handle, capturedOn)`, so refreshing the page all afternoon writes
 * one row, not one per load. The table this replaces appended a row on every
 * fetch — twice, because the save call was duplicated — and nothing ever read
 * them back.
 */
export async function POST(request: NextRequest) {
  let prisma;
  try {
    prisma = requirePrisma();
  } catch {
    // No database configured is a fine state to be in; the dossier does not
    // depend on this write.
    return NextResponse.json({ recorded: false }, { status: 200 });
  }

  const result = validateSnapshot(await request.json().catch(() => null));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { handle, ...stats } = result.value;

  try {
    await prisma.snapshot.upsert({
      where: { handle_capturedOn: { handle, capturedOn: today() } },
      create: { handle, capturedOn: today(), ...stats },
      update: stats,
    });
    return NextResponse.json({ recorded: true }, { status: 200 });
  } catch (error) {
    console.error("[snapshot] failed to record:", error);
    return NextResponse.json({ recorded: false }, { status: 200 });
  }
}

/**
 * A handle's own history, oldest first — the thing this table exists to make
 * possible. Public data about a public profile, and nothing about how the site
 * was used.
 */
export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle")?.trim();
  if (!handle) {
    return NextResponse.json({ error: "handle is required" }, { status: 400 });
  }

  let prisma;
  try {
    prisma = requirePrisma();
  } catch {
    return NextResponse.json({ history: [] });
  }

  try {
    const history = await prisma.snapshot.findMany({
      where: { handle },
      orderBy: { capturedOn: "asc" },
      take: 400,
      select: {
        capturedOn: true,
        rating: true,
        solved: true,
        submissions: true,
        acRate: true,
        avgSolvedRating: true,
        contests: true,
        accuracy: true,
        range: true,
        power: true,
        speed: true,
        durability: true,
        potential: true,
      },
    });
    return NextResponse.json({ history });
  } catch (error) {
    console.error("[snapshot] failed to read history:", error);
    return NextResponse.json({ history: [] });
  }
}
