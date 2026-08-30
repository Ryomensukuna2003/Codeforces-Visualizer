"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";
import { ModeToggle } from "@/components/ui/toggle";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { useStore } from "@/components/Providers/fetchAPI";
import { NAV } from "@/lib/dossier";
import { cn } from "@/lib/utils";
import { Label } from "./primitives";

/**
 * The permanent numbered sidebar — 196px, full height, on every route.
 *
 * The `01–06` numerals stay: this is a fixed order people learn positionally,
 * which is the one case where numbering carries information.
 *
 * Below `md` the wordmark, handle and compare block collapse into a single bar
 * with the nav beneath it, instead of ~380px of stacked chrome before content.
 */
export function DossierSidebar() {
  const pathname = usePathname();
  const { username, setUsernamePopupisopen } = useUsernameStore() as unknown as {
    username: string;
    setUsernamePopupisopen: (isOpen: boolean) => void;
  };
  const { userInfoData } = useStore() as unknown as { userInfoData: any };
  const rating = userInfoData?.result?.[0]?.rating;

  return (
    <div className="relative flex min-h-full w-full flex-col bg-card md:w-[196px]">
      <div className="absolute bottom-0 right-0 top-0 z-[2] hidden w-px bg-rule md:block" />

      {/* Top bar — one row on mobile, wordmark block on desktop */}
      <div className="flex items-stretch border-b border-hair md:border-rule">
        {/* Wordmark. Martian Mono — the same display face as the handle, the
            page titles and the stat figures — set bold and all caps.

            It used to have a face of its own, Major Mono Display, on the theory
            that a logo is a shape rather than a word. In practice that face
            draws `A` as a bare triangle and renders lowercase as lighter
            small-cap forms, so the mark was both hard to read and, at the
            title-case "CF Stats" it used to say, two visibly different weights
            in one word. A name people are meant to recognise has to be legible
            first. Dropping it also removed a whole Google Font from every page.

            Both copies must keep the same string and classes: the second is the
            hover fill, and any mismatch would reveal something different from
            what it covers. The swipe fills the cell edge to edge — inverted
            fill, never red; red is for failure. */}
        <Link
          href="/"
          className="group relative flex min-w-0 flex-1 items-center overflow-hidden px-4 py-4 md:px-[18px] md:py-5"
        >
          <span className="truncate font-display text-body font-bold tracking-tight text-foreground">
            CF STATS
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center bg-foreground px-4 font-display text-body font-bold tracking-tight text-background [clip-path:polygon(0_0,100%_0,100%_0,0_0)] [transition:clip-path_.35s_cubic-bezier(.1,.5,.5,1)] group-hover:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] md:px-[18px]"
          >
            CF STATS
          </span>
        </Link>

        {/* Handle sits inline on mobile, in its own block on desktop */}
        <button
          type="button"
          onClick={() => setUsernamePopupisopen(true)}
          className="flex min-w-0 items-center gap-2 px-3 text-left transition-colors hover:bg-rowhover md:hidden"
        >
          <span className="truncate text-meta text-foreground">
            {username || "set a handle"}
          </span>
          {rating ? (
            <span className="shrink-0 font-mono text-label tabular-nums text-faint">
              {rating}
            </span>
          ) : null}
        </button>

        {/* A cell, not a button floating in padding. It used to be a 28px
            bordered square with `pr-3` around it, which put a small box inside
            a bigger box touching nothing — the same disconnected look already
            fixed on the filter rows. Now it shares the header's full height and
            divides from the wordmark with one rule, so the two read as adjacent
            cells of one strip. */}
        <div className="flex shrink-0 items-stretch border-l border-hair md:border-rule">
          <ModeToggle className="h-full w-12 rounded-none border-0 bg-transparent md:w-[52px]" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setUsernamePopupisopen(true)}
        className="hidden border-b border-hair px-[18px] pb-3 pt-3.5 text-left transition-colors hover:bg-rowhover md:block"
      >
        <Label className="mb-2 block">Viewing</Label>
        <div className="flex items-baseline gap-2">
          <span className="truncate text-body text-foreground">
            {username || "set a handle"}
          </span>
          {rating ? (
            <span className="shrink-0 font-mono text-label tabular-nums text-faint">
              {rating}
            </span>
          ) : null}
        </div>
      </button>

      <nav aria-label="Sections" className="flex flex-row overflow-x-auto md:flex-col md:overflow-visible">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-baseline gap-2.5 border-b border-hair px-4 py-3 transition-colors md:px-[18px]",
                "border-l-2 hover:bg-rowhover hover:text-foreground",
                active
                  ? "border-l-red-500 bg-rowhover text-foreground"
                  : "border-l-transparent text-muted-foreground"
              )}
            >
              <span className="font-mono text-label tabular-nums text-faint">{item.num}</span>
              <span className="whitespace-nowrap text-meta">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden min-h-5 flex-1 md:block" />

      <Link
        href="/compare"
        className="hidden border-t border-rule px-[18px] py-4 transition-colors hover:bg-rowhover md:block"
      >
        <Label className="mb-2.5 block">Compare</Label>
        <div className="flex items-center gap-2 border border-field px-2.5 py-2 text-meta text-muted-foreground">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          add a rival
        </div>
      </Link>
    </div>
  );
}
