import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { WALL } from "./dossier";

/**
 * tailwind-merge has to be told about the seven named type steps.
 * `text-meta` / `text-body` / `text-label` are not sizes it recognises, so it
 * filed them under text-*colour* and dropped the size whenever a colour class
 * appeared in the same `cn()` — `cn("text-meta", "text-tier-2")` was resolving
 * to `text-tier-2` alone, silently losing the size on rating and marker cells.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "title", "stat", "lead", "body", "meta", "label"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function processSingleHeatMapData(
  allSubmissionsData: any
): { date: string; desktop: number }[] {
  let HeatMapData = allSubmissionsData.result.map((submission: any) => {
    return {
      x: submission.creationTimeSeconds,
      y: submission.problem.rating,
    };
  });
  const groupedByDate = HeatMapData.reduce((acc: any, curr: any) => {
    const date = new Date(curr.x * 1000).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {});

  const groupedHeatMapData = Object.keys(groupedByDate).map((date) => {
    return {
      date: date,
      desktop: groupedByDate[date],
    };
  });
  return groupedHeatMapData;
}

export const processRatings = (
  allRating: any,
  setBestRatingChange: Function,
  setWorstRatingChange: Function,
  setBestRank: Function,
  setWorstRank: Function,
  setAverageRatingChange: Function
) => {
  // Accumulate into locals and set once. Folding Math.min/max over the previous
  // React state carried the last handle's records into the next one — switching
  // from a grandmaster to a newbie kept the grandmaster's best rank forever.
  let total = 0;
  let rated = 0;
  let bestChange = 0;
  let worstChange = 0;
  let bestRank = Number.MAX_SAFE_INTEGER;
  let worstRank = 0;

  allRating.result.forEach(
    (element: { rank: number; oldRating: number; newRating: number }) => {
      if (!element.rank) return;

      // Ranks count for every contest, including the first.
      bestRank = Math.min(bestRank, element.rank);
      worstRank = Math.max(worstRank, element.rank);

      // Codeforces reports `oldRating: 0` for a user's seeding contest, so its
      // "delta" is the whole starting rating — a +1508 that is not a gain. It
      // would own the best-gain stat outright and inflate the average by an
      // order of magnitude. /rating_change already excludes it; this makes the
      // overview and the coach agree with it.
      if (element.oldRating === 0) return;

      const ratingChange = element.newRating - element.oldRating;
      total += ratingChange;
      rated += 1;
      bestChange = Math.max(bestChange, ratingChange);
      worstChange = Math.min(worstChange, ratingChange);
    }
  );

  setBestRatingChange(bestChange);
  setWorstRatingChange(worstChange);
  setBestRank(bestRank);
  setWorstRank(worstRank);
  // Averaged over the contests actually counted, not over every row — and
  // guarded, because an unrated-only history divides by zero.
  setAverageRatingChange(rated ? total / rated : 0);
};

/**
 * Mean rating of the problems solved, weighted by how many were solved at each
 * rating. Averaging the distinct buckets instead put a user with 100 solves at
 * 800 and one at 2000 on an "average" of 1400.
 */
export const processBarGraphData = (
  barGraphData: { rating: number; count: number }[],
  setAverageAcceptedProblemRating: Function
) => {
  let sum = 0;
  let solved = 0;
  for (const element of barGraphData ?? []) {
    sum += (element.rating ?? 0) * element.count;
    solved += element.count;
  }
  setAverageAcceptedProblemRating(solved ? Math.round(sum / solved) : 0);
};

export const processSubmissions = (
  allSubmissionsData: any,
  setTagStatistics: Function,
  setTotalAcceptedProblems: Function,
  uniqueProblems: Set<string>,
  ratingFreqMap: Map<number, number>
) => {
  // Counted into a Map and set once. The sort-and-scan it replaces only pushed a
  // group when it hit a boundary, so the alphabetically-last tag was always
  // dropped — and a user with exactly one solved tag got an empty list.
  const tagCounts = new Map<string, number>();
  allSubmissionsData.result.forEach(
    (submission: {
      verdict: string;
      problem: { tags: string[]; rating: number; name: string };
    }) => {
      if (submission.verdict !== "OK") return;
      submission.problem.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    }
  );
  setTagStatistics(
    Array.from(tagCounts, ([tag, count]) => ({ tag, count })).sort(
      (a, b) => b.count - a.count
    )
  );

  allSubmissionsData.result.forEach(
    (submission: {
      verdict: string;
      problem: { rating: number; name: string };
    }) => {
      const problemKey = `${submission.problem.name}|${submission.problem.rating}`;
      if (submission.verdict === "OK" && !uniqueProblems.has(problemKey)) {
        setTotalAcceptedProblems((prev: number) => prev + 1);
        uniqueProblems.add(problemKey);
        const problemRating = submission.problem.rating;
        if (problemRating) {
          ratingFreqMap.set(
            problemRating,
            (ratingFreqMap.get(problemRating) || 0) + 1
          );
        }
      }
    }
  );
};

export const processRatingGraph = (allRating: any, ratingArr: any[]) => {
  allRating.result.forEach(
    (element: { contestName: string; newRating: number }) => {
      let x = {
        contestName: element.contestName,
        rating: element.newRating,
      };
      ratingArr.push(x);
    }
  );
};

export const processRatingFreqGraph = (
  ratingFreqMap: Map<number, number>,
  ratingFreq: any[]
) => {
  ratingFreqMap.forEach((count, rating) => {
    let x = {
      rating: rating,
      count: count,
    };
    ratingFreq.push(x);
  });
  ratingFreq.sort((a, b) => a.rating - b.rating);
};

export const getUpcomingContests = (contestData: any, now: number) => {
  return contestData.result
    .filter(
      (contest: { phase: string; startTimeSeconds: number }) =>
        contest.phase === "BEFORE" && contest.startTimeSeconds > now
    )
    .sort(
      (a: { startTimeSeconds: number }, b: { startTimeSeconds: number }) =>
        a.startTimeSeconds - b.startTimeSeconds
    );
};

// Dossier derived values ---------------------------------------------------
// Everything below is computed from data the app already fetches — no new
// requests, no new global state. See design_handoff_cf_dossier/README.md.


export type DossierSubmission = {
  id: number;
  verdict: string;
  creationTimeSeconds: number;
  relativeTimeSeconds?: number;
  programmingLanguage: string;
  timeConsumedMillis?: number;
  memoryConsumedBytes?: number;
  author?: { participantType?: string };
  problem: {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
  };
};

/** Codeforces returns submissions newest-first; several readouts need that order. */
const subsOf = (allSubmissionsData: any): DossierSubmission[] =>
  Array.isArray(allSubmissionsData?.result) ? allSubmissionsData.result : [];

const ratingsOf = (allRating: any): any[] =>
  Array.isArray(allRating?.result) ? allRating.result : [];

const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);

/**
 * AC rate below vs. above the user's own rating — the core figure in "The verdict".
 * The pivot is the user's rating floored to the nearest 100 so the sentence reads
 * as a round number ("52% on ≤1500 problems") rather than "≤1543".
 */
/**
 * The rung a rating sits on — the pivot the verdict splits AC rate around, and
 * the floor of the "in your reach" band on /compare. Extracted so the two pages
 * cannot drift into disagreeing about where your ceiling is.
 */
export function reachFloor(rating: number): number {
  return Math.max(800, Math.floor((rating || 800) / 100) * 100);
}

export function acRateSplit(allSubmissionsData: any, userRating: number) {
  const pivot = reachFloor(userRating);
  const acc = {
    pivot,
    below: { ac: 0, total: 0, rate: 0 },
    above: { ac: 0, total: 0, rate: 0 },
    overall: { ac: 0, total: 0, rate: 0 },
  };

  for (const s of subsOf(allSubmissionsData)) {
    const isAc = s.verdict === "OK";
    acc.overall.total++;
    if (isAc) acc.overall.ac++;
    const r = s.problem?.rating;
    if (!r) continue;
    const side = r <= pivot ? acc.below : acc.above;
    side.total++;
    if (isAc) side.ac++;
  }

  acc.below.rate = pct(acc.below.ac, acc.below.total);
  acc.above.rate = pct(acc.above.ac, acc.above.total);
  acc.overall.rate = pct(acc.overall.ac, acc.overall.total);
  return acc;
}

/**
 * Rating movement over the trailing 30 days. Measured from the `oldRating` the
 * user carried into the first in-window contest, so a single contest still
 * yields a real delta.
 *
 * `null` means "no rated contest in the window", which is a different fact from
 * a measured net zero. Returning 0 for both let the verdict tell someone who has
 * not competed in a month that they are "flat over the last 30 days".
 */
export function deltaLast30d(allRating: any): number | null {
  const cutoff = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
  const window = ratingsOf(allRating)
    .filter((r) => r.ratingUpdateTimeSeconds >= cutoff)
    .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);
  if (!window.length) return null;
  return window[window.length - 1].newRating - window[0].oldRating;
}

export type TagRate = { tag: string; ac: number; attempts: number; rate: number };

/** `*special` is a Codeforces meta-tag, not a topic — never a weakness. */
const NON_TOPIC_TAGS = new Set(["*special"]);

/**
 * Per-tag AC ÷ attempts, weakest first. `minAttempts` keeps a single failed
 * submission on an exotic tag from topping the list.
 */
export function weakTags(allSubmissionsData: any, minAttempts = 4): TagRate[] {
  const map = new Map<string, { ac: number; attempts: number }>();
  for (const s of subsOf(allSubmissionsData)) {
    for (const tag of s.problem?.tags ?? []) {
      if (NON_TOPIC_TAGS.has(tag)) continue;
      const e = map.get(tag) ?? { ac: 0, attempts: 0 };
      e.attempts++;
      if (s.verdict === "OK") e.ac++;
      map.set(tag, e);
    }
  }
  return Array.from(map, ([tag, e]) => ({ tag, ...e, rate: pct(e.ac, e.attempts) }))
    .filter((t) => t.attempts >= minAttempts)
    .sort((a, b) => a.rate - b.rate || b.attempts - a.attempts);
}

/**
 * Solved-problem keys (`name|rating`) straight from the submission history.
 *
 * The sub-pages are the point of this redesign, so they must not depend on the
 * overview having been visited first — `useUsernameStore().Attempted` is only
 * populated as a side effect of parsing on `/`.
 */
export function solvedKeys(allSubmissionsData: any): Set<string> {
  const out = new Set<string>();
  for (const s of subsOf(allSubmissionsData)) {
    if (s.verdict === "OK" && s.problem) {
      out.add(`${s.problem.name}|${s.problem.rating}`);
    }
  }
  return out;
}

/** The tag behind the most failures, over the most recent `n` failed submissions. */
export function dominantFailureTag(allSubmissionsData: any, n = 12) {
  const failed = subsOf(allSubmissionsData)
    .filter((s) => s.verdict !== "OK")
    .slice(0, n);
  const counts = new Map<string, number>();
  for (const s of failed) {
    for (const tag of s.problem?.tags ?? []) {
      // `*special` is a Codeforces meta-tag, not a topic — naming it as the
      // thing you keep failing tells the reader nothing actionable.
      if (NON_TOPIC_TAGS.has(tag)) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const top = Array.from(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? { tag: top[0], count: top[1], of: failed.length } : null;
}

export type Rung = { rating: number; solved: number; total: number; pct: number };

/**
 * Solved-unique ÷ total-in-problemset per 100-point rung — the /problems ladder.
 * `attempted` is the store's `name|rating` key list.
 */
export function rungCoverage(
  problemset: { rating?: number; name: string }[],
  attempted: string[],
  from = 800,
  to = 2000,
  step = 100
): Rung[] {
  const solved = new Set(attempted);
  const rungs = new Map<number, Rung>();
  for (let r = from; r <= to; r += step) {
    rungs.set(r, { rating: r, solved: 0, total: 0, pct: 0 });
  }
  for (const p of problemset) {
    if (!p.rating) continue;
    const bucket = Math.floor(p.rating / step) * step;
    const rung = rungs.get(bucket);
    if (!rung) continue;
    rung.total++;
    if (solved.has(`${p.name}|${p.rating}`)) rung.solved++;
  }
  const out = Array.from(rungs.values());
  for (const r of out) r.pct = pct(r.solved, r.total);
  return out;
}

/**
 * The /submissions summary strip. `fastestAc` is the quickest in-contest solve
 * (seconds from contest start), which is what the design's `4:19` reads as.
 */
export function submissionSummary(allSubmissionsData: any) {
  const subs = subsOf(allSubmissionsData);
  const attemptsByProblem = new Map<string, number>();
  const solvedProblems = new Set<string>();
  const failsByTag = new Map<string, number>();
  let ac = 0;
  let fastestAc: number | null = null;

  for (const s of subs) {
    const key = `${s.problem?.contestId ?? "x"}${s.problem?.index ?? s.problem?.name}`;
    attemptsByProblem.set(key, (attemptsByProblem.get(key) ?? 0) + 1);
    if (s.verdict === "OK") {
      ac++;
      solvedProblems.add(key);
      const t = s.relativeTimeSeconds;
      // CF uses a sentinel ~2^31 for out-of-contest practice submissions.
      if (typeof t === "number" && t > 0 && t < 24 * 3600) {
        if (fastestAc === null || t < fastestAc) fastestAc = t;
      }
    } else {
      for (const tag of s.problem?.tags ?? []) {
        failsByTag.set(tag, (failsByTag.get(tag) ?? 0) + 1);
      }
    }
  }

  let attemptsOnSolved = 0;
  solvedProblems.forEach((key) => {
    attemptsOnSolved += attemptsByProblem.get(key) ?? 0;
  });

  const mostFailedTag = Array.from(failsByTag).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    total: subs.length,
    ac,
    acRate: pct(ac, subs.length),
    solved: solvedProblems.size,
    attemptsPerSolve: solvedProblems.size
      ? Math.round((attemptsOnSolved / solvedProblems.size) * 10) / 10
      : 0,
    fastestAc,
    mostFailedTag,
  };
}

/** Last `n` verdicts as pass/fail, oldest first so the newest sits on the right. */
export function verdictTape(allSubmissionsData: any, n = 60): boolean[] {
  return subsOf(allSubmissionsData)
    .slice(0, n)
    .map((s) => s.verdict === "OK")
    .reverse();
}

export type TagCost = {
  tag: string;
  seconds: number;
  problems: string[];
  failures: number;
};

/**
 * Per-tag time cost inside one contest — the /analysis "tags that cost you" panel.
 * A problem's wasted time is charged in full to every tag it carries: a tag that
 * appears on an expensive problem cost you that time, and a tag spanning two bad
 * problems ranks above one that only appears on a single problem.
 */
export function timeCostPerTag(
  problems: { index: string; tags: string[]; solved: boolean; verdicts: string[] }[],
  wastedByProblem: Map<string, number>
): TagCost[] {
  const map = new Map<string, TagCost>();
  for (const p of problems) {
    const wasted = wastedByProblem.get(p.index) ?? 0;
    const failed = p.verdicts.filter((v) => v !== "OK").length;
    if (wasted <= 0 && failed === 0) continue;
    for (const tag of p.tags) {
      const e = map.get(tag) ?? { tag, seconds: 0, problems: [], failures: 0 };
      e.seconds += wasted;
      e.failures += failed > 0 || !p.solved ? 1 : 0;
      if (!e.problems.includes(p.index)) e.problems.push(p.index);
      map.set(tag, e);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.seconds - a.seconds || b.failures - a.failures);
}

export type VerdictPart = { text: string; bold?: boolean; accent?: boolean };

/**
 * "The verdict" — one plain-English sentence answering "am I improving?", built
 * from real data with the damning figures marked for emphasis. Highest-value
 * element on the overview, so it never renders placeholder copy.
 */
export function buildVerdict(
  allSubmissionsData: any,
  allRating: any,
  userRating: number
): VerdictPart[] {
  const split = acRateSplit(allSubmissionsData, userRating);
  const d30 = deltaLast30d(allRating);
  const fail = dominantFailureTag(allSubmissionsData);
  const parts: VerdictPart[] = [];

  const lopsided = split.above.total > 0 && split.above.rate < split.below.rate * 0.6;

  if (!split.overall.total) {
    return [{ text: "No submissions yet — solve something and this fills in." }];
  }

  if (d30 === null) {
    parts.push({ text: "No rated contest in the last 30 days. " });
  } else if (d30 > 0 && lopsided) {
    parts.push({ text: "You are improving — but only below " });
    parts.push({ text: String(split.pivot), bold: true });
    parts.push({ text: ". " });
  } else if (d30 > 0 && split.above.total > 0) {
    parts.push({ text: "You are improving, and it is holding above " });
    parts.push({ text: String(split.pivot), bold: true });
    parts.push({ text: ". " });
  } else if (d30 > 0) {
    // Nothing attempted above the pivot, so there is no "holding above" to
    // claim — the closing sentence says exactly that, and the two together
    // used to contradict each other.
    parts.push({ text: "You are improving. " });
  } else if (d30 < 0) {
    parts.push({ text: "You are sliding — " });
    parts.push({ text: `${d30}`, bold: true, accent: true });
    parts.push({ text: " in the last 30 days. " });
  } else {
    parts.push({ text: "You are flat over the last 30 days. " });
  }

  if (split.above.total > 0) {
    parts.push({ text: "Your AC rate is " });
    parts.push({ text: `${split.below.rate}%`, bold: true });
    parts.push({ text: ` on ≤${split.pivot} problems and ` });
    parts.push({ text: `${split.above.rate}%`, bold: true, accent: lopsided });
    parts.push({ text: " above it. " });
  } else {
    parts.push({ text: "You have not attempted anything above " });
    parts.push({ text: String(split.pivot), bold: true });
    parts.push({ text: " yet. " });
  }

  if (fail && fail.count > 1) {
    parts.push({ text: `${fail.count} of your last ${fail.of} failed submissions were ` });
    parts.push({ text: fail.tag, bold: true });
    parts.push({ text: "." });
  }

  return parts;
}

/** Does this problem sit on one of the user's weak tags? Drives the FOR YOU badge. */
export function isRecommended(tags: string[], weak: Set<string>, rating?: number): boolean {
  if (!rating || rating < WALL - 200) return false;
  return tags.some((t) => weak.has(t));
}
