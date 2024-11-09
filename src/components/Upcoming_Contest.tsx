"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { UpcomingContest as UpcomingContestType } from "@/app/types";
import Link from "next/link";

export const Upcoming_Contest = ({
  upcomingContest,
}: {
  upcomingContest: UpcomingContestType[];
}) => {
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  console.log("Upcoming Contest -> ",upcomingContest);
  upcomingContest.map((contest)=>{
    if(contest.phase==="BEFORE"){
      console.log(contest.name+" "+contest.startTimeSeconds);
    }
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Contests</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingContest && upcomingContest.length > 0 ? (
          <ul className="space-y-2">
            {upcomingContest.map((contest) => {
              const contestDate = new Date(contest.startTimeSeconds * 1000);
              const isContestToday = isToday(contestDate);

              return (
                <li
                  key={contest.id}
                  className="flex justify-between items-center"
                >
                  <Link
                    href={`https://codeforces.com/contest/${contest.id}`}
                    className="space-x-2"
                  >
                    <span>{contest.name}</span>
                  </Link>
                    <Badge className={isContestToday ? "bg-red-500" : ""}>
                      {isContestToday
                        ? "Today"
                        : contestDate.toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                          })}
                    </Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No upcoming contests found.</p>
        )}
      </CardContent>
    </Card>
  );
};
