import type { Metadata } from "next";

/**
 * Per-route metadata.
 *
 * Every page in this app is a client component, so none of them can export
 * `metadata` themselves — they all inherited the root title, which meant eight
 * URLs presenting to a crawler as the same page. Each route now has a thin
 * server `layout.tsx` that calls this.
 *
 * Titles are written for the query, not for the nav: someone searching is
 * typing "codeforces rating graph", not "04 — Rated history".
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cfstats.vercel.app";

export const SITE_NAME = "CF Stats";

export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  /** Route path, leading slash. Used for the canonical URL. */
  path: string;
  /** False for pages with nothing to offer a search result. */
  index?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Every indexable route, in sidebar order — the sitemap reads this. */
export const ROUTES = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/submissions", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/problems", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/rating_change", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/analysis", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/compare", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/blogs", priority: 0.6, changeFrequency: "hourly" as const },
];
