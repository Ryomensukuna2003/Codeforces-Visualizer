"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useStore } from "@/components/Providers/fetchAPI";
import {
  FigCaption,
  Notice,
  StatStrip,
  TagChip,
} from "@/components/dossier/primitives";
import { clock, group, hourClock, longDate, signed, verdictShort } from "@/lib/dossier";
import { timeCostPerTag } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RatingEntry {
  contestId: number;
  contestName: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

interface ContestSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: { contestId: number; index: string; name: string; rating?: number; tags: string[] };
  author: { participantType: string };
  verdict: string;
}

interface ProblemSummary {
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  solved: boolean;
  attempts: number;
  firstAttemptTime: number;
  lastAttemptTime: number;
  solveTime: number | null;
  verdicts: string[];
  marks: { at: number; ac: boolean }[];
}

/** Two hours is the standard round; only used until contest.list answers. */
const FALLBACK_DURATION = 7200;

export default function AnalysisPage() {
  const { allRating, allSubmissionsData, contestData } = useStore() as any;

  const [contests, setContests] = useState<RatingEntry[]>([]);
  const [selectedContest, setSelectedContest] = useState<RatingEntry | null>(null);
  const [contestSubmissions, setContestSubmissions] = useState<ContestSubmission[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // A control shaped like a menu owes the two ways out of one. Escape returns
  // focus to the trigger: AnimatePresence unmounts the popup, so without this
  // focus lands on a removed node and Tab restarts from the top of the document.
  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDropdownOpen(false);
      triggerRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!allRating?.result) return;
    const sorted = [...allRating.result].sort(
      (a: RatingEntry, b: RatingEntry) =>
        b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
    );
    setContests(sorted);
    // Open on the most recent round. The post-mortem you want is almost always
    // the one you just played, and an empty page asked for a click to show
    // anything at all.
    setSelectedContest((current) => current ?? sorted[0] ?? null);
  }, [allRating]);

  useEffect(() => {
    if (!selectedContest || !allSubmissionsData?.result) return;
    setContestSubmissions(
      allSubmissionsData.result.filter(
        (s: ContestSubmission) =>
          s.contestId === selectedContest.contestId &&
          s.author?.participantType === "CONTESTANT"
      )
    );
  }, [selectedContest, allSubmissionsData]);

  const ratingDelta = selectedContest
    ? selectedContest.newRating - selectedContest.oldRating
    : 0;

  /** contest.list is already in the store — no extra request for the x-scale. */
  const duration = useMemo(() => {
    const match = (contestData?.result ?? []).find(
      (c: any) => c.id === selectedContest?.contestId
    );
    return match?.durationSeconds ?? FALLBACK_DURATION;
  }, [contestData, selectedContest]);

  const problemSummaries = useMemo<ProblemSummary[]>(() => {
    if (!contestSubmissions.length) return [];
    const map = new Map<string, ProblemSummary>();
    const sorted = [...contestSubmissions].sort(
      (a, b) => a.relativeTimeSeconds - b.relativeTimeSeconds
    );

    for (const sub of sorted) {
      const key = sub.problem.index;
      if (!map.has(key)) {
        map.set(key, {
          index: sub.problem.index,
          name: sub.problem.name,
          rating: sub.problem.rating,
          tags: sub.problem.tags,
          solved: false,
          attempts: 0,
          firstAttemptTime: sub.relativeTimeSeconds,
          lastAttemptTime: sub.relativeTimeSeconds,
          solveTime: null,
          verdicts: [],
          marks: [],
        });
      }
      const entry = map.get(key)!;
      entry.attempts++;
      entry.verdicts.push(sub.verdict);
      entry.lastAttemptTime = Math.max(entry.lastAttemptTime, sub.relativeTimeSeconds);
      entry.marks.push({ at: sub.relativeTimeSeconds, ac: sub.verdict === "OK" });
      if (sub.verdict === "OK" && !entry.solved) {
        entry.solved = true;
        entry.solveTime = sub.relativeTimeSeconds;
      }
    }

    return Array.from(map.values()).sort((a, b) => a.index.localeCompare(b.index));
  }, [contestSubmissions]);

  /**
   * Wasted time per problem: for a solved problem, the gap between the first
   * wrong answer and the AC; for an unsolved one, the whole span it swallowed.
   */
  const wastedByProblem = useMemo(() => {
    const out = new Map<string, number>();
    for (const p of problemSummaries) {
      if (!p.verdicts.some((v) => v !== "OK")) continue;
      const marks = [...p.marks].sort((a, b) => a.at - b.at);
      if (p.solved) {
        const firstWrong = marks.find((m) => !m.ac);
        const ac = marks.find((m) => m.ac);
        if (firstWrong && ac) out.set(p.index, Math.max(0, ac.at - firstWrong.at));
      } else {
        const span = marks[marks.length - 1].at - marks[0].at;
        out.set(p.index, span + (marks.length === 1 ? 60 : 0));
      }
    }
    return out;
  }, [problemSummaries]);

  const totalWasted = useMemo(
    () => Array.from(wastedByProblem.values()).reduce((a, b) => a + b, 0),
    [wastedByProblem]
  );

  /**
   * Gantt lanes. "Thinking" runs from where the previous problem was put down
   * to where this one was resolved — the sequential attention model the design
   * draws. x-scale is relativeTimeSeconds / contestDurationSeconds.
   */
  const lanes = useMemo(() => {
    const byStart = [...problemSummaries].sort(
      (a, b) => a.firstAttemptTime - b.firstAttemptTime
    );
    const pos = (t: number) => `${Math.min(100, Math.max(0, (t / duration) * 100))}%`;
    let cursor = 0;
    const out = byStart.map((p) => {
      const end = p.solved ? p.solveTime! : p.lastAttemptTime;
      const start = Math.min(cursor, end);
      cursor = Math.max(cursor, end);
      return {
        ...p,
        thinkLeft: pos(start),
        thinkWidth: `${Math.min(100, Math.max(0, ((end - start) / duration) * 100))}%`,
        markPositions: p.marks.map((m) => ({ left: pos(m.at), ac: m.ac })),
        result: p.solved ? `AC ${clock(p.solveTime!)}` : "Unsolved",
      };
    });
    return out.sort((a, b) => a.index.localeCompare(b.index));
  }, [problemSummaries, duration]);

  const axisTicks = useMemo(
    () => [0, 0.25, 0.5, 0.75, 1].map((f) => hourClock(duration * f)),
    [duration]
  );

  const costTags = useMemo(
    () => timeCostPerTag(problemSummaries, wastedByProblem).slice(0, 6),
    [problemSummaries, wastedByProblem]
  );

  const failedTagShare = useMemo(() => {
    const top = costTags[0];
    if (!top) return null;
    const totalFailures = problemSummaries.filter(
      (p) => !p.solved || p.verdicts.some((v) => v !== "OK")
    ).length;
    return totalFailures ? { tag: top.tag, of: totalFailures, count: top.failures } : null;
  }, [costTags, problemSummaries]);

  const solvedCount = problemSummaries.filter((p) => p.solved).length;

  return (
    <>
      {/* Header + contest picker ---------------------------------------- */}
      <div className="border-b border-rule px-5 pb-[18px] pt-[22px]">
        <div className="mb-2.5 font-display text-label uppercase text-faint">
          05 — Contest post-mortem
        </div>
        <h1 className="mb-4 font-display text-title font-bold text-foreground">
          Timeline
        </h1>
      </div>

      {/* Its own strip, edge to edge, rather than a bordered box floating inside
          the header block — the same rule the filter rows follow. */}
      <div ref={pickerRef} className="relative border-b border-rule">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-controls="contest-picker"
          className="flex w-full items-center justify-between gap-4 bg-inset px-5 py-3 text-left transition-colors hover:bg-rowhover"
        >
          <span className="min-w-0 truncate text-body text-foreground">
            {selectedContest ? (
              <>
                {selectedContest.contestName}
                <span className="ml-3 text-faint">
                  {longDate(selectedContest.ratingUpdateTimeSeconds)}
                </span>
              </>
            ) : (
              "Select a contest to analyze"
            )}
          </span>
          <span className="flex shrink-0 items-center gap-3.5">
            <span className="hidden text-meta text-faint sm:inline">
              {Math.max(0, contests.length - (selectedContest ? 1 : 0))} more contests
            </span>
            <ChevronDown
              className={cn(
                "h-[15px] w-[15px] text-muted-foreground transition-transform",
                dropdownOpen && "rotate-180"
              )}
            />
          </span>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              id="contest-picker"
              className="absolute inset-x-0 z-50 max-h-[60vh] overflow-y-auto border-b border-rule bg-card"
            >
              {contests.length === 0 && (
                <div className="px-5 py-3.5 text-meta text-muted-foreground">
                  No rated contests found. Set a handle in the sidebar.
                </div>
              )}
              {contests.map((c) => {
                const delta = c.newRating - c.oldRating;
                return (
                  <button
                    key={c.contestId}
                    type="button"
                    onClick={() => {
                      setSelectedContest(c);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-4 border-b border-hair px-5 py-3 text-left transition-colors last:border-0 hover:bg-rowhover"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-body text-foreground">
                        {c.contestName}
                      </span>
                      <span className="text-label text-faint">
                        {longDate(c.ratingUpdateTimeSeconds)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 border px-2 py-0.5 text-label tabular-nums",
                        delta >= 0
                          ? "border-rule text-foreground"
                          : "border-red-500 text-red-500"
                      )}
                    >
                      {signed(delta)}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!selectedContest ? (
        <Notice>Pick any rated contest above to see where the round went.</Notice>
      ) : (
        <>
          <StatStrip
            items={[
              { label: "Rank", value: `#${group(selectedContest.rank)}` },
              {
                label: "Rating change",
                value: signed(ratingDelta),
                accent: ratingDelta < 0,
              },
              {
                // The contest's problem count is no longer cheaply available:
                // Codeforces rejects every parameter on contest.standings, so the
                // only source is the full standings (~8 MB per contest).
                label: "Solved / tried",
                value: `${solvedCount} / ${problemSummaries.length}`,
              },
              { label: "Time wasted", value: clock(totalWasted), accent: totalWasted > 0 },
            ]}
          />

          {/* Where the round went ---------------------------------------- */}
          <div className="border-b border-rule">
            <FigCaption
              aside={
                <span className="flex gap-4">
                  <span>
                    <span className="mr-[5px] inline-block h-2 w-2 bg-foreground" />
                    AC
                  </span>
                  <span>
                    <span className="mr-[5px] inline-block h-2 w-2 bg-red-500" />
                    failed
                  </span>
                  <span>
                    <span className="mr-[5px] inline-block h-2 w-2 bg-chip" />
                    thinking
                  </span>
                </span>
              }
            >
              Where the {Math.round((duration / 3600) * 10) / 10} hours went
            </FigCaption>

            {lanes.length ? (
              <div className="px-5 pb-1 pt-3.5">
                {lanes.map((l) => (
                  <div key={l.index} className="flex h-[34px] items-center gap-3.5">
                    <span
                      className={cn(
                        "w-[112px] shrink-0 truncate text-meta",
                        l.solved ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {l.index}. {l.name}
                    </span>
                    <span className="hidden w-[42px] shrink-0 text-label tabular-nums text-faint sm:block">
                      {l.rating ?? "—"}
                    </span>
                    {/* The track is positioned divs and nothing else, so the
                        whole attention model was invisible non-visually. */}
                    <div
                      role="img"
                      aria-label={`${l.index}: ${
                        l.solved
                          ? `solved at ${clock(l.solveTime!)}`
                          : `unsolved, last attempt at ${clock(l.lastAttemptTime)}`
                      } after ${l.markPositions.length} attempt${
                        l.markPositions.length === 1 ? "" : "s"
                      }`}
                      className="relative h-4 min-w-0 flex-1 border-l border-hair bg-background"
                    >
                      <div
                        className="absolute inset-y-0 bg-chip"
                        style={{ left: l.thinkLeft, width: l.thinkWidth }}
                      />
                      {l.markPositions.map((m, i) => (
                        <div
                          key={i}
                          className={cn(
                            "absolute -bottom-[3px] -top-[3px] w-[3px]",
                            m.ac ? "bg-foreground" : "bg-red-500"
                          )}
                          style={{ left: m.left }}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        "w-[86px] shrink-0 whitespace-nowrap text-right font-mono text-meta tabular-nums",
                        l.solved ? "text-foreground" : "text-red-500"
                      )}
                    >
                      {l.result}
                    </span>
                  </div>
                ))}
                {/* Mirrors the lane row's own columns rather than guessing at
                    their combined width: a hardcoded `pl-[168px]` put 0:00 14px
                    left of the track and 2:00 a hundred px right of it, so the
                    axis was labelling times the bars never reached. */}
                <div className="mb-3 mt-1.5 flex gap-3.5">
                  <span className="w-[112px] shrink-0" aria-hidden />
                  <span className="hidden w-[42px] shrink-0 sm:block" aria-hidden />
                  <div className="relative flex min-w-0 flex-1">
                    {axisTicks.slice(0, -1).map((t, i) => (
                      <span key={t + i} className="flex-1 text-label tabular-nums text-faint">
                        {t}
                      </span>
                    ))}
                    <span className="absolute right-0 top-0 text-label tabular-nums text-faint">
                      {axisTicks[axisTicks.length - 1]}
                    </span>
                  </div>
                  <span className="w-[86px] shrink-0" aria-hidden />
                </div>
              </div>
            ) : (
              <Notice>No in-contest submissions recorded for this round.</Notice>
            )}
          </div>

          {/* Breakdown + tag cost --------------------------------------- */}
          <div className="flex flex-col items-stretch xl:flex-row">
            <div className="min-w-0 flex-1 xl:border-r xl:border-rule">
              <FigCaption>Problem breakdown</FigCaption>
              {/* Connected rows, not floating cards: the panel beside this one
                  already divides with hairlines, and two panels side by side
                  cannot disagree about what a row is. */}
              <div className="flex flex-col">
                {problemSummaries.map((p) => {
                  const fails = Object.entries(
                    p.verdicts
                      .filter((v) => v !== "OK")
                      .reduce<Record<string, number>>((acc, v) => {
                        const k = verdictShort(v);
                        acc[k] = (acc[k] ?? 0) + 1;
                        return acc;
                      }, {})
                  )
                    .map(([v, n]) => `${n}× ${v}`)
                    .join(", ");

                  return (
                    <div
                      key={p.index}
                      className={cn(
                        "border-b border-hair px-5 py-[15px] last:border-b-0",
                        p.solved ? "bg-card" : "border-l-2 border-l-red-500 bg-flag pl-[18px]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-baseline gap-2.5">
                          <span className="text-body font-bold text-foreground">{p.index}</span>
                          <span className="truncate text-body text-foreground">{p.name}</span>
                          {p.rating ? (
                            <span className="shrink-0 text-label tabular-nums text-faint">
                              ({p.rating})
                            </span>
                          ) : null}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 border px-[9px] py-[3px] text-label tabular-nums",
                            p.solved
                              ? "border-rule text-foreground"
                              : "border-red-500 bg-red-500 uppercase text-white"
                          )}
                        >
                          {p.solved ? `AC in ${clock(p.solveTime!)}` : "Unsolved"}
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3.5 text-label text-muted-foreground">
                        <span>
                          {p.attempts} attempt{p.attempts !== 1 ? "s" : ""}
                        </span>
                        {fails ? <span className="text-red-500">{fails}</span> : null}
                      </div>
                      {p.tags.length ? (
                        <div className="mt-2.5 flex flex-wrap gap-[5px]">
                          {p.tags.map((t) => (
                            <TagChip key={t} flagged={!p.solved}>
                              {t}
                            </TagChip>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-rule xl:w-[452px] xl:border-t-0">
              <FigCaption>Tags that cost you time</FigCaption>
              {costTags.length ? (
                costTags.map((t) => (
                  <a
                    key={t.tag}
                    href={`https://codeforces.com/problemset?order=BY_RATING_ASC&tags=${encodeURIComponent(
                      t.tag
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 border-b border-hair px-5 py-[15px] transition-colors hover:bg-rowhover"
                  >
                    <span className="min-w-0">
                      <span className="block text-body font-semibold text-foreground">
                        {t.tag}
                      </span>
                      <span className="mt-[5px] block text-label text-faint">
                        struggled in {t.problems.join(", ")} · {t.failures} of{" "}
                        {problemSummaries.length} problems
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-label tabular-nums text-red-500">
                      −{clock(t.seconds)}
                      <ArrowRight className="h-[11px] w-[11px]" />
                    </span>
                  </a>
                ))
              ) : (
                <Notice>Clean contest — no tag gave you trouble.</Notice>
              )}

              {totalWasted > 0 && failedTagShare ? (
                <div className="border-l-2 border-red-500 bg-flag-wash py-4 pl-[18px] pr-5 text-meta leading-[1.7] text-muted-foreground">
                  You lost <b className="text-foreground">{clock(totalWasted)}</b> to failed
                  attempts — {Math.round((totalWasted / duration) * 100)}% of the round.{" "}
                  {failedTagShare.count} of {failedTagShare.of} came from{" "}
                  <b className="text-foreground">{failedTagShare.tag}</b>.
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </>
  );
}
