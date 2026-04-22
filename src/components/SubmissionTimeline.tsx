"use client";

import { motion } from "framer-motion";

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
  verdict: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
  programmingLanguage: string;
}

interface TimelineProps {
  submissions: ContestSubmission[];
  contestName: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function verdictLabel(verdict: string): string {
  const map: Record<string, string> = {
    OK: "ACCEPTED",
    WRONG_ANSWER: "WRONG ANSWER",
    TIME_LIMIT_EXCEEDED: "TLE",
    MEMORY_LIMIT_EXCEEDED: "MLE",
    RUNTIME_ERROR: "RUNTIME ERROR",
    COMPILATION_ERROR: "COMPILE ERROR",
    CHALLENGED: "HACKED",
    SKIPPED: "SKIPPED",
    TESTING: "TESTING",
    PARTIAL: "PARTIAL",
  };
  return map[verdict] || verdict.replace(/_/g, " ");
}

export default function SubmissionTimeline({
  submissions,
  contestName,
}: TimelineProps) {
  if (!submissions.length) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        No submissions found for this contest.
      </div>
    );
  }

  const sorted = [...submissions].sort(
    (a, b) => a.relativeTimeSeconds - b.relativeTimeSeconds
  );

  const items: Array<
    | { type: "submission"; sub: ContestSubmission; step: number }
    | { type: "gap"; duration: number }
  > = [];

  let step = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const gap =
        sorted[i].relativeTimeSeconds - sorted[i - 1].relativeTimeSeconds;
      if (gap > 600) {
        items.push({ type: "gap", duration: gap });
      }
    }
    step++;
    items.push({ type: "submission", sub: sorted[i], step });
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto pl-4">
      {/* Continuous vertical line */}
      <div className="absolute left-[29px] top-0 bottom-0 w-px bg-neutral-600" />

      {items.map((item, i) => {
        if (item.type === "gap") {
          return (
            <div
              key={`gap-${i}`}
              className="relative flex items-center py-2 pl-16"
            >
              <span className="text-xs text-muted-foreground font-mono">
                +{formatTime(item.duration)} idle
              </span>
            </div>
          );
        }

        const { sub, step: stepNum } = item;
        const isAC = sub.verdict === "OK";

        return (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.25 }}
            className={`relative flex items-start ${isAC ? "my-2" : "my-1"}`}
          >
            {/* Node -- always on the vertical line */}
            <div className="relative z-10 shrink-0 w-[30px] flex justify-center pt-[10px]">
              <div
                className={`w-7 h-7 flex items-center justify-center text-[11px] font-bold ${
                  isAC
                    ? "bg-foreground text-background"
                    : "bg-background text-red-500 border border-red-500"
                }`}
              >
                {stepNum}
              </div>
            </div>

            {/* Content */}
            {isAC ? (
              <div className="flex-1 border border-neutral-600 bg-card ml-6">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-600">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatTime(sub.relativeTimeSeconds)}
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {sub.problem.index}. {sub.problem.name}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-foreground tracking-wider">
                    ACCEPTED
                  </span>
                </div>
                <div className="px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  {sub.problem.rating && (
                    <span>Rating: {sub.problem.rating}</span>
                  )}
                  <span>{sub.programmingLanguage}</span>
                  <span>{sub.timeConsumedMillis}ms</span>
                  <span>
                    {Math.round(sub.memoryConsumedBytes / 1024)}KB
                  </span>
                </div>
                {sub.problem.tags.length > 0 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1">
                    {sub.problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 border border-neutral-700 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-6 pt-[10px]">
                <span className="font-mono text-sm text-muted-foreground">
                  {formatTime(sub.relativeTimeSeconds)}
                </span>
                <span className="text-red-500 font-bold">
                  {sub.problem.index}
                </span>
                <span className="text-red-500/80 text-sm font-bold">
                  {verdictLabel(sub.verdict)}
                </span>
                <span className="text-red-500/40 text-xs font-mono">
                  test {sub.passedTestCount + 1}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
