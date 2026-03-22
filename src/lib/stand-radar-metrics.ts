/**
 * JoJo-style "Stand" radar metrics (0–100) from Codeforces submission/user data.
 */

import type { TagStatistics } from "@/types/contests";

type SubmissionLike = {
  verdict: string;
  creationTimeSeconds?: number;
  problem: { name: string; rating?: number; tags: string[] };
};

type RatingPoint = { contestName: string; rating: number };

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

/** AC rate over all submissions (%) */
function accuracyScore(submissions: SubmissionLike[]): number {
  if (!submissions.length) return 0;
  const ac = submissions.filter((s) => s.verdict === "OK").length;
  return clamp((ac / submissions.length) * 100);
}

const ALL_CF_TAGS = [
  "implementation",
  "math",
  "greedy",
  "dp",
  "data structures",
  "brute force",
  "constructive algorithms",
  "graphs",
  "sortings",
  "binary search",
  "dfs and similar",
  "trees",
  "strings",
  "number theory",
  "combinatorics",
  "*special",
  "geometry",
  "bitmasks",
  "two pointers",
  "dsu",
  "shortest paths",
  "probabilities",
  "divide and conquer",
  "hashing",
  "games",
  "flows",
  "interactive",
  "matrices",
  "string suffix structures",
  "fft",
  "graph matchings",
  "ternary search",
  "expression parsing",
  "meet-in-the-middle",
  "2-sat",
  "chinese remainder theorem",
  "schedules",
] as const;

/** Fraction of all known Codeforces tags the user has solved at least one problem in */
function rangeScore(tagStatistics: TagStatistics[]): number {
  if (!tagStatistics.length) return 0;
  const solved = new Set(tagStatistics.map((t) => t.tag.toLowerCase()));
  const covered = ALL_CF_TAGS.filter((t) => solved.has(t)).length;
  return clamp((covered / ALL_CF_TAGS.length) * 100);
}

/** Strength of solved problems vs typical ceiling (problem rating) */
function powerScore(submissions: SubmissionLike[], userRating: number): number {
  const rated = submissions.filter(
    (s) => s.verdict === "OK" && s.problem.rating && s.problem.rating > 0
  );
  if (!rated.length) return 0;
  const avg =
    rated.reduce((sum, s) => sum + (s.problem.rating ?? 0), 0) / rated.length;
  const ceiling = Math.max(userRating + 400, 2400);
  const floor = 800;
  const t = (avg - floor) / (ceiling - floor);
  return clamp(t * 100);
}

/** Submissions per week since registration (activity tempo) */
function speedScore(
  submissions: SubmissionLike[],
  registrationTimeSeconds: number
): number {
  if (!submissions.length || !registrationTimeSeconds) return 0;
  const now = Math.floor(Date.now() / 1000);
  const weeks = Math.max(1, (now - registrationTimeSeconds) / (7 * 24 * 3600));
  const perWeek = submissions.length / weeks;
  // ~30+ subs/week → high
  return clamp((perWeek / 30) * 100);
}

/** Rated contest participation */
function durabilityScore(contestsParticipated: number): number {
  if (!contestsParticipated) return 0;
  return clamp((contestsParticipated / 300) * 100);
}

/** Recent rating momentum vs overall span */
function potentialScore(ratingHistory: RatingPoint[]): number {
  if (ratingHistory.length < 2) return 50;
  const first = ratingHistory[0].rating;
  const last = ratingHistory[ratingHistory.length - 1].rating;
  const totalGain = last - first;
  const n = Math.min(8, ratingHistory.length);
  const recent = ratingHistory.slice(-n);
  let recentGain = 0;
  if (recent.length >= 2) {
    recentGain = recent[recent.length - 1].rating - recent[0].rating;
  }
  const blend = totalGain * 0.4 + recentGain * 0.6;
  // +600 blended → ~100, -600 → ~0, 0 → ~50
  return clamp(50 + (blend / 600) * 50);
}

export type StandRadarDatum = {
  metric: string;
  value: number;
};

/** Shown in UI tooltips — how each score is computed */
export const STAND_METRIC_DESCRIPTIONS: Record<string, string> = {
  Accuracy:
    "Percentage of your submissions that are Accepted (AC). Formula: (AC count ÷ total submissions) × 100. Uses your full submission history from Codeforces.",
  Range:
    `How broad your topic coverage is. Checks which of the ${ALL_CF_TAGS.length} known Codeforces tags (implementation, dp, graphs, fft, 2-sat, etc.) you've solved at least one problem in. Score = (tags covered ÷ ${ALL_CF_TAGS.length}) × 100.`,
  Power:
    "Strength of problems you solve (by problem rating). Compares your average accepted problem rating to a ceiling tied to your user rating (roughly rating + 400, min 4000), normalized between 800 and that ceiling.",
  Speed:
    "Practice tempo: total submissions divided by weeks since your account registration. ~30 submissions per week maps to 100%.",
  Durability:
    "Rated contest participation. Your number of rated contests scaled vs ~300 contests as a high benchmark (capped at 100%).",
  Potential:
    "Rating momentum: blends overall rating change from your first to last rated contest (40%) with change over your last few contests (60%). A blended gain of ~+600 approaches 100%; neutral trend ≈ 50%.",
};

export const STAND_SEGMENTS = 40;

export function buildStandRadarData(params: {
  submissions: SubmissionLike[];
  tagStatistics: TagStatistics[];
  contestsParticipated: number;
  averageAcceptedProblemRating: number;
  userRating: number;
  registrationTimeSeconds: number;
  ratingHistory: RatingPoint[];
}): StandRadarDatum[] {
  const {
    submissions,
    tagStatistics,
    contestsParticipated,
    averageAcceptedProblemRating,
    userRating,
    registrationTimeSeconds,
    ratingHistory,
  } = params;

  // Six spokes (JoJo-style)
  return [
    { metric: "Accuracy", value: Math.round(accuracyScore(submissions)) },
    { metric: "Range", value: Math.round(rangeScore(tagStatistics)) },
    { metric: "Power", value: Math.round(powerScore(submissions, userRating)) },
    { metric: "Speed", value: Math.round(speedScore(submissions, registrationTimeSeconds)) },
    { metric: "Durability", value: Math.round(durabilityScore(contestsParticipated)) },
    { metric: "Potential", value: Math.round(potentialScore(ratingHistory)) },
  ];
}
