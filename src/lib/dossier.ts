/**
 * Dossier design language — the shared encodings every screen reads from.
 *
 * Palette is black / white / red only. Rank, difficulty and mastery are encoded
 * as luminance steps (`--band-*` fills, `--tier-*` labels), never as hue; red
 * (`text-red-500`) is reserved for failure and urgency. Radius is 0 everywhere.
 */

/** Rank tiers, low to high. Index into BAND_FILL / TIER_TEXT / TIER_STROKE. */
export const TIERS = [
  { name: "newbie", lo: 0, hi: 1200 },
  { name: "pupil", lo: 1200, hi: 1400 },
  { name: "specialist", lo: 1400, hi: 1600 },
  { name: "expert", lo: 1600, hi: Infinity },
] as const;

/**
 * Chart rank bands, using Codeforces' real tier boundaries so the bands stay
 * meaningful for high-rated users. Fills are the same luminance ramp expressed
 * as foreground opacity — on black these land on #0d0d0d / #161616 / #1f1f1f /
 * #292929 and keep climbing, and the ramp still reads correctly in light mode.
 */
export const RANK_BANDS = [
  { name: "newbie", lo: 0, hi: 1200, tier: 0, opacity: 0.052 },
  { name: "pupil", lo: 1200, hi: 1400, tier: 1, opacity: 0.088 },
  { name: "specialist", lo: 1400, hi: 1600, tier: 2, opacity: 0.124 },
  { name: "expert", lo: 1600, hi: 1900, tier: 3, opacity: 0.164 },
  { name: "cand. master", lo: 1900, hi: 2100, tier: 3, opacity: 0.204 },
  { name: "master", lo: 2100, hi: 2300, tier: 3, opacity: 0.244 },
  { name: "int. master", lo: 2300, hi: 2400, tier: 3, opacity: 0.284 },
  { name: "grandmaster", lo: 2400, hi: 2600, tier: 3, opacity: 0.324 },
  { name: "int. gm", lo: 2600, hi: 3000, tier: 3, opacity: 0.364 },
  { name: "legendary", lo: 3000, hi: 4200, tier: 3, opacity: 0.404 },
] as const;

/** Snap a rating window out to the enclosing band boundaries. */
export function snapDomain(min: number, max: number): [number, number] {
  const lo = min - 100;
  const hi = max + 100;
  let outLo: number = RANK_BANDS[0].lo;
  let outHi: number = RANK_BANDS[RANK_BANDS.length - 1].hi;
  for (const b of RANK_BANDS) {
    if (b.lo <= lo) outLo = b.lo;
  }
  for (let i = RANK_BANDS.length - 1; i >= 0; i--) {
    if (RANK_BANDS[i].hi >= hi) outHi = RANK_BANDS[i].hi;
  }
  return [outLo, Math.max(outHi, outLo + 200)];
}

/** Matching label / line colours, as raw colours (charts, SVG). */
export const TIER_STROKE = [
  "hsl(var(--tier-1))",
  "hsl(var(--tier-2))",
  "hsl(var(--tier-3))",
  "hsl(var(--tier-4))",
] as const;

/** Matching label colours as Tailwind classes (text in JSX). */
export const TIER_TEXT = [
  "text-tier-1",
  "text-tier-2",
  "text-tier-3",
  "text-tier-4",
] as const;

/** The rung where the difficulty wall starts — flagged red throughout. */
export const WALL = 1600;

export function tierIndex(rating: number | undefined | null): number {
  if (!rating) return 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (rating >= TIERS[i].lo) return i;
  }
  return 0;
}

/** Luminance-ramp text class for a problem/contest rating. */
export function ratingText(rating: number | undefined | null): string {
  if (!rating) return "text-faint";
  return TIER_TEXT[tierIndex(rating)];
}

const VERDICT_MAP: Record<string, string> = {
  WRONG_ANSWER: "WA",
  TIME_LIMIT_EXCEEDED: "TLE",
  MEMORY_LIMIT_EXCEEDED: "MLE",
  RUNTIME_ERROR: "RE",
  COMPILATION_ERROR: "CE",
  CHALLENGED: "HACK",
  SKIPPED: "SKIP",
  IDLENESS_LIMIT_EXCEEDED: "ILE",
  PRESENTATION_ERROR: "PE",
  TESTING: "…",
};

/** `OK` -> `AC`, everything else to its Codeforces shorthand. */
export function verdictShort(verdict: string): string {
  if (verdict === "OK") return "AC";
  return VERDICT_MAP[verdict] ?? verdict;
}

const VERDICT_LONG: Record<string, string> = {
  AC: "Accepted",
  WA: "Wrong answer",
  TLE: "Time limit exceeded",
  MLE: "Memory limit exceeded",
  RE: "Runtime error",
  CE: "Compilation error",
  HACK: "Challenged",
  SKIP: "Skipped",
  ILE: "Idleness limit exceeded",
  PE: "Presentation error",
};

/**
 * The spoken form of a verdict code. The column is deliberately terse for
 * scanning, but "WA" announced bare is not a word — screen readers get this
 * instead, via an `sr-only` span beside the code.
 */
export function verdictLong(verdict: string): string {
  const short = verdictShort(verdict);
  return VERDICT_LONG[short] ?? short;
}

/** The segmented filter on /submissions. */
export const VERDICT_FILTERS = ["ALL", "AC", "WA", "TLE", "RE", "MLE"] as const;
export type VerdictFilter = (typeof VERDICT_FILTERS)[number];

/** Seconds -> `m:ss`, the contest clock used across /analysis and the strips. */
export function clock(seconds: number): string {
  const sign = seconds < 0 ? "−" : "";
  const s = Math.abs(Math.round(seconds));
  return `${sign}${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Seconds -> `h:mm`, for the contest-duration axis under the gantt. */
export function hourClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}`;
}

/** Thin-space grouping, matching the prototypes' `1 284` / `3 900KB`. */
export function group(n: number): string {
  return n.toLocaleString("en-US").replace(/,/g, " ");
}

/** Memory as a human unit — `393 000KB` wrapped its column and read as noise. */
export function bytes(n: number | undefined | null): string {
  if (!n) return "—";
  const kb = n / 1024;
  if (kb < 1000) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

export function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0";
}

export function shortDate(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function longDate(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** The numbered sidebar — also the source of each page's eyebrow. */
export const NAV = [
  { num: "01", label: "Overview", href: "/", eyebrow: "Codeforces dossier" },
  { num: "02", label: "Submissions", href: "/submissions", eyebrow: "Submission log" },
  { num: "03", label: "Problems", href: "/problems", eyebrow: "Problem ladder" },
  { num: "04", label: "Rating change", href: "/rating_change", eyebrow: "Rated history" },
  { num: "05", label: "Timeline", href: "/analysis", eyebrow: "Contest post-mortem" },
  { num: "06", label: "Blogs", href: "/blogs", eyebrow: "Community" },
  { num: "07", label: "Feedback", href: "/feedback", eyebrow: "Feedback" },
] as const;
