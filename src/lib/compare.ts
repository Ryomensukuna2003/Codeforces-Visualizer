/**
 * Two-handle comparison.
 *
 * The old `/compare` printed six pairs of numbers side by side, which is not a
 * comparison — it is two profiles in one viewport. Everything here is
 * *relational*: it needs both users to mean anything.
 *
 * The data was already being fetched and thrown away. `user.rating` returns
 * `contestId` and `rank` for every rated contest, so the set of contests two
 * handles both entered — and who finished higher in each — costs nothing beyond
 * an intersection. `ParseData` used to discard those fields before the page saw
 * them.
 *
 * No React, no axios: every function takes raw Codeforces payloads, so
 * `compare.test.mjs` imports this module directly rather than mirroring it.
 */

import type { VerdictPart } from "./utils";

/* Shared contests ---------------------------------------------------------- */

export type SharedContest = {
  contestId: number;
  contestName: string;
  ratingUpdateTimeSeconds: number;
  youRank: number;
  rivalRank: number;
  youRating: number;
  rivalRating: number;
  /** +1 you finished higher, -1 they did, 0 identical rank. */
  outcome: 1 | -1 | 0;
  /** Standings ratio, always >= 1. See the note below on why not a difference. */
  margin: number;
};

type RatingEntry = {
  contestId?: number;
  contestName?: string;
  rank?: number;
  newRating?: number;
  ratingUpdateTimeSeconds?: number;
};

function entriesOf(allRating: any): RatingEntry[] {
  const r = allRating?.result ?? allRating;
  return Array.isArray(r) ? r : [];
}

/**
 * Every rated contest both handles entered, oldest first.
 *
 * `margin` is a *ratio* of standings, not a difference. Rank distributions are
 * roughly logarithmic: finishing 7135th against 16348th is a 9213-place gap that
 * would own any "biggest wins" list outright, while 143rd against 63rd — a close
 * result near the top, where it is hardest to gain places — would rank last. The
 * ratio ranks those the way a competitor would.
 */
export function sharedContests(youRating: any, rivalRating: any): SharedContest[] {
  const mine = new Map<number, RatingEntry>();
  for (const e of entriesOf(youRating)) {
    if (typeof e.contestId === "number" && e.rank) mine.set(e.contestId, e);
  }

  const out: SharedContest[] = [];
  for (const theirs of entriesOf(rivalRating)) {
    if (typeof theirs.contestId !== "number" || !theirs.rank) continue;
    const ours = mine.get(theirs.contestId);
    if (!ours || !ours.rank) continue;

    const youRank = ours.rank;
    const rivalRank = theirs.rank;
    out.push({
      contestId: theirs.contestId,
      contestName: ours.contestName ?? theirs.contestName ?? `Contest ${theirs.contestId}`,
      ratingUpdateTimeSeconds:
        ours.ratingUpdateTimeSeconds ?? theirs.ratingUpdateTimeSeconds ?? 0,
      youRank,
      rivalRank,
      youRating: ours.newRating ?? 0,
      rivalRating: theirs.newRating ?? 0,
      outcome: youRank < rivalRank ? 1 : youRank > rivalRank ? -1 : 0,
      margin: Math.max(youRank, rivalRank) / Math.max(1, Math.min(youRank, rivalRank)),
    });
  }

  return out.sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);
}

/* The record --------------------------------------------------------------- */

export type H2HRecord = {
  met: number;
  won: number;
  lost: number;
  drawn: number;
  /** Share of *decided* meetings won, 0–100. 0 when they have never met. */
  winRate: number;
  /** Up to the last 10 decided meetings, oldest first. `true` = you won. */
  form: boolean[];
  biggestWin: SharedContest | null;
  biggestLoss: SharedContest | null;
};

export function h2hRecord(shared: SharedContest[]): H2HRecord {
  let won = 0;
  let lost = 0;
  let drawn = 0;
  let biggestWin: SharedContest | null = null;
  let biggestLoss: SharedContest | null = null;

  for (const c of shared) {
    if (c.outcome === 1) {
      won++;
      if (!biggestWin || c.margin > biggestWin.margin) biggestWin = c;
    } else if (c.outcome === -1) {
      lost++;
      if (!biggestLoss || c.margin > biggestLoss.margin) biggestLoss = c;
    } else {
      drawn++;
    }
  }

  // Ties are excluded from the denominator as well as from both tallies. The
  // helper this replaces counted a tie as a win for the left side and then in
  // neither bucket, so its "ahead" and "behind" did not sum to the metric count.
  const decided = won + lost;

  return {
    met: shared.length,
    won,
    lost,
    drawn,
    winRate: decided ? Math.round((won / decided) * 100) : 0,
    form: shared.filter((c) => c.outcome !== 0).slice(-10).map((c) => c.outcome === 1),
    biggestWin,
    biggestLoss,
  };
}

/* The gap over time -------------------------------------------------------- */

/**
 * Rating gap (you − rival) across the union of both timelines, each side's last
 * known rating carried forward between their own contests. Above zero you lead.
 *
 * Replaces `CompareRatingChange`, which sorted ISO date *strings* with
 * `(a, b) => a - b`. That is `NaN` for every pair, so the comparator never
 * reported an ordering and the series came out in Set-insertion order — all of
 * one user's contests, then the other's, appended out of sequence. Sorting on
 * the numeric `ratingUpdateTimeSeconds` is why this one is right by construction.
 */
export function gapSeries(
  youRating: any,
  rivalRating: any
): { t: number; gap: number; you: number; rival: number }[] {
  type Point = { t: number; rating: number; side: "you" | "rival" };
  const points: Point[] = [];

  for (const e of entriesOf(youRating)) {
    if (e.ratingUpdateTimeSeconds) {
      points.push({ t: e.ratingUpdateTimeSeconds, rating: e.newRating ?? 0, side: "you" });
    }
  }
  for (const e of entriesOf(rivalRating)) {
    if (e.ratingUpdateTimeSeconds) {
      points.push({ t: e.ratingUpdateTimeSeconds, rating: e.newRating ?? 0, side: "rival" });
    }
  }
  if (!points.length) return [];

  points.sort((a, b) => a.t - b.t);

  const out: { t: number; gap: number; you: number; rival: number }[] = [];
  let you = 0;
  let rival = 0;
  let seenYou = false;
  let seenRival = false;

  for (const p of points) {
    if (p.side === "you") {
      you = p.rating;
      seenYou = true;
    } else {
      rival = p.rating;
      seenRival = true;
    }
    // Nothing to compare until both sides have a rating; before that the gap
    // would be "your rating minus zero", which reads as a colossal lead.
    if (!seenYou || !seenRival) continue;

    const last = out[out.length - 1];
    if (last && last.t === p.t) {
      last.you = you;
      last.rival = rival;
      last.gap = you - rival;
    } else {
      out.push({ t: p.t, gap: you - rival, you, rival });
    }
  }

  return out;
}

/* Solved-problem sets ------------------------------------------------------ */

export type SolvedProblem = {
  /** `name|rating`, matching `solvedKeys()` in utils.ts so Div1/Div2 twins collapse. */
  key: string;
  contestId?: number;
  index?: string;
  name: string;
  rating?: number;
  tags: string[];
  /** Unix seconds of the most recent accepted submission — the practice sort key. */
  solvedAt: number;
};

export function solvedProblems(allSubmissionsData: any): Map<string, SolvedProblem> {
  const subs = allSubmissionsData?.result ?? allSubmissionsData;
  const out = new Map<string, SolvedProblem>();
  if (!Array.isArray(subs)) return out;

  for (const s of subs) {
    if (s?.verdict !== "OK") continue;
    const p = s.problem;
    if (!p?.name) continue;

    const key = `${p.name}|${p.rating}`;
    const at = s.creationTimeSeconds ?? 0;
    const existing = out.get(key);
    if (existing) {
      if (at > existing.solvedAt) existing.solvedAt = at;
      continue;
    }
    out.set(key, {
      key,
      contestId: p.contestId,
      index: p.index,
      name: p.name,
      rating: p.rating,
      tags: Array.isArray(p.tags) ? p.tags : [],
      solvedAt: at,
    });
  }
  return out;
}

export type SolveDiff = {
  yours: number;
  theirs: number;
  both: number;
  /** Problems only the rival has solved, their most recent solve first. */
  onlyTheirs: SolvedProblem[];
  onlyYours: number;
};

export function solveDiff(
  you: Map<string, SolvedProblem>,
  rival: Map<string, SolvedProblem>
): SolveDiff {
  let both = 0;
  let onlyYours = 0;
  you.forEach((_, key) => {
    if (rival.has(key)) both++;
    else onlyYours++;
  });

  const onlyTheirs: SolvedProblem[] = [];
  rival.forEach((p, key) => {
    if (!you.has(key)) onlyTheirs.push(p);
  });
  onlyTheirs.sort((a, b) => b.solvedAt - a.solvedAt);

  return { yours: you.size, theirs: rival.size, both, onlyTheirs, onlyYours };
}

/* Tag ledger --------------------------------------------------------------- */

export type TagLedgerRow = {
  tag: string;
  onlyYours: number;
  onlyTheirs: number;
  both: number;
};

/**
 * Per-tag set difference, biggest deficit first.
 *
 * Deliberately NOT a per-tag AC-rate comparison. AC rate is confounded by
 * difficulty: a rival rated 500 points above you attempts harder problems, so
 * their rate is lower in nearly every tag and the readout would cheerfully
 * report that you are stronger at everything. Counting the same problems on both
 * sides is difficulty-neutral by construction.
 */
export function tagLedger(
  you: Map<string, SolvedProblem>,
  rival: Map<string, SolvedProblem>,
  limit = 8
): TagLedgerRow[] {
  const rows = new Map<string, TagLedgerRow>();
  const row = (tag: string) => {
    let r = rows.get(tag);
    if (!r) rows.set(tag, (r = { tag, onlyYours: 0, onlyTheirs: 0, both: 0 }));
    return r;
  };

  you.forEach((p, key) => {
    const shared = rival.has(key);
    for (const tag of p.tags) {
      const r = row(tag);
      if (shared) r.both++;
      else r.onlyYours++;
    }
  });
  rival.forEach((p, key) => {
    if (you.has(key)) return; // already counted as `both`
    for (const tag of p.tags) row(tag).onlyTheirs++;
  });

  return Array.from(rows.values())
    .sort((a, b) => {
      const volume = (r: TagLedgerRow) => r.onlyYours + r.onlyTheirs + r.both;
      return volume(b) - volume(a);
    })
    .slice(0, limit)
    .sort((a, b) => b.onlyTheirs - b.onlyYours - (a.onlyTheirs - a.onlyYours));
}

/* The verdict -------------------------------------------------------------- */

/**
 * One sentence, in the same shape as the overview's verdict, answering "how do I
 * actually stack up against this person". Returns tagged parts so the figures can
 * be set in the display cut, exactly as `buildVerdict` does.
 */
export function buildH2HVerdict(params: {
  you: string;
  rival: string;
  youRating: number;
  rivalRating: number;
  record: H2HRecord;
  reachCount: number;
  reachFrom: number;
  reachTo: number;
}): VerdictPart[] {
  const { you, rival, youRating, rivalRating, record, reachCount, reachFrom, reachTo } = params;
  const parts: VerdictPart[] = [];
  const gap = Math.abs(youRating - rivalRating);
  const ahead = youRating > rivalRating;

  if (record.met === 0) {
    parts.push({ text: `You have never been in the same rated contest as ` });
    parts.push({ text: rival, bold: true });
    parts.push({ text: ". On paper you are " });
    parts.push({ text: String(gap), bold: true, accent: !ahead });
    parts.push({ text: ahead ? " ahead on rating" : " behind on rating" });
    parts.push({ text: ", and there is no head-to-head record to read. " });
  } else {
    parts.push({ text: "You have met " });
    parts.push({ text: rival, bold: true });
    parts.push({ text: " in " });
    parts.push({ text: String(record.met), bold: true });
    parts.push({ text: record.met === 1 ? " rated contest" : " rated contests" });
    parts.push({ text: " and finished ahead in " });
    parts.push({ text: String(record.won), bold: true, accent: record.winRate < 50 });
    parts.push({ text: ` — ${record.winRate}%. ` });

    if (gap > 0) {
      parts.push({ text: "You are " });
      parts.push({ text: String(gap), bold: true, accent: !ahead });
      parts.push({ text: ahead ? " ahead on rating today. " : " behind on rating today. " });
    } else {
      parts.push({ text: "You are level on rating today. " });
    }
  }

  if (reachCount > 0) {
    parts.push({ text: "They have solved " });
    parts.push({ text: String(reachCount), bold: true });
    parts.push({ text: ` problems between ${reachFrom} and ${reachTo} that you have not.` });
  } else {
    parts.push({ text: `Nothing they have solved in your ${reachFrom}–${reachTo} range is new to you.` });
  }

  return parts;
}
