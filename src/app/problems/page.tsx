"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { countMetric, useStore } from "@/components/Providers/fetchAPI";
import { Problem, ProblemStatistics, CombinedData } from "@/app/types";
import {
  FigCaption,
  FilterCell,
  Label,
  Notice,
  PageHeader,
  Pagination,
  RatingRange,
  TD,
  TH,
  THead,
  TagList,
  rowClass,
} from "@/components/dossier/primitives";
import { WALL, group, ratingText } from "@/lib/dossier";
import { TTL, getJson } from "@/lib/api-cache";
import { isRecommended, rungCoverage, solvedKeys, weakTags } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PER_PAGE = 100;
const CHIP_COUNT = 4;

/**
 * Rung fill: red at and above the wall, otherwise a coverage luminance step.
 *
 * The floor is `muted-foreground`, not the ramp's darkest step — most people
 * clear well under 30% of any rung, so the original floor left every bar
 * invisible against its own track.
 */
function rungFill(rating: number, pct: number): string {
  if (rating >= WALL) return "bg-red-500";
  if (pct >= 60) return "bg-foreground";
  if (pct >= 30) return "bg-tier-3";
  return "bg-muted-foreground";
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<CombinedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [initialRating, setInitialFilter] = useState(800);
  const [endingFilter, setEndingFilter] = useState(3200);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [unsolvedOnly, setUnsolvedOnly] = useState(false);
  const [recommended, setRecommended] = useState(false);
  const [page, setPage] = useState(1);
  const [tagsSeeded, setTagsSeeded] = useState(false);

  const { username, Attempted } = useUsernameStore() as {
    username: string;
    Attempted: string[];
  };
  const { allSubmissionsData } = useStore() as any;
  // Bumped by the retry button. `load` lives inside the effect, so re-running the
  // effect is the only way to call it again.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // ~5 MB, and it only changes when a round is archived — cache for a day.
        const data = await getJson(
          "https://codeforces.com/api/problemset.problems",
          TTL.problemset,
          // A retry has to skip the 24h cached copy, or it replays the same
          // failure-free stale response and looks like it did nothing.
          reloadKey > 0
        );
        if (data.status !== "OK") throw new Error("Failed to fetch problems");

        const stats = new Map<string, number>();
        for (const s of data.result.problemStatistics as ProblemStatistics[]) {
          stats.set(`${s.contestId}${s.index}`, s.solvedCount);
        }
        const combined: CombinedData[] = (data.result.problems as Problem[])
          .filter((p) => stats.has(`${p.contestId}${p.index}`))
          .map((p) => ({ ...p, solvedCount: stats.get(`${p.contestId}${p.index}`)! }));

        if (!cancelled) setProblems(combined);
      } catch {
        if (!cancelled) {
          setError("Could not load the problemset from Codeforces.");
          countMetric("problemset:failed");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [username, reloadKey]);

  // Prefer the store's own submission history so this page stands alone; fall
  // back to `Attempted` if only that is populated.
  const solved = useMemo(() => {
    const fromSubs = solvedKeys(allSubmissionsData);
    return fromSubs.size ? fromSubs : new Set(Attempted);
  }, [allSubmissionsData, Attempted]);

  /** Weakest tags first — drives the pre-selected chip and the FOR YOU badges. */
  const weak = useMemo(() => weakTags(allSubmissionsData), [allSubmissionsData]);
  const weakSet = useMemo(() => new Set(weak.slice(0, 5).map((t) => t.tag)), [weak]);

  // The weakest tag is pre-selected once, then the user owns the selection.
  useEffect(() => {
    if (!tagsSeeded && weak.length) {
      setActiveTags([weak[0].tag]);
      setTagsSeeded(true);
    }
  }, [weak, tagsSeeded]);

  const rungs = useMemo(
    () => rungCoverage(problems, Array.from(solved), 800, 2000, 100),
    [problems, solved]
  );

  const filtered = useMemo(() => {
    const out = problems.filter((p) => {
      if (!p.rating || p.rating < initialRating || p.rating > endingFilter) return false;
      if (unsolvedOnly && solved.has(`${p.name}|${p.rating}`)) return false;
      if (activeTags.length && !activeTags.some((t) => p.tags?.includes(t))) return false;
      if (recommended) {
        if (solved.has(`${p.name}|${p.rating}`)) return false;
        if (!isRecommended(p.tags ?? [], weakSet, p.rating)) return false;
      }
      return true;
    });
    out.sort((a, b) =>
      sortOrder === "asc"
        ? (a.solvedCount || 0) - (b.solvedCount || 0)
        : (b.solvedCount || 0) - (a.solvedCount || 0)
    );
    return out;
  }, [
    problems,
    initialRating,
    endingFilter,
    unsolvedOnly,
    activeTags,
    recommended,
    solved,
    weakSet,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const chips = weak.slice(0, CHIP_COUNT);
  const hiddenTagCount = Math.max(0, weak.length - CHIP_COUNT);

  const toggleTag = (t: string) => {
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    setPage(1);
  };

  const pill = "px-3 py-2 text-meta transition-colors";

  return (
    <>
      <PageHeader
        eyebrow="03 — Problem ladder"
        title="Problems"
        intro="A ladder of every Codeforces rating band, showing how many problems you have solved out of how many exist at each step — so you can see the exact difficulty where your coverage thins out, and pick unsolved problems in your weakest tags to close it."
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setRecommended((v) => !v);
                setPage(1);
              }}
              aria-pressed={recommended}
              className={cn(
                pill,
                recommended
                  ? "bg-foreground font-medium text-background"
                  : "border border-rule text-muted-foreground hover:bg-rowhover hover:text-foreground"
              )}
            >
              Recommended for me
            </button>
            <button
              type="button"
              onClick={() => {
                setUnsolvedOnly((v) => !v);
                setPage(1);
              }}
              aria-pressed={unsolvedOnly}
              className={cn(
                pill,
                unsolvedOnly
                  ? "bg-foreground font-medium text-background"
                  : "border border-rule text-muted-foreground hover:bg-rowhover hover:text-foreground"
              )}
            >
              Unsolved only
            </button>
          </>
        }
      />

      {/* Rung coverage — which rung are you stuck on --------------------- */}
      <div className="border-b border-rule">
        <FigCaption aside={<span className="text-red-500">the wall starts at {WALL}</span>}>
          Rung coverage · solved of every problem at each rating
        </FigCaption>
        {/* One continuous ladder, not a row of floating bars: the rungs are a
            single scale, so they share hairlines instead of sitting in gaps. */}
        <div className="px-5 pb-5 pt-4">
          <div className="flex h-[120px] items-end border border-hair">
            {rungs.map((r, i) => (
              <div
                key={r.rating}
                title={`${r.rating}: ${r.solved} of ${r.total} solved`}
                className={cn(
                  "flex h-full flex-1 flex-col justify-end",
                  i > 0 && "border-l border-hair"
                )}
              >
                <div className="bg-track" style={{ height: `${isLoading ? 100 : 100 - r.pct}%` }} />
                <div
                  className={rungFill(r.rating, r.pct)}
                  style={{ height: `${isLoading ? 0 : r.pct}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex border-x border-b border-hair">
            {rungs.map((r, i) => (
              <div
                key={r.rating}
                className={cn("flex-1 py-1.5 text-center", i > 0 && "border-l border-hair")}
              >
                <div
                  className={cn(
                    "font-mono text-label tabular-nums",
                    r.rating >= WALL ? "text-red-500" : "text-muted-foreground"
                  )}
                >
                  {r.rating}
                </div>
                {/* A dash, not "0%", while the problemset is still downloading —
                    the table below already says it is loading. */}
                <div className="mt-1 font-mono text-label tabular-nums text-faint">
                  {isLoading ? "—" : `${r.pct}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters --------------------------------------------------------- */}
      <div className="flex flex-wrap border-b border-rule">
        <FilterCell>
          <RatingRange
            from={initialRating}
            to={endingFilter}
            onFrom={(n) => {
              setInitialFilter(n);
              setPage(1);
            }}
            onTo={(n) => {
              setEndingFilter(n);
              setPage(1);
            }}
          />
        </FilterCell>

        {/* Full-height cells rather than chips floating in a taller row — the
            tag toggles read as part of the filter strip, not as objects sitting
            on top of it. */}
        <div className="flex items-stretch border-l border-hair pl-4 text-meta">
          <Label className="flex items-center pr-2">Weakest</Label>
          {chips.map((c) => {
            const active = activeTags.includes(c.tag);
            return (
              <button
                key={c.tag}
                type="button"
                onClick={() => toggleTag(c.tag)}
                aria-pressed={active}
                title={`${c.rate}% AC over ${c.attempts} attempts`}
                className={cn(
                  "self-stretch border-l border-field px-3 text-meta transition-colors last:border-r",
                  active
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-rowhover hover:text-foreground"
                )}
              >
                {c.tag}
              </button>
            );
          })}
          {hiddenTagCount > 0 && (
            <span className="flex items-center pl-3 text-label text-faint">
              +{hiddenTagCount} more
            </span>
          )}
        </div>

        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          className="flex items-center gap-2 px-5 py-3 text-meta text-muted-foreground transition-colors hover:bg-rowhover hover:text-foreground"
        >
          Sort by solve count
          {sortOrder === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Table ---------------------------------------------------------- */}
      <THead>
        <TH className="w-[48px] border-r border-hair">
          <span className="sr-only">Solved</span>
        </TH>
        <TH first>Problem</TH>
        <TH className="w-[80px]">Rating</TH>
        <TH className="w-[90px] sm:w-[110px]">Solved by</TH>
      </THead>

      {isLoading ? (
        <Notice>Loading the problemset…</Notice>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 border-b border-hair px-5 py-16 text-center">
          <p className="text-body text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="border border-field px-3.5 py-2 text-meta text-muted-foreground transition-colors hover:bg-rowhover hover:text-foreground"
          >
            Try again
          </button>
        </div>
      ) : visible.length ? (
        visible.map((p) => {
          const isSolved = solved.has(`${p.name}|${p.rating}`);
          const forYou = !isSolved && (p.tags?.some((t) => weakSet.has(t)) ?? false);
          return (
            <Link
              key={`${p.contestId}${p.index}`}
              href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(rowClass, isSolved && "bg-background")}
            >
              <TD className="w-[48px] border-r border-hair">
                <span
                  className={cn("font-mono text-meta", isSolved ? "text-foreground" : "text-faint")}
                  aria-label={isSolved ? "Solved" : "Not solved"}
                >
                  {isSolved ? "[*]" : "[ ]"}
                </span>
              </TD>
              <TD first className="gap-3 py-3">
                <span className="truncate text-body text-foreground">
                  {p.contestId}
                  {p.index}. {p.name}
                </span>
                {forYou && (
                  <span className="shrink-0 bg-foreground px-1.5 py-px text-label font-medium uppercase text-background">
                    for you
                  </span>
                )}
                <TagList tags={p.tags ?? []} className="hidden md:flex" />
              </TD>
              <TD className={cn("w-[80px] font-mono text-meta tabular-nums", ratingText(p.rating))}>
                {p.rating || "—"}
              </TD>
              <TD className="w-[90px] font-mono text-meta tabular-nums text-faint sm:w-[110px]">
                {p.solvedCount ? group(p.solvedCount) : "—"}
              </TD>
            </Link>
          );
        })
      ) : (
        <Notice>No problems match these filters.</Notice>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </>
  );
}
