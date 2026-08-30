/**
 * `/api/snapshot` is public and unauthenticated, so every field it stores has to
 * survive a hostile post. Run: `node src/lib/analytics.test.mjs`
 *
 * Imports the real module — Node strips the types natively, so there is no copy
 * of the validator here to drift out of sync with the one that ships.
 */
import assert from "node:assert/strict";
import { validateSnapshot, isMetricName, today } from "./analytics.ts";

const good = {
  handle: "Yzm007", rating: 1631, maxRating: 2195, rank: "expert", maxRank: "master",
  solved: 1879, submissions: 4920, acRate: 47.2, avgSolvedRating: 1412,
  contests: 146, bestRank: 12, worstRank: 12693,
  avgRatingChange: 11.4, bestRatingChange: 255, worstRatingChange: -230,
  accuracy: 47, range: 100, power: 60, speed: 37, durability: 49, potential: 55,
  tagCounts: { greedy: 412, dp: 118 },
};

// The happy path survives intact.
const ok = validateSnapshot(good);
assert.equal(ok.ok, true);
assert.equal(ok.value.handle, "Yzm007");
assert.equal(ok.value.tagCounts.greedy, 412);

// A handle that isn't one is rejected, not stored.
for (const bad of ["", "a".repeat(25), "drop table;", "has space", "<script>"]) {
  assert.equal(validateSnapshot({ ...good, handle: bad }).ok, false, `accepted ${JSON.stringify(bad)}`);
}

// The app's "no rank yet" sentinel must never reach the column, where it would
// read as a real worst-ever rank.
assert.equal(validateSnapshot({ ...good, bestRank: Number.MAX_SAFE_INTEGER }).value.bestRank, null);

// Scores are clamped to the 0-100 range they claim.
const clamped = validateSnapshot({ ...good, accuracy: 999, speed: -40 }).value;
assert.equal(clamped.accuracy, 100);
assert.equal(clamped.speed, 0);

// Potential is the one score allowed to be absent.
assert.equal(validateSnapshot({ ...good, potential: null }).value.potential, null);

// A malformed post cannot write an unbounded blob.
const many = Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`t${i}`, i]));
assert.ok(Object.keys(validateSnapshot({ ...good, tagCounts: many }).value.tagCounts).length <= 64);

// Junk is refused rather than coerced to 0 and silently stored.
assert.equal(validateSnapshot({ ...good, solved: "lots" }).ok, false);
assert.equal(validateSnapshot({ ...good, acRate: NaN }).ok, false);
assert.equal(validateSnapshot(null).ok, false);

// Counter names are a closed set, so the table cannot grow a tail of typos.
assert.equal(isMetricName("coach:failed"), true);
assert.equal(isMetricName("anything:else"), false);

// The upsert key is a date with no time, or every reload writes a new row.
const d = today(new Date("2026-08-30T15:47:00Z"));
assert.equal(d.toISOString(), "2026-08-30T00:00:00.000Z");

console.log("analytics: hostile posts rejected, sentinels stripped, scores clamped — ok");
