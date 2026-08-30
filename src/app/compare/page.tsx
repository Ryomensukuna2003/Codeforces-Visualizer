"use client";

import Link from "next/link";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { useToast } from "@/hooks/use-toast";
import { cachedGet, TTL } from "@/lib/api-cache";
import { cn, reachFloor } from "@/lib/utils";
import {
  buildH2HVerdict,
  gapSeries,
  h2hRecord,
  sharedContests,
  solveDiff,
  solvedProblems,
  tagLedger,
  type SharedContest,
  type TagLedgerRow,
} from "@/lib/compare";
import { DeltaRow } from "@/components/dossier/RankBandChart";
import {
  BoxTabs,
  FigCaption,
  FilterCell,
  Notice,
  PageHeader,
  Pagination,
  RatingRange,
  StatStrip,
  TD,
  TH,
  THead,
  TagList,
  rowClass,
} from "@/components/dossier/primitives";
import { group, longDate, ratingText, shortDate, signed } from "@/lib/dossier";

/** The three payloads a comparison needs, per handle. */
type Payloads = { info: any; subs: any; rating: any };

const CONTEST_TABS = ["RECENT", "BIGGEST WINS", "BIGGEST LOSSES"] as const;
type ContestTab = (typeof CONTEST_TABS)[number];

const PER_PAGE = 50;

/**
 * Fetch one handle through the same read-through cache the rest of the app uses.
 *
 * The URLs are byte-identical to the store's, so comparing yourself against
 * someone — the common path, since the sidebar seeds this page with the handle
 * already in view — reuses the ~3 MB `user.status` payload already downloaded on
 * `/` and costs no network at all. The helper this replaces used bare axios and
 * re-downloaded everything on every comparison.
 */
async function loadHandle(handle: string): Promise<Payloads> {
  const [info, subs, rating] = await Promise.all([
    cachedGet(`https://codeforces.com/api/user.info?handles=${handle}`, TTL.profile),
    cachedGet(`https://codeforces.com/api/user.status?handle=${handle}&from=1`, TTL.profile),
    cachedGet(`https://codeforces.com/api/user.rating?handle=${handle}`, TTL.profile),
  ]);
  return { info: info.data, subs: subs.data, rating: rating.data };
}

export default function ComparePage() {
  const { toast } = useToast();
  const { username } = useUsernameStore() as { username: string };

  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [you, setYou] = useState<Payloads | null>(null);
  const [rival, setRival] = useState<Payloads | null>(null);
  const [isfetching, setisfetching] = useState(false);
  const [tab, setTab] = useState<ContestTab>("RECENT");
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState(800);
  const [to, setTo] = useState(1100);

  // The sidebar's "add a rival" lands here — start from the handle already in view.
  useEffect(() => {
    setUser1((prev) => prev || username);
  }, [username]);

  const compare = async () => {
    setYou(null);
    setRival(null);
    setPage(1);

    const a = user1.trim();
    const b = user2.trim();
    if (!a || !b) {
      toast({
        variant: "destructive",
        title: "Set both handles",
        description: "Enter a handle on each side to score the head-to-head.",
      });
      return;
    }
    // Case-insensitive: the old check let `Yzm007` against `yzm007` through and
    // rendered a perfect tie in every cell.
    if (a.toLowerCase() === b.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Same handle twice",
        description: "Pick two different handles.",
      });
      return;
    }

    setisfetching(true);
    try {
      // Both sides at once. The old page awaited them one after the other.
      const [ya, rb] = await Promise.all([
        loadHandle(a).catch((e) => Promise.reject(Object.assign(e, { handle: a }))),
        loadHandle(b).catch((e) => Promise.reject(Object.assign(e, { handle: b }))),
      ]);
      setYou(ya);
      setRival(rb);
    } catch (error) {
      // `cachedGet` throws `{ status, comment }`, not an axios error — reading
      // `error.response.status` here would silently stop the "no such handle"
      // toast from ever firing.
      const status = (error as any)?.status;
      const comment: string = (error as any)?.comment ?? "";
      const who = (error as any)?.handle;
      const badHandle = status === 400 || /handle|not found/i.test(comment);
      toast({
        variant: "destructive",
        title: badHandle ? "No such handle" : "Could not reach Codeforces",
        description: badHandle
          ? `Codeforces has no user called ${who}. Check the spelling.`
          : "Nothing wrong with these handles — try again in a minute.",
      });
    } finally {
      setisfetching(false);
    }
  };

  const swap = () => {
    setUser1(user2);
    setUser2(user1);
    setYou(rival);
    setRival(you);
  };

  /* Derived ------------------------------------------------------------- */

  const profiles = useMemo(() => {
    const p = (side: Payloads | null) => side?.info?.result?.[0] ?? null;
    return { you: p(you), rival: p(rival) };
  }, [you, rival]);

  const shared = useMemo(
    () => (you && rival ? sharedContests(you.rating, rival.rating) : []),
    [you, rival]
  );
  const record = useMemo(() => h2hRecord(shared), [shared]);
  const gaps = useMemo(
    () => (you && rival ? gapSeries(you.rating, rival.rating) : []),
    [you, rival]
  );

  const solved = useMemo(
    () => ({
      you: you ? solvedProblems(you.subs) : new Map(),
      rival: rival ? solvedProblems(rival.subs) : new Map(),
    }),
    [you, rival]
  );
  const diff = useMemo(() => solveDiff(solved.you, solved.rival), [solved]);
  const ledger = useMemo(() => tagLedger(solved.you, solved.rival), [solved]);

  // Seed the practice band from your own rating once the profiles land.
  const yourRating: number = profiles.you?.rating ?? 0;
  useEffect(() => {
    if (!yourRating) return;
    const floor = reachFloor(yourRating);
    setFrom(floor);
    setTo(floor + 300);
  }, [yourRating]);

  const inReach = useMemo(
    () => diff.onlyTheirs.filter((p) => p.rating && p.rating >= from && p.rating <= to),
    [diff, from, to]
  );

  const contestRows = useMemo(() => {
    const rows = [...shared];
    if (tab === "RECENT") rows.reverse();
    else if (tab === "BIGGEST WINS")
      rows.sort((a, b) => (b.outcome === 1 ? b.margin : 0) - (a.outcome === 1 ? a.margin : 0));
    else rows.sort((a, b) => (b.outcome === -1 ? b.margin : 0) - (a.outcome === -1 ? a.margin : 0));
    return rows.slice(0, 20);
  }, [shared, tab]);

  const totalPages = Math.max(1, Math.ceil(inReach.length / PER_PAGE));
  const visible = inReach.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const verdict = useMemo(() => {
    if (!profiles.you || !profiles.rival) return null;
    return buildH2HVerdict({
      you: profiles.you.handle,
      rival: profiles.rival.handle,
      youRating: profiles.you.rating ?? 0,
      rivalRating: profiles.rival.rating ?? 0,
      record,
      reachCount: inReach.length,
      reachFrom: from,
      reachTo: to,
    });
  }, [profiles, record, inReach.length, from, to]);

  const loaded = Boolean(profiles.you && profiles.rival);
  const handleInput =
    "w-full bg-transparent font-display text-stat font-bold text-foreground placeholder:text-faint";

  /** One line of raw profile per side — the six mirrored bars, compressed. */
  const profileLine = (p: any, payload: Payloads | null, count: number) =>
    p ? (
      <div className="mt-2 font-mono text-meta tabular-nums text-faint">
        {p.rating ?? "unrated"}
        <span className="px-1.5">·</span>peak {p.maxRating ?? "—"}
        <span className="px-1.5">·</span>
        {group(payload?.rating?.result?.length ?? 0)} contests
        <span className="px-1.5">·</span>
        {group(count)} solved
      </div>
    ) : null;

  return (
    <>
      <PageHeader
        eyebrow="Head to head"
        title="Compare"
        actions={
          <button
            type="button"
            onClick={compare}
            disabled={isfetching}
            className="bg-foreground px-3.5 py-2.5 text-meta text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isfetching ? "Fetching…" : "Compare"}
          </button>
        }
      />

      {/* Handles -------------------------------------------------------- */}
      <div className="flex flex-col items-stretch border-b border-rule sm:flex-row">
        <div className="flex-1 border-b border-hair px-5 py-4 sm:border-b-0 sm:border-r">
          <label htmlFor="user1" className="mb-2.5 block text-label font-medium text-faint">
            You
          </label>
          <div className="flex items-baseline gap-3">
            <input
              id="user1"
              value={user1}
              placeholder="your handle"
              onChange={(e) => setUser1(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && compare()}
              className={handleInput}
            />
            {profiles.you?.rank ? (
              <span className="shrink-0 bg-foreground px-[9px] py-[3px] text-label uppercase text-background">
                {profiles.you.rank}
              </span>
            ) : null}
          </div>
          {profileLine(profiles.you, you, diff.yours)}
        </div>

        {/* Was a decorative icon; it does the obvious thing now. */}
        <button
          type="button"
          onClick={swap}
          aria-label="Swap the two handles"
          className="flex w-full shrink-0 items-center justify-center border-hair py-3 transition-colors hover:bg-rowhover sm:w-[190px] sm:border-r sm:py-0"
        >
          <ArrowRightLeft className="h-5 w-5 text-faint" />
        </button>

        <div className="flex-1 border-t border-hair px-5 py-4 sm:border-t-0">
          <label htmlFor="user2" className="mb-2.5 block text-label font-medium text-faint">
            Rival
          </label>
          <div className="flex items-baseline gap-3">
            <input
              id="user2"
              value={user2}
              placeholder="their handle"
              onChange={(e) => setUser2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && compare()}
              className={handleInput}
            />
            {profiles.rival?.rank ? (
              <span className="shrink-0 border border-rule px-[9px] py-[3px] text-label uppercase text-muted-foreground">
                {profiles.rival.rank}
              </span>
            ) : null}
          </div>
          {profileLine(profiles.rival, rival, diff.theirs)}
        </div>
      </div>

      {!loaded ? (
        <Notice>
          {isfetching ? "Reading both histories…" : "Enter two handles to score the head-to-head."}
        </Notice>
      ) : (
        <>
          {/* The verdict — same treatment as the overview's -------------- */}
          <div className="border-b border-rule px-5 pb-7 pt-6">
            <div className="border-l-2 border-red-500 bg-background py-5 pl-6 pr-5">
              <span className="mb-3 block text-label font-medium uppercase text-red-500">
                The head-to-head
              </span>
              <p className="max-w-[68ch] text-lead text-foreground [text-wrap:pretty]">
                {verdict?.map((part, i) =>
                  part.bold ? (
                    <span
                      key={i}
                      className={cn(
                        "font-display font-bold tabular-nums",
                        part.accent ? "text-red-500" : "text-foreground"
                      )}
                    >
                      {part.text}
                    </span>
                  ) : (
                    <React.Fragment key={i}>{part.text}</React.Fragment>
                  )
                )}
              </p>
            </div>
          </div>

          {/* The record -------------------------------------------------- */}
          <StatStrip
            items={[
              { label: "Met", value: group(record.met) },
              // A dash, not a zero: "0 ahead, 0 behind" reads as dead even, which
              // is a claim about a matchup that never happened.
              { label: "You ahead", value: record.met ? group(record.won) : "—" },
              {
                label: "Behind",
                value: record.met ? group(record.lost) : "—",
                accent: record.lost > record.won,
              },
              { label: "Win rate", value: record.met ? `${record.winRate}%` : "—" },
              {
                label: "Last 10",
                value: record.form.length
                  ? `${record.form.filter(Boolean).length}–${record.form.filter((w) => !w).length}`
                  : "—",
              },
            ]}
          />

          {/* The gap over time ------------------------------------------- */}
          {gaps.length > 1 ? (
            <div className="border-b border-rule">
              <FigCaption aside={`${signed(gaps[gaps.length - 1].gap)} today`}>
                Rating gap, carried forward between contests
              </FigCaption>
              <DeltaRow
                data={gaps.map((g) => ({ label: shortDate(g.t), delta: g.gap }))}
                height={140}
              />
            </div>
          ) : null}

          {/* Shared contests --------------------------------------------- */}
          <div className="flex flex-wrap items-stretch border-b border-rule">
            <FigCaption
              className="flex-1 border-b-0"
              aside={record.met > 20 ? `showing 20 of ${group(record.met)}` : undefined}
            >
              Contests you both entered
            </FigCaption>
            {record.met ? (
              <div className="flex items-center py-2 pr-5">
                <BoxTabs options={CONTEST_TABS} value={tab} onChange={setTab} />
              </div>
            ) : null}
          </div>

          {record.met ? (
            <>
              <THead>
                <TH first>Contest</TH>
                <TH className="w-[96px]">You</TH>
                <TH className="w-[96px]">Them</TH>
                <TH className="w-[120px] sm:w-[160px]">Margin</TH>
              </THead>
              {contestRows.map((c) => (
                <ContestRow key={c.contestId} c={c} />
              ))}
            </>
          ) : (
            <Notice>These two have never been in the same rated contest.</Notice>
          )}

          {/* Tag ledger --------------------------------------------------- */}
          {ledger.length >= 3 ? (
            <>
              <FigCaption aside="problems only one of you has solved">By topic</FigCaption>
              <THead>
                <TH first>Tag</TH>
                <TH className="w-[86px]">Only you</TH>
                <TH className="w-[110px] sm:w-[160px]">
                  <span className="sr-only">Balance</span>
                </TH>
                <TH className="w-[96px]">Only them</TH>
                <TH className="hidden w-[70px] sm:flex">Both</TH>
              </THead>
              {ledger.map((r) => (
                <TagRow key={r.tag} row={r} />
              ))}
            </>
          ) : null}

          {/* Practice list ------------------------------------------------ */}
          <FigCaption aside={`${group(inReach.length)} in range · unrated problems excluded`}>
            What they have solved that you have not
          </FigCaption>
          <div className="flex flex-wrap border-b border-rule">
            <FilterCell>
              <RatingRange
                from={from}
                to={to}
                onFrom={(n) => {
                  setFrom(n);
                  setPage(1);
                }}
                onTo={(n) => {
                  setTo(n);
                  setPage(1);
                }}
              />
            </FilterCell>
            <FilterCell>
              <span className="text-faint">newest of their solves first</span>
            </FilterCell>
          </div>

          {visible.length ? (
            <>
              <THead>
                <TH first>Problem</TH>
                <TH className="w-[80px]">Rating</TH>
                <TH className="hidden w-[110px] sm:flex">They solved</TH>
              </THead>
              {visible.map((p) => (
                <Link
                  key={p.key}
                  href={
                    p.contestId && p.index
                      ? `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
                      : "https://codeforces.com/problemset"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={rowClass}
                >
                  <TD first className="gap-3 py-3">
                    <span className="shrink-0 truncate text-body text-foreground">
                      {p.contestId}
                      {p.index}. {p.name}
                    </span>
                    <TagList tags={p.tags} />
                  </TD>
                  <TD className={cn("w-[80px] font-mono tabular-nums", ratingText(p.rating))}>
                    <span className="text-meta">{p.rating ?? "—"}</span>
                  </TD>
                  <TD className="hidden w-[110px] font-mono text-meta tabular-nums text-faint sm:flex">
                    {p.solvedAt ? shortDate(p.solvedAt) : "—"}
                  </TD>
                </Link>
              ))}
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          ) : (
            <Notice>
              {diff.onlyTheirs.length
                ? `Nothing between ${from} and ${to}. Widen the range.`
                : "Nothing here they have solved that you have not."}
            </Notice>
          )}
        </>
      )}
    </>
  );
}

/* Rows --------------------------------------------------------------------- */

function ContestRow({ c }: { c: SharedContest }) {
  const won = c.outcome === 1;
  const drawn = c.outcome === 0;
  // Reads out from the centre: right when you won, left when you lost. Log-scaled
  // and capped, so one 64x blowout does not pin every other row to a stub.
  const width = Math.min(50, (Math.log2(c.margin) / 6) * 50);

  return (
    <Link
      href={`https://codeforces.com/contest/${c.contestId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(rowClass, !won && !drawn && "bg-flag")}
    >
      <TD first className="min-w-0 flex-col items-start justify-center py-3">
        <span className="w-full truncate text-body text-foreground">{c.contestName}</span>
        <span className="mt-[5px] text-label text-faint">
          {longDate(c.ratingUpdateTimeSeconds)}
        </span>
      </TD>
      <TD
        className={cn(
          "w-[96px] font-mono text-meta tabular-nums",
          won ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        #{group(c.youRank)}
      </TD>
      <TD
        className={cn(
          "w-[96px] font-mono text-meta tabular-nums",
          !won && !drawn ? "font-semibold text-red-500" : "text-muted-foreground"
        )}
      >
        #{group(c.rivalRank)}
      </TD>
      <TD className="w-[120px] gap-3 sm:w-[160px]">
        <div className="relative hidden h-1.5 flex-1 bg-track sm:block">
          {!drawn ? (
            <div
              className={cn("absolute inset-y-0", won ? "bg-foreground" : "bg-red-500")}
              style={{ left: won ? "50%" : `${50 - width}%`, width: `${width}%` }}
            />
          ) : null}
        </div>
        <span
          className={cn(
            "w-11 shrink-0 text-right font-mono text-meta tabular-nums",
            drawn ? "text-faint" : won ? "text-foreground" : "text-red-500"
          )}
        >
          {drawn ? "tie" : `${c.margin < 10 ? c.margin.toFixed(1) : Math.round(c.margin)}×`}
        </span>
      </TD>
    </Link>
  );
}

function TagRow({ row }: { row: TagLedgerRow }) {
  const peak = Math.max(row.onlyYours, row.onlyTheirs, 1);
  const yoursW = (row.onlyYours / peak) * 50;
  const theirsW = (row.onlyTheirs / peak) * 50;
  const behind = row.onlyTheirs > row.onlyYours;

  return (
    <div className={cn(rowClass, "items-center")}>
      <TD first className="py-3">
        <span className="truncate text-body text-foreground">{row.tag}</span>
      </TD>
      <TD
        className={cn(
          "w-[86px] font-mono text-meta tabular-nums",
          behind ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {group(row.onlyYours)}
      </TD>
      <TD className="w-[110px] sm:w-[160px]">
        <div className="relative hidden h-1.5 flex-1 bg-track sm:block">
          <div
            className="absolute inset-y-0 bg-muted-foreground"
            style={{ left: `${50 - yoursW}%`, width: `${yoursW}%` }}
          />
          <div
            className="absolute inset-y-0 bg-foreground"
            style={{ left: "50%", width: `${theirsW}%` }}
          />
          {/* The axis the two sides diverge from — without it the pair reads as
              one bar with an arbitrary seam. */}
          <div className="absolute -bottom-0.5 -top-0.5 left-1/2 w-px bg-rule" />
        </div>
      </TD>
      <TD
        className={cn(
          "w-[96px] font-mono text-meta tabular-nums",
          behind ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {group(row.onlyTheirs)}
      </TD>
      <TD className="hidden w-[70px] font-mono text-meta tabular-nums text-faint sm:flex">
        {group(row.both)}
      </TD>
    </div>
  );
}
