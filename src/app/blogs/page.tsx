"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "../../components/Providers/fetchAPI";
import {
  BoxTabs,
  Notice,
  PageHeader,
  TD,
  TH,
  THead,
  rowClass,
} from "@/components/dossier/primitives";
import { longDate, signed } from "@/lib/dossier";
import { cn } from "@/lib/utils";

type RecentAction = {
  timeSeconds: number;
  blogEntry: {
    id: number;
    title: string;
    authorHandle: string;
    rating: number;
    creationTimeSeconds?: number;
  };
  comment?: { id: number };
};

const TABS = ["Recent", "Top voted", "Editorials"] as const;
type Tab = (typeof TABS)[number];

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** CF blog titles arrive as HTML: strip the tags and decode the entities. */
function stripHtml(html: string): string {
  let withoutTags = html;
  let previous: string;
  do {
    previous = withoutTags;
    withoutTags = withoutTags.replace(/<[^>]+>/g, "");
  } while (withoutTags !== previous);

  return withoutTags
    .replace(/&(#(\d+)|#x([0-9a-f]+)|[a-z]+);/gi, (m, _all, dec, hex) => {
      if (dec) return String.fromCodePoint(Number(dec));
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      return ENTITIES[m.slice(1, -1).toLowerCase()] ?? m;
    })
    .trim();
}

/** The optional kind chip, read off the title — CF has no field for it. */
function kindOf(title: string): string | null {
  if (/editorial/i.test(title)) return "editorial";
  if (/tutorial/i.test(title)) return "tutorial";
  if (/invitation|announcement|round \d+ \(/i.test(title)) return "announcement";
  return null;
}

export default function BlogsPage() {
  const { recentBlogs } = useStore() as {
    recentBlogs?: { result?: RecentAction[] } | RecentAction[];
  };
  const [tab, setTab] = useState<Tab>("Recent");

  const entries = useMemo(() => {
    const raw = Array.isArray(recentBlogs)
      ? recentBlogs
      : Array.isArray(recentBlogs?.result)
        ? recentBlogs.result
        : [];

    // recentActions repeats an entry once per comment; keep the newest touch.
    const seen = new Map<number, { action: RecentAction; title: string; kind: string | null }>();
    for (const action of raw) {
      const entry = action.blogEntry;
      if (!entry) continue;
      const title = stripHtml(entry.title) || `Blog #${entry.id}`;
      const prev = seen.get(entry.id);
      if (!prev || action.timeSeconds > prev.action.timeSeconds) {
        seen.set(entry.id, { action, title, kind: kindOf(title) });
      }
    }
    return Array.from(seen.values());
  }, [recentBlogs]);

  const rows = useMemo(() => {
    const out = entries.filter((e) => (tab === "Editorials" ? e.kind === "editorial" : true));
    out.sort((a, b) =>
      tab === "Top voted"
        ? b.action.blogEntry.rating - a.action.blogEntry.rating
        : b.action.timeSeconds - a.action.timeSeconds
    );
    return out;
  }, [entries, tab]);

  return (
    <>
      <PageHeader
        eyebrow="06 — Community"
        title="Blogs & tutorials"
        intro="Recent Codeforces blog entries, editorials and tutorials, sortable by newest or by score."
        actions={<BoxTabs options={TABS} value={tab} onChange={setTab} />}
      />

      <THead>
        <TH first>Title</TH>
        <TH className="hidden w-[160px] sm:flex">Author</TH>
        <TH className="hidden w-[140px] md:flex">Date</TH>
        <TH className="w-[90px]">Votes</TH>
      </THead>

      {rows.length ? (
        rows.map(({ action, title, kind }) => {
          const entry = action.blogEntry;
          return (
            <Link
              key={entry.id}
              href={`https://codeforces.com/blog/entry/${entry.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={rowClass}
            >
              <TD first className="gap-3 py-3.5">
                <span className="truncate text-body text-foreground">{title}</span>
                {kind ? (
                  <span className="shrink-0 border border-chip px-1.5 py-px text-label text-faint">
                    {kind}
                  </span>
                ) : null}
              </TD>
              <TD className="hidden w-[160px] sm:flex">
                <span className="truncate text-meta text-muted-foreground">
                  {entry.authorHandle}
                </span>
              </TD>
              <TD className="hidden w-[140px] font-mono text-meta tabular-nums text-faint md:flex">
                {longDate(action.timeSeconds)}
              </TD>
              <TD
                className={cn(
                  "w-[90px] font-mono text-meta font-semibold tabular-nums",
                  entry.rating < 0 ? "text-red-500" : "text-foreground"
                )}
              >
                {signed(entry.rating)}
              </TD>
            </Link>
          );
        })
      ) : (
        <Notice>
          {entries.length
            ? "No editorials in the current feed."
            : "The Codeforces feed came back empty. Try again shortly."}
        </Notice>
      )}

      <div className="h-16" />
    </>
  );
}
