"use client"
import Link from "next/link"
import { RecentSubmissionsProps } from "@/types/props";

function verdictShort(verdict: string): string {
  if (verdict === "OK") return "AC";
  const map: Record<string, string> = {
    WRONG_ANSWER: "WA",
    TIME_LIMIT_EXCEEDED: "TLE",
    MEMORY_LIMIT_EXCEEDED: "MLE",
    RUNTIME_ERROR: "RE",
    COMPILATION_ERROR: "CE",
    CHALLENGED: "HACK",
    SKIPPED: "SKIP",
  };
  return map[verdict] || verdict;
}

const RecentSubmissions = ({ submissions }: RecentSubmissionsProps) => {
  return (
    <div className="w-full border-t border-neutral-600">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-neutral-600">
        <span className="font-mono text-lg text-foreground">
          Recent Submissions
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          [{submissions?.length || 0}]
        </span>
      </div>

      {/* Column labels */}
      <div className="flex items-stretch h-14 border-b border-neutral-600">
        <div className="shrink-0 w-16 border-r border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
          Verdict
        </div>
        <div className="flex-1 px-6 flex items-center font-mono text-xs text-muted-foreground">
          Problem
        </div>
        <div className="shrink-0 w-48 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
          Language
        </div>
        <div className="shrink-0 w-36 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
          Submitted
        </div>
        <div className="shrink-0 w-24 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
          Time
        </div>
      </div>

      {/* Rows */}
      {submissions?.length > 0 ? (
        submissions.map((submission) => {
          const isAC = submission.verdict === "OK";
          return (
            <Link
              key={submission.id}
              href={`https://codeforces.com/contest/${submission.problem.contestId}/submission/${submission.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-stretch border-b border-neutral-600 hover:bg-secondary/30 transition-colors"
            >
              {/* Verdict */}
              <div className="shrink-0 w-16 border-r border-neutral-600 flex items-center justify-center">
                <span
                  className={`font-mono text-xs font-bold ${
                    isAC ? "text-foreground" : "text-red-500"
                  }`}
                >
                  {verdictShort(submission.verdict)}
                </span>
              </div>

              {/* Problem info */}
              <div className="flex-1 px-6 py-3">
                <div className="text-sm text-foreground group-hover:underline">
                  {submission.problem.index}. {submission.problem.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {submission.problem.rating ? `Rating ${submission.problem.rating}` : "Unrated"}
                  {submission.problem.tags?.length > 0 && (
                    <span className="ml-3 text-muted-foreground/50">
                      {submission.problem.tags.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Language */}
              <div className="shrink-0 w-48 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                {submission.programmingLanguage}
              </div>

              {/* Created */}
              <div className="shrink-0 w-36 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                {submission.creationTimeSeconds
                  ? new Date(submission.creationTimeSeconds * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </div>

              {/* Relative time */}
              <div className="shrink-0 w-24 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                {submission.relativeTimeSeconds != null
                  ? `${Math.floor(submission.relativeTimeSeconds / 60)}:${String(submission.relativeTimeSeconds % 60).padStart(2, "0")}`
                  : "—"}
              </div>
            </Link>
          );
        })
      ) : (
        <div className="flex items-center justify-center py-8 border-b border-neutral-600 text-muted-foreground font-mono text-sm">
          No recent submissions
        </div>
      )}

      {/* Bottom spacer */}
      <div className="flex h-[5vh]">
        <div className="shrink-0 w-16 border-r border-neutral-600"></div>
        <div className="flex-1"></div>
        <div className="shrink-0 w-48 border-l border-neutral-600"></div>
        <div className="shrink-0 w-36 border-l border-neutral-600"></div>
        <div className="shrink-0 w-24 border-l border-neutral-600"></div>
      </div>
    </div>
  );
};

export default RecentSubmissions
