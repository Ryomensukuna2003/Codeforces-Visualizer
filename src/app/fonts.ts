import { JetBrains_Mono, Martian_Mono } from "next/font/google";

/**
 * All monospace, two voices.
 *
 * The readability problem was never the mono itself — it was nine font sizes
 * crammed between 9 and 13.5px at 2:1 contrast. With the scale and the contrast
 * ramp fixed, mono can carry the whole page again, which is what the brutalist
 * identity wants.
 *
 * `text`    — the workhorse: dense rows, labels, data columns.
 * `display` — wordmark, handle, page titles, stat values, verdict figures.
 *             Blocky and heavy: mass over refinement, which is the brutalist
 *             read. Needs a real 700 weight, because the emphasis mechanic and
 *             the wordmark both depend on it.
 *
 * There was a third, `mark`: Major Mono Display, for the wordmark alone, chosen
 * because it draws letters as constructed shapes rather than words. That is a
 * fine argument for an abstract logo and a bad one for a name people have to
 * read and recall — it renders `A` as a bare triangle, and its lowercase is a
 * lighter weight than its caps, so a title-case mark came out looking like two
 * different fonts. Removed: the wordmark is `display` now, and the page loads
 * one fewer font family.
 */

export const textFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
});

export const displayFont = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-display",
});

