import { JetBrains_Mono, Major_Mono_Display, Martian_Mono } from "next/font/google";

/**
 * All monospace, three voices.
 *
 * The readability problem was never the mono itself — it was nine font sizes
 * crammed between 9 and 13.5px at 2:1 contrast. With the scale and the contrast
 * ramp fixed, mono can carry the whole page again, which is what the brutalist
 * identity wants.
 *
 * `text`    — the workhorse: dense rows, labels, data columns.
 * `display` — handle, page titles, stat values, verdict figures. Blocky and
 *             heavy: mass over refinement, which is the brutalist read. Needs
 *             a real 700 weight, because the emphasis mechanic depends on it.
 * `mark`    — the wordmark only. Major Mono Display draws lowercase as
 *             constructed small-cap forms (`a` becomes a delta, `y` a triangle),
 *             which is wrong for a handle or a sentence and exactly right for a
 *             logo, where the letters are a shape rather than a word to read.
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

export const markFont = Major_Mono_Display({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-mark",
});
