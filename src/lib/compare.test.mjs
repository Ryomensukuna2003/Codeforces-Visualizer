/**
 * Set intersections and rank comparisons, with two branches that were live bugs
 * in the code this replaces. Run: `node src/lib/compare.test.mjs`
 *
 * Imports the real module — Node strips the types — so there is no second copy
 * of the logic here to drift out of sync with what ships.
 */
import assert from "node:assert/strict";
import {
  sharedContests,
  h2hRecord,
  gapSeries,
  solvedProblems,
  solveDiff,
  tagLedger,
  buildH2HVerdict,
} from "./compare.ts";

const rated = (rows) => ({
  result: rows.map(([contestId, rank, newRating, t]) => ({
    contestId,
    contestName: `Round ${contestId}`,
    rank,
    newRating,
    ratingUpdateTimeSeconds: t,
  })),
});

// contest 1 you win, 2 they win, 3 a tie, 9 only you, 8 only them
const you = rated([[1, 100, 1500, 10], [2, 900, 1480, 20], [3, 50, 1520, 30], [9, 7, 1600, 40]]);
const rival = rated([[1, 400, 1700, 10], [2, 30, 1750, 20], [3, 50, 1740, 30], [8, 9, 1800, 35]]);

/* shared contests --------------------------------------------------------- */

const shared = sharedContests(you, rival);
assert.equal(shared.length, 3, "only contests both entered");
assert.deepEqual(shared.map((c) => c.contestId), [1, 2, 3], "oldest first");
assert.equal(shared[0].outcome, 1, "lower rank number wins");
assert.equal(shared[1].outcome, -1);
assert.equal(shared[2].outcome, 0, "identical rank is a draw");
assert.ok(shared.every((c) => c.margin >= 1), "margin is a ratio, never below 1");

// The ratio, not the difference. Rank distributions are roughly logarithmic, so
// a raw difference lets one blowout deep in the standings own the whole "biggest
// wins" list: 16348-vs-7135 is 9213 places against 143-vs-63's 80, a 115x
// distortion. As ratios the two are comparable — which is how a competitor reads
// them, since places near the top are far harder won.
const close = sharedContests(rated([[1, 63, 1500, 10]]), rated([[1, 143, 1700, 10]]))[0];
const blowout = sharedContests(rated([[1, 7135, 1500, 10]]), rated([[1, 16348, 1700, 10]]))[0];
const byDifference = (16348 - 7135) / (143 - 63);
const byMargin = blowout.margin / close.margin;
assert.ok(byDifference > 100, `a difference metric distorts by ${byDifference.toFixed(0)}x`);
assert.ok(byMargin < 1.1, `the ratio keeps them comparable (${byMargin.toFixed(2)}x)`);

/* the record — the tie bug ------------------------------------------------- */

const rec = h2hRecord(shared);
assert.equal(rec.met, 3);
assert.equal(rec.won, 1);
assert.equal(rec.lost, 1);
assert.equal(rec.drawn, 1);
// The helper this replaces set `leftWins: left >= right`, so a tie counted as a
// win AND landed in neither tally. A draw belongs in exactly one bucket, and
// out of the win-rate denominator.
assert.equal(rec.won + rec.lost + rec.drawn, rec.met, "every meeting lands in exactly one bucket");
assert.equal(rec.winRate, 50, "win rate is over decided meetings, not all of them");
assert.deepEqual(rec.form, [true, false], "draws are not form");

const never = h2hRecord([]);
assert.equal(never.met, 0);
assert.equal(never.winRate, 0);
assert.equal(never.biggestWin, null);

/* the gap series — the NaN-sort bug ---------------------------------------- */

// Disjoint timelines: the old ISO-string sort `(a,b) => a-b` was NaN for every
// pair, so the rival's contests were appended after all of yours instead of
// interleaved. Time must come out strictly increasing.
const gaps = gapSeries(rated([[1, 1, 1500, 100], [2, 1, 1600, 300]]),
                       rated([[7, 1, 1400, 200], [8, 1, 1900, 400]]));
const times = gaps.map((g) => g.t);
assert.deepEqual(times, [...times].sort((a, b) => a - b), "chronological");
assert.ok(times.length > 1 && times.every((t, i) => i === 0 || t > times[i - 1]), "strictly increasing");

// Carried forward, and never reported before both sides have a rating.
assert.equal(gaps[0].t, 200, "no gap until the rival has a rating too");
assert.equal(gaps[0].gap, 100, "1500 - 1400");
assert.equal(gaps.at(-1).gap, 1600 - 1900, "last known on each side");
assert.deepEqual(gapSeries(rated([]), rated([])), []);

/* solved sets -------------------------------------------------------------- */

const subs = (rows) => ({
  result: rows.map(([name, rating, verdict, tags, t]) => ({
    verdict,
    creationTimeSeconds: t,
    problem: { name, rating, tags, contestId: 1, index: "A" },
  })),
});

const mine = solvedProblems(subs([
  ["Alpha", 1500, "OK", ["dp"], 10],
  ["Alpha", 1500, "OK", ["dp"], 90],      // same problem again — newest wins
  ["Beta", 1600, "WRONG_ANSWER", ["dp"], 20],
  ["Gamma", 1700, "OK", ["greedy", "math"], 30],
]));
assert.equal(mine.size, 2, "distinct problems, accepted only");
assert.equal(mine.get("Alpha|1500").solvedAt, 90, "most recent accepted submission");

const theirs = solvedProblems(subs([
  ["Alpha", 1500, "OK", ["dp"], 50],
  ["Delta", 1600, "OK", ["graphs"], 60],
  ["Epsilon", 1800, "OK", ["graphs", "dp"], 70],
]));

const diff = solveDiff(mine, theirs);
assert.equal(diff.both, 1, "Alpha");
assert.equal(diff.onlyYours, 1, "Gamma");
assert.deepEqual(diff.onlyTheirs.map((p) => p.name), ["Epsilon", "Delta"], "their newest first");

// The `name|rating` key is shared with solvedKeys(); the same title at two
// ratings is two problems. Documented, not accidental.
const twoRatings = solvedProblems(subs([
  ["Same", 1500, "OK", [], 1],
  ["Same", 1900, "OK", [], 2],
]));
assert.equal(twoRatings.size, 2);

/* tag ledger --------------------------------------------------------------- */

const ledger = tagLedger(mine, theirs);
const byTag = Object.fromEntries(ledger.map((r) => [r.tag, r]));
assert.equal(byTag.dp.both, 1, "Alpha is dp and both solved it");
assert.equal(byTag.dp.onlyTheirs, 1, "Epsilon is dp and only they solved it");
assert.equal(byTag.greedy.onlyYours, 1, "Gamma");
assert.ok(ledger[0].onlyTheirs - ledger[0].onlyYours >= ledger.at(-1).onlyTheirs - ledger.at(-1).onlyYours,
  "biggest deficit first");
assert.deepEqual(tagLedger(new Map(), new Map()), [], "no overlap, no rows");

/* the verdict -------------------------------------------------------------- */

const text = (p) => p.map((x) => x.text).join("");
const met = text(buildH2HVerdict({
  you: "a", rival: "b", youRating: 1500, rivalRating: 1700,
  record: rec, reachCount: 801, reachFrom: 1500, reachTo: 1800,
}));
assert.ok(met.includes("met") && met.includes("3 rated contests"), met);
assert.ok(met.includes("200 behind on rating"), met);
assert.ok(met.includes("801 problems"), met);

// Never claims a record it does not have.
const unmet = text(buildH2HVerdict({
  you: "a", rival: "b", youRating: 1500, rivalRating: 320,
  record: never, reachCount: 0, reachFrom: 1500, reachTo: 1800,
}));
assert.ok(unmet.includes("never been in the same rated contest"), unmet);
assert.ok(!unmet.includes("finished ahead in"), "no phantom win record");

console.log("compare: ties bucketed once, gap series chronological, tag diff difficulty-neutral — ok");
