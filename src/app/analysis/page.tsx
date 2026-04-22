"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useStore } from "@/components/Providers/fetchAPI";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { NavBar } from "@/components/ui/NavBar";
import SubmissionTimeline from "@/components/SubmissionTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  problem: {
    contestId: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
  };
  author: {
    participantType: string;
  };
  verdict: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
  programmingLanguage: string;
}

interface ProblemSummary {
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  solved: boolean;
  attempts: number;
  firstAttemptTime: number;
  solveTime: number | null;
  verdicts: string[];
}

export default function AnalysisPage() {
  const { allRating, allSubmissionsData } = useStore() as any;
  const { username } = useUsernameStore() as { username: string };

  const [contests, setContests] = useState<RatingEntry[]>([]);
  const [selectedContest, setSelectedContest] = useState<RatingEntry | null>(null);
  const [contestSubmissions, setContestSubmissions] = useState<ContestSubmission[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalProblems, setTotalProblems] = useState(0);

  useEffect(() => {
    if (allRating?.result) {
      const sorted = [...allRating.result].sort(
        (a: RatingEntry, b: RatingEntry) =>
          b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
      );
      setContests(sorted);
    }
  }, [allRating]);

  const fetchContestProblems = useCallback(async (contestId: number) => {
    try {
      const res = await axios.get(
        `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`
      );
      if (res.data?.result?.problems) {
        setTotalProblems(res.data.result.problems.length);
      }
    } catch {
      setTotalProblems(0);
    }
  }, []);

  useEffect(() => {
    if (!selectedContest || !allSubmissionsData?.result) return;

    setLoading(true);
    const subs = allSubmissionsData.result.filter(
      (s: ContestSubmission) =>
        s.contestId === selectedContest.contestId &&
        s.author?.participantType === "CONTESTANT"
    );
    setContestSubmissions(subs);
    fetchContestProblems(selectedContest.contestId);
    setLoading(false);
  }, [selectedContest, allSubmissionsData, fetchContestProblems]);

  const ratingDelta = selectedContest
    ? selectedContest.newRating - selectedContest.oldRating
    : 0;

  const problemSummaries = useMemo(() => {
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
          solveTime: null,
          verdicts: [],
        });
      }
      const entry = map.get(key)!;
      entry.attempts++;
      entry.verdicts.push(sub.verdict);
      if (sub.verdict === "OK" && !entry.solved) {
        entry.solved = true;
        entry.solveTime = sub.relativeTimeSeconds;
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.index.localeCompare(b.index)
    );
  }, [contestSubmissions]);

  const totalWasted = useMemo(() => {
    let wasted = 0;
    for (const p of problemSummaries) {
      const wrongCount = p.verdicts.filter((v) => v !== "OK").length;
      if (wrongCount === 0) continue;

      const subs = contestSubmissions
        .filter((s) => s.problem.index === p.index)
        .sort((a, b) => a.relativeTimeSeconds - b.relativeTimeSeconds);

      if (p.solved) {
        const firstWrong = subs.find((s) => s.verdict !== "OK");
        const ac = subs.find((s) => s.verdict === "OK");
        if (firstWrong && ac) {
          wasted += ac.relativeTimeSeconds - firstWrong.relativeTimeSeconds;
        }
      } else if (subs.length >= 1) {
        const first = subs[0];
        const last = subs[subs.length - 1];
        wasted += last.relativeTimeSeconds - first.relativeTimeSeconds;
        if (subs.length === 1) wasted += 60;
      }
    }
    return wasted;
  }, [problemSummaries, contestSubmissions]);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Contest Picker -- flush against navbar, full width, no gaps */}
      <div className="relative w-full border-b border-neutral-600">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between px-6 h-14 bg-card text-foreground text-lg font-mono hover:bg-secondary/30 transition-colors"
        >
          <span>
            {selectedContest
              ? selectedContest.contestName
              : "Select a contest to analyze"}
          </span>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 w-full border-b border-neutral-600 bg-card max-h-[calc(100vh-136px)] overflow-y-auto"
            >
              {contests.length === 0 && (
                <div className="px-6 py-4 text-muted-foreground">
                  No rated contests found. Make sure a username is set.
                </div>
              )}
              {contests.map((c) => {
                const delta = c.newRating - c.oldRating;
                return (
                  <button
                    key={c.contestId}
                    onClick={() => {
                      setSelectedContest(c);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-secondary/50 transition-colors border-b border-neutral-800 last:border-0 text-left"
                  >
                    <div>
                      <span className="text-sm text-foreground">
                        {c.contestName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-3">
                        {new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge
                        variant={delta >= 0 ? "outline" : "destructive"}
                        className="font-mono rounded-none"
                      >
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </Badge>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Contest Summary */}
        {selectedContest && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Summary Stats Row */}
            <div className="flex border border-neutral-600">
              <div className="flex-1 p-4 bg-card">
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Rank
                </div>
                <div className="text-2xl font-bold mt-1">
                  #{selectedContest.rank}
                </div>
              </div>
              <div className="flex-1 p-4 bg-card border-l border-neutral-600">
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Rating Change
                </div>
                <div
                  className={`text-2xl font-bold mt-1 ${
                    ratingDelta >= 0 ? "text-foreground" : "text-red-500"
                  }`}
                >
                  {ratingDelta > 0 ? "+" : ""}
                  {ratingDelta}
                </div>
              </div>
              <div className="flex-1 p-4 bg-card border-l border-neutral-600">
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Solved / Attempted / Total
                </div>
                <div className="text-2xl font-bold mt-1">
                  {problemSummaries.filter((p) => p.solved).length}
                  <span className="text-muted-foreground"> / </span>
                  {problemSummaries.length}
                  <span className="text-muted-foreground"> / </span>
                  {totalProblems || problemSummaries.length}
                </div>
              </div>
              <div className="flex-1 p-4 bg-card border-l border-neutral-600">
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Time Wasted
                </div>
                <div className="text-2xl font-bold mt-1 text-red-500/80">
                  {formatTime(totalWasted)}
                </div>
              </div>
            </div>

            {/* Submission Timeline */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-mono">
                <span className="text-muted-foreground">[</span>
                SUBMISSION TIMELINE
                <span className="text-muted-foreground">]</span>
              </h2>
              <SubmissionTimeline
                submissions={contestSubmissions}
                contestName={selectedContest.contestName}
              />
            </div>

            {/* Per-Problem Breakdown */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-mono">
                <span className="text-muted-foreground">[</span>
                PROBLEM BREAKDOWN
                <span className="text-muted-foreground">]</span>
              </h2>
              <div className="space-y-3">
                {problemSummaries.map((p) => (
                  <motion.div
                    key={p.index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border p-4 ${
                      p.solved
                        ? "border-neutral-600 bg-card"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-mono">
                          {p.index}
                        </span>
                        <span className="text-foreground">{p.name}</span>
                        {p.rating && (
                          <span className="text-xs text-muted-foreground font-mono">
                            ({p.rating})
                          </span>
                        )}
                      </div>
                      {p.solved ? (
                        <Badge variant="outline" className="font-mono text-foreground border-neutral-600 rounded-none">
                          AC in {formatTime(p.solveTime!)}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="font-mono rounded-none">
                          UNSOLVED
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                      <span>{p.attempts} attempt{p.attempts !== 1 ? "s" : ""}</span>
                      {!p.solved && (
                        <span className="text-red-500/70">
                          {p.verdicts
                            .reduce((acc, v) => {
                              const existing = acc.find((a) => a.v === v);
                              if (existing) existing.count++;
                              else acc.push({ v, count: 1 });
                              return acc;
                            }, [] as { v: string; count: number }[])
                            .map(
                              ({ v, count }) =>
                                `${count}x ${v === "WRONG_ANSWER" ? "WA" : v === "TIME_LIMIT_EXCEEDED" ? "TLE" : v === "RUNTIME_ERROR" ? "RE" : v === "MEMORY_LIMIT_EXCEEDED" ? "MLE" : v.replace(/_/g, " ")}`
                            )
                            .join(", ")}
                        </span>
                      )}
                    </div>

                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] px-2 py-0.5 border ${
                              !p.solved
                                ? "border-red-500/30 text-red-500/70"
                                : "border-neutral-700 text-muted-foreground"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tags That Messed You Up */}
            {problemSummaries.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-mono">
                  <span className="text-muted-foreground">[</span>
                  TAGS THAT MESSED YOU UP
                  <span className="text-muted-foreground">]</span>
                </h2>
                <div className="border border-neutral-600">
                  {(() => {
                    const tagMap = new Map<string, { failed: number; solved: number; problems: string[] }>();
                    for (const p of problemSummaries) {
                      for (const tag of p.tags) {
                        if (!tagMap.has(tag)) tagMap.set(tag, { failed: 0, solved: 0, problems: [] });
                        const entry = tagMap.get(tag)!;
                        if (!p.solved) {
                          entry.failed++;
                          entry.problems.push(p.index);
                        } else {
                          const wrongCount = p.verdicts.filter((v) => v !== "OK").length;
                          if (wrongCount > 0) {
                            entry.failed++;
                            entry.problems.push(p.index);
                          } else {
                            entry.solved++;
                          }
                        }
                      }
                    }
                    const struggled = Array.from(tagMap.entries())
                      .filter(([, v]) => v.failed > 0)
                      .sort((a, b) => b[1].failed - a[1].failed);

                    if (struggled.length === 0) {
                      return (
                        <div className="px-6 py-8 text-center text-muted-foreground font-mono text-sm">
                          Clean contest -- no tags gave you trouble.
                        </div>
                      );
                    }

                    return struggled.map(([tag, data], idx) => (
                      <a
                        key={tag}
                        href={`https://codeforces.com/problemset?order=BY_RATING_ASC&tags=${encodeURIComponent(tag)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors ${
                          idx !== struggled.length - 1 ? "border-b border-neutral-600" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-foreground font-mono font-bold">
                            {tag}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            struggled in {data.problems.join(", ")}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          Practice &rarr;
                        </span>
                      </a>
                    ));
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!selectedContest && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <TrendingDown className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-mono">Select a contest to view the timeline</p>
            <p className="text-sm mt-1">
              Pick any rated contest from the dropdown above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
