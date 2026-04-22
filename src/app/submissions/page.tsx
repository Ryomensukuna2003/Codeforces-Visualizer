"use client";

import Link from "next/link";
import { useState } from "react";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { useStore } from "@/components/Providers/fetchAPI";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavBar } from "@/components/ui/NavBar";

export default function SubmissionsPage() {
  const { username } = useUsernameStore() as { username: string };
  const { allSubmissionsData } = useStore() as any;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const getCurrentPageSubmissions = () => {
    if (!allSubmissionsData?.result || !Array.isArray(allSubmissionsData.result)) {
      return [];
    }
    const start = (currentPage - 1) * itemsPerPage;
    return allSubmissionsData.result.slice(start, start + itemsPerPage);
  };

  const submissions = getCurrentPageSubmissions();
  const totalSubmissions = allSubmissionsData?.result?.length || 0;
  const totalPages = Math.ceil(totalSubmissions / itemsPerPage);
  const finalPage = !allSubmissionsData || currentPage >= totalPages;

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

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Header */}
      <div className="w-full border-b border-neutral-600">
        <div className="flex items-center justify-between px-6 h-14">
          <span className="font-mono text-lg text-foreground">
            All Submissions
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            [{totalSubmissions}]
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-[10%] border-x border-neutral-600">
        {submissions.map((sub: any) => {
          const isAC = sub.verdict === "OK";
          return (
            <Link
              key={sub.id}
              href={`https://codeforces.com/contest/${sub.problem.contestId}/submission/${sub.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-stretch border-b border-neutral-600 hover:bg-secondary/30 transition-colors"
            >
              {/* Verdict indicator */}
              <div className="shrink-0 w-16 border-r border-neutral-600 flex items-center justify-center">
                <span
                  className={`font-mono text-xs font-bold ${
                    isAC ? "text-foreground" : "text-red-500"
                  }`}
                >
                  {verdictShort(sub.verdict)}
                </span>
              </div>

              {/* Problem info */}
              <div className="flex-1 px-6 py-4">
                <div className="text-sm text-foreground group-hover:underline">
                  {sub.problem.index}. {sub.problem.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {sub.problem.rating ? `Rating ${sub.problem.rating}` : "Unrated"}
                  {sub.problem.tags?.length > 0 && (
                    <span className="ml-3 text-muted-foreground/50">
                      {sub.problem.tags.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Language */}
              <div className="shrink-0 w-48 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                {sub.programmingLanguage}
              </div>

              {/* Time */}
              <div className="shrink-0 w-20 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                {sub.timeConsumedMillis || "—"}ms
              </div>

              {/* Memory */}
              <div className="shrink-0 w-24 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                {sub.memoryConsumedBytes
                  ? Math.round(sub.memoryConsumedBytes / 1024) + "KB"
                  : "—"}
              </div>
            </Link>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex border-b border-neutral-600">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-mono text-sm text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-30 disabled:hover:bg-transparent border-r border-neutral-600"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <div className="flex items-center justify-center px-8 py-4 font-mono text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={finalPage}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-mono text-sm text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-30 disabled:hover:bg-transparent border-l border-neutral-600"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="flex h-[15vh]">
          <div className="shrink-0 w-16 border-r border-neutral-600"></div>
          <div className="flex-1"></div>
          <div className="shrink-0 w-48 border-l border-neutral-600"></div>
          <div className="shrink-0 w-20 border-l border-neutral-600"></div>
          <div className="shrink-0 w-24 border-l border-neutral-600"></div>
        </div>
      </div>
    </div>
  );
}
