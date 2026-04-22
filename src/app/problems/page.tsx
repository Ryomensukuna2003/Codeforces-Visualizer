"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Problem, ProblemStatistics, CombinedData } from "../types";
import { NavBar } from "@/components/ui/NavBar";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<CombinedData[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<CombinedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRating, setInitialFilter] = useState(800);
  const [endingFilter, setEndingFilter] = useState(3200);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { username, Attempted } = useUsernameStore() as {
    username: string;
    Attempted: string[];
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedProblems, setDisplayedProblems] = useState<Problem[]>([]);
  const contestsPerPage = 100;

  useEffect(() => {
    fetchProblems();
  }, [username]);

  const fetchProblems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://codeforces.com/api/problemset.problems"
      );
      const data = await response.json();
      if (data.status === "OK") {
        const combinedArray: CombinedData[] = [];
        data.result.problems.forEach((problem: Problem) => {
          const stats = data.result.problemStatistics.find(
            (stat: ProblemStatistics) =>
              stat.contestId === problem.contestId &&
              stat.index === problem.index
          );
          if (stats) {
            combinedArray.push({
              contestId: problem.contestId,
              index: problem.index,
              name: problem.name,
              type: problem.type,
              rating: problem.rating,
              tags: problem.tags,
              solvedCount: stats.solvedCount,
            });
          }
        });
        setProblems(combinedArray);
        const filtered = combinedArray.filter(
          (problem) =>
            problem.rating >= initialRating && problem.rating <= endingFilter
        );
        setFilteredProblems(filtered);
        updateDisplayedProblems(filtered, 1);
      } else {
        throw new Error("Failed to fetch problems");
      }
    } catch {
      setError(
        "An error occurred while fetching problems. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateDisplayedProblems = (problems: CombinedData[], page: number) => {
    const from = (page - 1) * contestsPerPage;
    setDisplayedProblems(problems.slice(from, from + contestsPerPage) as any);
  };

  useEffect(() => {
    updateDisplayedProblems(filteredProblems, currentPage);
  }, [currentPage, filteredProblems]);

  const filterQuestions = () => {
    const filtered = problems.filter(
      (problem) =>
        problem.rating >= initialRating && problem.rating <= endingFilter
    );
    setFilteredProblems(filtered);
    setCurrentPage(1);
    updateDisplayedProblems(filtered, 1);
  };

  const handleSort = () => {
    const sorted = [...filteredProblems].sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.solvedCount || 0) - (b.solvedCount || 0);
      } else {
        return (b.solvedCount || 0) - (a.solvedCount || 0);
      }
    });
    setFilteredProblems(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    updateDisplayedProblems(sorted, currentPage);
  };

  const totalPages = Math.ceil(filteredProblems.length / contestsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Header -- full width with filters */}
      <div className="w-full border-b border-neutral-600">
        <div className="flex items-center h-14 px-6">
          <span className="font-mono text-lg text-foreground mr-auto">
            Problem List
          </span>
          <div className="flex items-center gap-0">
            <input
              type="number"
              value={initialRating}
              onChange={(e) => setInitialFilter(Number(e.target.value))}
              className="h-14 w-20 bg-transparent border-l border-neutral-600 px-3 font-mono text-sm text-foreground focus:outline-none text-center"
            />
            <span className="font-mono text-xs text-muted-foreground px-2">to</span>
            <input
              type="number"
              value={endingFilter}
              onChange={(e) => setEndingFilter(Number(e.target.value))}
              className="h-14 w-20 bg-transparent border-l border-neutral-600 px-3 font-mono text-sm text-foreground focus:outline-none text-center"
            />
            <button
              onClick={filterQuestions}
              className="h-14 px-5 border-l border-neutral-600 font-mono text-sm text-foreground hover:bg-secondary/30 transition-colors"
            >
              Filter
            </button>
            <button
              onClick={handleSort}
              className="h-14 px-5 border-l border-neutral-600 font-mono text-sm text-foreground hover:bg-secondary/30 transition-colors flex items-center gap-1"
            >
              Sort by Difficulty
              {sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-[10%] border-x border-neutral-600">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 font-mono text-muted-foreground">
            Loading problems...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 font-mono text-red-500">
            {error}
          </div>
        ) : (
          <>
            {displayedProblems.map((problem: any) => {
              const isSolved = Attempted.includes(
                `${problem.name}|${problem.rating}`
              );
              return (
                <Link
                  key={`${problem.contestId}${problem.index}`}
                  href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-stretch border-b border-neutral-600 hover:bg-secondary/30 transition-colors ${
                    isSolved ? "bg-secondary/20" : ""
                  }`}
                >
                  {/* Solved indicator */}
                  <div className="shrink-0 w-14 border-r border-neutral-600 flex items-center justify-center font-mono text-sm">
                    {isSolved ? (
                      <span className="text-foreground">[*]</span>
                    ) : (
                      <span className="text-muted-foreground/30">[ ]</span>
                    )}
                  </div>

                  {/* Problem info */}
                  <div className="flex-1 px-6 py-4">
                    <div className="text-sm text-foreground group-hover:underline">
                      {problem.index}. {problem.name}
                    </div>
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {problem.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 border border-neutral-700 text-muted-foreground font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="shrink-0 w-24 border-l border-neutral-600 flex items-center justify-center font-mono text-sm text-foreground">
                    {problem.rating || "—"}
                  </div>

                  {/* Solved count */}
                  <div className="shrink-0 w-24 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                    {problem.solvedCount ? `×${problem.solvedCount}` : "—"}
                  </div>
                </Link>
              );
            })}
          </>
        )}

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
              disabled={currentPage === totalPages}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-mono text-sm text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-30 disabled:hover:bg-transparent border-l border-neutral-600"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="flex h-[15vh]">
          <div className="shrink-0 w-14 border-r border-neutral-600"></div>
          <div className="flex-1"></div>
          <div className="shrink-0 w-24 border-l border-neutral-600"></div>
          <div className="shrink-0 w-24 border-l border-neutral-600"></div>
        </div>
      </div>
    </div>
  );
}
