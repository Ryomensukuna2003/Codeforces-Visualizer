"use client"
import { useEffect, useState } from "react"
import { UpcomingContest as UpcomingContestType } from "@/types/contests";
import Link from "next/link"
import { AlignRight } from "lucide-react"
import { useStore } from "./Providers/fetchAPI"
import ContestSheet from "./contest-sheet"

interface Contest {
  platform: string;
  event: string;
  name: string;
  start: Date;
  href: string;
  host?: string;
  id?: string;
}

interface CodeforcesContest {
  id: string;
  name: string;
  phase: string;
  startTimeSeconds: number;
}

export const Upcoming_Contest = ({
  upcomingContest,
}: {
  upcomingContest: UpcomingContestType[]
}) => {
  const { UpcomingContestData, codforcesContestData } = useStore() as {
    UpcomingContestData: { objects: Contest[] },
    codforcesContestData: { result: CodeforcesContest[] }
  };

  const [contests, setContests] = useState<Contest[]>([]);

  const parseContestData = () => {
    if (!UpcomingContestData?.objects) return;

    const contestSet = new Set<Contest>();
    const validHosts = ["codeforces.com", "codechef.com", "atcoder.jp"];

    UpcomingContestData.objects
      .filter((contest) => contest.host && validHosts.includes(contest.host))
      .forEach((contest) => {
        contestSet.add({
          platform: contest.host || "",
          event: contest.event,
          name: contest.event,
          start: new Date(contest.start),
          href: contest.href,
        });
      });

    const sortedContests = Array.from(contestSet).sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );

    setContests(sortedContests);
  };

  useEffect(() => {
    if (UpcomingContestData && codforcesContestData) {
      parseContestData();
    }
  }, [UpcomingContestData, codforcesContestData]);

  const isToday = (dateString: string | Date) => {
    const specificDate = new Date(dateString);
    const today = new Date();
    return (
      specificDate.getDate() === today.getDate() &&
      specificDate.getMonth() === today.getMonth() &&
      specificDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center px-6 h-14 border-b border-neutral-600">
        <span className="font-mono text-lg text-foreground">Upcoming Contests</span>
      </div>

      {/* Action row */}
      <div className="flex items-stretch border-b border-neutral-600">
        <Link
          href="/blogs"
          className="flex-1 flex items-center justify-center px-6 py-3 font-mono text-sm text-foreground hover:bg-secondary/30 transition-colors"
        >
          Codeforces Blogs
        </Link>
        <div className="flex-1 border-l border-neutral-600">
          <ContestSheet contests={contests} />
        </div>
      </div>

      {/* Contest list */}
      {contests.length > 0 ? (
        contests.slice(0, 6).map((contest, index) => {
          const isContestToday = isToday(contest.start);
          return (
            <Link
              key={contest.id || `${contest.platform}-${index}`}
              href={contest.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-stretch border-b border-neutral-600 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex-1 px-6 py-3 font-mono text-sm text-foreground truncate">
                {contest.name}
              </div>
              <div className="shrink-0 w-48 border-l border-neutral-600 flex items-center justify-center font-mono text-xs">
                <span className={isContestToday ? "text-red-500 font-bold" : "text-muted-foreground"}>
                  {isContestToday
                    ? "Today"
                    : new Date(contest.start).toLocaleString()}
                </span>
              </div>
            </Link>
          );
        })
      ) : (
        <div className="flex items-center justify-center py-8 border-b border-neutral-600 text-muted-foreground font-mono text-sm">
          No upcoming contests found.
        </div>
      )}
    </div>
  );
}
