/**
 * The verdict is the page's one loud element and it asserts things about the
 * user, so its branches need a check. Run: `node src/lib/verdict.test.mjs`
 *
 * This mirrors the branch structure of buildVerdict() in utils.ts rather than
 * importing it — utils.ts is TSX-adjacent and pulls in axios and React state.
 * If you change the branch order there, change it here.
 */
import assert from "node:assert/strict";

function opening(d30, above, belowRate, aboveRate) {
  const lopsided = above > 0 && aboveRate < belowRate * 0.6;
  if (d30 > 0 && lopsided) return "improving-but-only-below";
  if (d30 > 0 && above > 0) return "holding-above";
  if (d30 > 0) return "improving";
  if (d30 < 0) return "sliding";
  return "flat";
}

// The regression: gaining rating with nothing attempted above the pivot used to
// claim "it is holding above 1600" and then close with "you have not attempted
// anything above 1600 yet" — in the same sentence.
assert.equal(opening(58, 0, 0.72, 0), "improving");

// The three branches that were already right stay right.
assert.equal(opening(58, 120, 0.72, 0.43), "improving-but-only-below");
assert.equal(opening(58, 120, 0.72, 0.70), "holding-above");
assert.equal(opening(-40, 120, 0.72, 0.43), "sliding");
assert.equal(opening(0, 120, 0.72, 0.43), "flat");

console.log("verdict: no branch claims what the closing sentence denies — ok");

/**
 * Codeforces reports `oldRating: 0` for a seeding contest, so its "delta" is the
 * whole starting rating. Counting it makes the best gain a number that never
 * happened and inflates the average by an order of magnitude.
 */
function ratingStats(rows) {
  let total = 0, rated = 0, best = 0, worst = 0;
  let bestRank = Number.MAX_SAFE_INTEGER, worstRank = 0;
  for (const r of rows) {
    if (!r.rank) continue;
    bestRank = Math.min(bestRank, r.rank);
    worstRank = Math.max(worstRank, r.rank);
    if (r.oldRating === 0) continue;
    const d = r.newRating - r.oldRating;
    total += d; rated += 1;
    best = Math.max(best, d); worst = Math.min(worst, d);
  }
  return { best, worst, avg: rated ? total / rated : 0, bestRank, worstRank };
}

const history = [
  { rank: 4000, oldRating: 0,    newRating: 1508 },  // seeding
  { rank: 910,  oldRating: 1508, newRating: 1763 },  // +255
  { rank: 12,   oldRating: 1763, newRating: 1533 },  // -230
];
const st = ratingStats(history);
assert.equal(st.best, 255, "the seeding contest must not own the best gain");
assert.equal(st.worst, -230);
assert.equal(st.avg, 12.5, "average is over real contests, not the seed");
// Ranks still count for every contest, seeding included.
assert.equal(st.bestRank, 12);
assert.equal(st.worstRank, 4000);

// An unrated-only history divides by zero unless guarded.
assert.equal(ratingStats([{ rank: 0, oldRating: 0, newRating: 0 }]).avg, 0);

console.log("rating stats: seeding contest excluded from deltas, kept for ranks — ok");
