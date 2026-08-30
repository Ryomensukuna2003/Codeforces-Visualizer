"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "../../components/Providers/fetchAPI";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { RankBandChart, DeltaRow } from "@/components/dossier/RankBandChart";
import {
  BoxTabs,
  EmptyOrLoading,
  FigCaption,
  PageHeader,
  Pagination,
  StatStrip,
  TD,
  TH,
  THead,
  rowClass,
} from "@/components/dossier/primitives";
import { group, longDate, shortDate, signed } from "@/lib/dossier";

type Row = {
  id: number;
  contestName: string;
  ratingUpdateTimeSeconds: number;
  rank: number;
  oldRating: number;
  newRating: number;
  delta: number;
  /** Codeforces reports the first rated contest as 0 -> initial rating. */
  seed: boolean;
};

const TABS = ["ALL", "DIV 2", "DIV 3", "EDU"] as const;
type Tab = (typeof TABS)[number];

const MATCHERS: Record<Tab, (name: string) => boolean> = {
  ALL: () => true,
  "DIV 2": (n) => /div\.?\s*2/i.test(n),
  "DIV 3": (n) => /div\.?\s*3/i.test(n),
  EDU: (n) => /educational/i.test(n),
};

const PER_PAGE = 100;

export default function ContestsPage() {
  const { allRating, isLoading } = useStore() as any;
  const { username } = useUsernameStore() as any;
  const [tab, setTab] = useState<Tab>("ALL");
  const [page, setPage] = useState(1);

  /** Oldest first — the chart reads left to right, the table newest first. */
  const chrono = useMemo<Row[]>(
    () =>
      (allRating?.result ?? [])
        .map((r: any) => ({
          id: r.contestId,
          contestName: r.contestName,
          ratingUpdateTimeSeconds: r.ratingUpdateTimeSeconds,
          rank: r.rank,
          oldRating: r.oldRating,
          newRating: r.newRating,
          delta: r.newRating - r.oldRating,
          seed: r.oldRating === 0,
        }))
        .sort((a: Row, b: Row) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds),
    [allRating]
  );

  const filtered = useMemo(
    () => chrono.filter((r) => MATCHERS[tab](r.contestName)),
    [chrono, tab]
  );

  const stats = useMemo(() => {
    if (!chrono.length) {
      return { contests: 0, current: 0, peak: 0, best: 0, worst: 0 };
    }
    // The seeding contest's "+1508" is not a gain — it would own both the
    // best-gain stat and the delta row's scale.
    const deltas = chrono.filter((r) => !r.seed).map((r) => r.delta);
    if (!deltas.length) deltas.push(0);
    return {
      contests: chrono.length,
      current: chrono[chrono.length - 1].newRating,
      peak: Math.max(...chrono.map((r) => r.newRating)),
      best: Math.max(...deltas),
      worst: Math.min(...deltas),
    };
  }, [chrono]);

  const chartData = useMemo(
    () =>
      filtered.map((r) => ({
        label: shortDate(r.ratingUpdateTimeSeconds),
        rating: r.newRating,
        delta: r.seed ? null : r.delta,
      })),
    [filtered]
  );

  /** Largest absolute delta — both the bar row and the inline table bars scale to it. */
  const peakDelta = useMemo(
    () => Math.max(1, ...filtered.filter((r) => !r.seed).map((r) => Math.abs(r.delta))),
    [filtered]
  );

  const newestFirst = useMemo(() => filtered.slice().reverse(), [filtered]);
  const totalPages = Math.ceil(newestFirst.length / PER_PAGE);
  const visible = newestFirst.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <PageHeader
        eyebrow="04 — Rated history"
        title="Rating change"
        intro="Your Codeforces rating plotted against the rank bands, with the per-contest delta aligned underneath it and every rated contest listed with its rank and change. Shows whether a climb came from many small gains or one good round."
        actions={
          <BoxTabs
            options={TABS}
            value={tab}
            onChange={(t) => {
              setTab(t);
              setPage(1);
            }}
          />
        }
      />

      <StatStrip
        items={[
          { label: "Contests", value: stats.contests },
          { label: "Current", value: stats.current || "—" },
          { label: "Peak", value: stats.peak || "—" },
          { label: "Best gain", value: signed(stats.best) },
          { label: "Worst drop", value: signed(stats.worst), accent: stats.worst < 0 },
        ]}
      />

      {/* The chart and the per-contest deltas are one object; the delta row uses
          the same data length and margins so the x-positions align. */}
      <div className="border-b border-rule">
        <FigCaption aside={`${filtered.length} rated contests`}>
          Rating on rank bands, with the change from each contest below
        </FigCaption>
        <RankBandChart
          data={chartData}
          series={[{ key: "rating", label: "rating" }]}
          height={210}
        />
        <DeltaRow data={chartData} height={56} />
      </div>

      <THead>
        <TH first>Contest</TH>
        <TH className="w-[96px]">Rank</TH>
        <TH className="w-[130px] sm:w-[150px]">Rating</TH>
        <TH className="w-[130px] sm:w-[170px]">Change</TH>
      </THead>

      {visible.length ? (
        visible.map((c) => {
          const up = c.delta >= 0;
          const width = c.seed ? 0 : Math.min(50, (Math.abs(c.delta) / peakDelta) * 50);
          return (
            <Link
              key={`${c.id}-${c.ratingUpdateTimeSeconds}`}
              href={`https://codeforces.com/contest/${c.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={rowClass}
            >
              <TD first className="block py-3.5">
                <div className="truncate text-body text-foreground">{c.contestName}</div>
                <div className="mt-1 font-mono text-label tabular-nums text-faint">
                  {longDate(c.ratingUpdateTimeSeconds)}
                </div>
              </TD>
              <TD className="w-[96px] font-mono text-meta tabular-nums text-faint">
                #{group(c.rank)}
              </TD>
              <TD className="w-[130px] gap-2 font-mono text-meta tabular-nums sm:w-[150px]">
                <span className="text-faint">{c.oldRating}</span>
                <span className="text-faint">→</span>
                <span className="font-semibold text-foreground">{c.newRating}</span>
              </TD>
              <TD className="w-[130px] gap-3 px-4 sm:w-[170px]">
                <div className="relative hidden h-1.5 flex-1 bg-track sm:block">
                  <div
                    className={`absolute inset-y-0 ${up ? "bg-foreground" : "bg-red-500"}`}
                    style={{
                      left: up ? "50%" : `${50 - width}%`,
                      width: `${width}%`,
                    }}
                  />
                </div>
                <span
                  className={`w-11 text-right font-mono text-meta font-semibold tabular-nums ${
                    up ? "text-foreground" : "text-red-500"
                  }`}
                >
                  {signed(c.delta)}
                </span>
              </TD>
            </Link>
          );
        })
      ) : (
        <EmptyOrLoading
          loading={isLoading}
          hasHandle={Boolean(username)}
          filtered={chrono.length ? "No contests match this filter." : undefined}
          empty="No rated contests on this handle yet."
        />
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </>
  );
}
