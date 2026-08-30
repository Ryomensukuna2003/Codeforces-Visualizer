/**
 * What the product records about itself.
 *
 * Two things, and deliberately only two:
 *
 *  - a **Snapshot**: the derived numbers for one handle on one day. Everything in
 *    it is public on that handle's own Codeforces profile. It exists because
 *    Codeforces has no endpoint for what your AC rate or tag distribution looked
 *    like three months ago — `user.rating` is a rating history and nothing else.
 *  - a **DailyMetric**: an aggregate counter, one per name per day. No session
 *    id, no handle, no ordering, so no individual's path can be reconstructed.
 *
 * Route-level traffic is already covered by Vercel Analytics (mounted in
 * `layout.tsx`) and is not duplicated here.
 */

/**
 * Counter names. A closed set so the table can't grow a long tail of typos.
 *
 * Failure counters alone can only ever answer "how often does this break". They
 * cannot answer "does anyone use this", so every judgement about which features
 * earn their keep was a guess. Each `:failed` now has a success partner, and the
 * pair is the useful unit: `coach:failed / coach:clicked` is a failure *rate*,
 * where either number alone is unreadable.
 */
export const METRICS = [
  "fetch:invalid-handle",
  "fetch:unreachable",
  "problemset:failed",
  "coach:failed",
  "compare:failed",
  "feedback:sent",
  // Successes. Denominators for the counters above, and the only evidence that
  // a screen is reached at all.
  "overview:loaded",
  "coach:clicked",
  "compare:completed",
] as const;

export type MetricName = (typeof METRICS)[number];

export function isMetricName(value: unknown): value is MetricName {
  return typeof value === "string" && (METRICS as readonly string[]).includes(value);
}

/** The shape `/api/snapshot` accepts. Mirrors the Prisma model, minus the keys. */
export type SnapshotInput = {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  solved: number;
  submissions: number;
  acRate: number;
  avgSolvedRating: number;
  contests: number;
  bestRank: number | null;
  worstRank: number | null;
  avgRatingChange: number;
  bestRatingChange: number;
  worstRatingChange: number;
  accuracy: number;
  range: number;
  power: number;
  speed: number;
  durability: number;
  potential: number | null;
  tagCounts: Record<string, number>;
};

/** Codeforces caps handles at 24 characters; anything longer is not one. */
const HANDLE_MAX = 24;
const HANDLE_RE = /^[A-Za-z0-9_.-]{1,24}$/;

/** Tag maps are capped so one malformed post can't write an unbounded blob. */
const MAX_TAGS = 64;

type Validated =
  | { ok: true; value: SnapshotInput }
  | { ok: false; error: string };

const int = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;

/**
 * Validate a posted snapshot.
 *
 * This is a public endpoint with no auth, so nothing is trusted: every number is
 * coerced and clamped, and the tag map is bounded. A bad post is rejected rather
 * than partially written — a half-filled row would silently corrupt any trend
 * built on top of it.
 */
export function validateSnapshot(body: unknown): Validated {
  if (!body || typeof body !== "object") return { ok: false, error: "Expected an object" };
  const b = body as Record<string, unknown>;

  const handle = typeof b.handle === "string" ? b.handle.trim() : "";
  if (!handle) return { ok: false, error: "handle is required" };
  if (handle.length > HANDLE_MAX || !HANDLE_RE.test(handle)) {
    return { ok: false, error: "handle is not a valid Codeforces handle" };
  }

  const required: (keyof SnapshotInput)[] = [
    "solved",
    "submissions",
    "acRate",
    "avgSolvedRating",
    "contests",
    "avgRatingChange",
    "bestRatingChange",
    "worstRatingChange",
    "accuracy",
    "range",
    "power",
    "speed",
    "durability",
  ];
  for (const key of required) {
    if (typeof b[key] !== "number" || !Number.isFinite(b[key] as number)) {
      return { ok: false, error: `${key} must be a finite number` };
    }
  }

  const tagCounts: Record<string, number> = {};
  if (b.tagCounts && typeof b.tagCounts === "object") {
    for (const [tag, count] of Object.entries(b.tagCounts as Record<string, unknown>)) {
      if (Object.keys(tagCounts).length >= MAX_TAGS) break;
      const n = int(count);
      if (typeof tag === "string" && tag.length <= 48 && n !== null && n >= 0) {
        tagCounts[tag] = n;
      }
    }
  }

  const clamp100 = (v: unknown) => Math.min(100, Math.max(0, int(v) ?? 0));

  return {
    ok: true,
    value: {
      handle,
      rating: int(b.rating),
      maxRating: int(b.maxRating),
      rank: typeof b.rank === "string" ? b.rank.slice(0, 32) : null,
      maxRank: typeof b.maxRank === "string" ? b.maxRank.slice(0, 32) : null,
      solved: Math.max(0, int(b.solved)!),
      submissions: Math.max(0, int(b.submissions)!),
      acRate: Math.min(100, Math.max(0, b.acRate as number)),
      avgSolvedRating: Math.max(0, int(b.avgSolvedRating)!),
      contests: Math.max(0, int(b.contests)!),
      // `Number.MAX_SAFE_INTEGER` is the app's "no rank yet" sentinel; it must
      // not reach the column, where it would look like a real worst-ever rank.
      bestRank:
        int(b.bestRank) !== null && (b.bestRank as number) < Number.MAX_SAFE_INTEGER
          ? int(b.bestRank)
          : null,
      worstRank: int(b.worstRank),
      avgRatingChange: b.avgRatingChange as number,
      bestRatingChange: int(b.bestRatingChange)!,
      worstRatingChange: int(b.worstRatingChange)!,
      accuracy: clamp100(b.accuracy),
      range: clamp100(b.range),
      power: clamp100(b.power),
      speed: clamp100(b.speed),
      durability: clamp100(b.durability),
      potential: b.potential === null || b.potential === undefined ? null : clamp100(b.potential),
      tagCounts,
    },
  };
}

/** Today as a date with no time component — the key both tables are stamped by. */
export function today(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
