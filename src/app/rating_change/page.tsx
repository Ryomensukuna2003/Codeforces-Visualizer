"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RatingChange } from "../types";
import { useStore } from "../../components/Providers/fetchAPI";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { NavBar } from "@/components/ui/NavBar";

export default function ContestsPage() {
  const [fullRating, setFullRating] = useState<RatingChange[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContests, setTotalContests] = useState(0);
  const contestsPerPage = 100;
  const { allRating } = useStore() as any;
  const { username } = useUsernameStore() as { username: string };

  useEffect(() => {
    fetchAPI();
  }, [currentPage, username, allRating]);

  const fetchAPI = async () => {
    const from = (currentPage - 1) * contestsPerPage + 1;
    try {
      let ratingArr: RatingChange[] = [];
      allRating?.result.forEach((element: RatingChange) => {
        ratingArr.push({
          contestName: element.contestName,
          ratingUpdateTimeSeconds: element.ratingUpdateTimeSeconds,
          rank: element.rank,
          oldRating: element.oldRating,
          newRating: element.newRating,
          id: element.id,
        });
      });
      ratingArr = ratingArr.sort(
        (a, b) => b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
      );
      setFullRating(ratingArr.slice(from - 1, from - 1 + contestsPerPage));
      setTotalContests(ratingArr.length);
    } catch (error) {
      console.error("Failed to fetch rating data:", error);
    }
  };

  const contests = fullRating || [];
  const totalPages = Math.ceil(totalContests / contestsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Header -- full width flush to navbar */}
      <div className="w-full border-b border-neutral-600">
        <div className="flex items-center justify-between px-6 h-14">
          <span className="font-mono text-lg text-foreground">
            Contest History
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            [{totalContests}]
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-[10%] border-x border-neutral-600">
        {contests.map((contest: any) => {
          const delta = contest.newRating - contest.oldRating;
          return (
            <Link
              key={`${contest.id}${contest.contestName}`}
              href={`https://codeforces.com/contest/${contest.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-stretch border-b border-neutral-600 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex-1 px-6 py-5">
                <div className="text-sm text-foreground group-hover:underline">
                  {contest.contestName}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {new Date(
                    contest.ratingUpdateTimeSeconds * 1000
                  ).toLocaleDateString()}
                  <span className="ml-4">Rank #{contest.rank}</span>
                </div>
              </div>
              <div className="shrink-0 w-40 border-l border-neutral-600 text-center font-mono text-sm flex items-center justify-center">
                <span className="text-muted-foreground">{contest.oldRating}</span>
                <span className="text-muted-foreground mx-2">→</span>
                <span className="text-foreground font-bold">{contest.newRating}</span>
              </div>
              <div className="shrink-0 w-24 border-l border-neutral-600 text-center flex items-center justify-center">
                <span
                  className={`font-mono text-sm font-bold ${
                    delta > 0
                      ? "text-foreground"
                      : delta < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
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
              disabled={currentPage === totalPages}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-mono text-sm text-foreground hover:bg-secondary/30 transition-colors disabled:opacity-30 disabled:hover:bg-transparent border-l border-neutral-600"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="flex h-[15vh]">
          <div className="flex-1"></div>
          <div className="shrink-0 w-40 border-l border-neutral-600"></div>
          <div className="shrink-0 w-24 border-l border-neutral-600"></div>
        </div>
      </div>
    </div>
  );
}
