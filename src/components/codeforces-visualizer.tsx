"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/toggle";
import { ChartLineBar } from "./chart-bar-label";
import { CodeforcesUserCard } from "./AboutCard";
import ChartLineLinear from "./chart-line-linear";
import Link from "next/link";
import { useUsername } from "./contextProvider";
import {
  UserCardSkeleton,
  ChartSkeleton,
  SubmissionsSkeleton,
} from "./skeleton-components";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function CodeforcesVisualizerComponent() {
  interface UserInfo {
    handle: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
    contribution?: number;
    friendOfCount?: number;
    titlePhoto?: string;
  }

  interface Submissions {
    id: number;
    problem: {
      contestId: number;
      index: string;
      name: string;
      type: string;
      points?: number;
      rating?: number;
      tags: string[];
    };
    verdict: string;
    programmingLanguage: string;
  }

  interface Rating {
    contestName: string;
    rating: number;
  }

  interface RatingFrequency {
    question_rating: number;
    Questions: number;
  }

  interface UpcomingContest {
    name: string;
    durationSeconds: number;
    startTimeSeconds: number;
  }

  const { username, setUsername, Attempted, setAttempted } = useUsername();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submissions[] | null>(null);
  const [questions, setQuestions] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [mySet, setMySet] = useState(new Set<string>());
  const [LineGraphData, setLineGraphData] = useState<Rating[] | null>(null);
  const [barGraphData, setBarGraphData] = useState<RatingFrequency[] | null>(
    null
  );
  const [UpcomingContest, setUpcomingContest] = useState<
    UpcomingContest[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAPI();
  }, [username]);

  const fetchAPI = async () => {
    setIsLoading(true);
    try {
      const [
        userInfoResponse,
        allSubmissionsResponse,
        ratingResponse,
        contestResponse,
      ] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${username}`),
        fetch(
          `https://codeforces.com/api/user.status?handle=${username}&from=1&count=100000000`
        ),
        fetch(`https://codeforces.com/api/user.rating?handle=${username}`),
        fetch("https://codeforces.com/api/contest.list?"),
      ]);

      const [userInfoData, allSubmissionsData, allRating, upcomingContest] =
        await Promise.all([
          userInfoResponse.json(),
          allSubmissionsResponse.json(),
          ratingResponse.json(),
          contestResponse.json(),
        ]);

      // For Rating Graph
      let ratingArr: Rating[] = [];
      allRating.result.forEach(
        (element: { contestName: string; newRating: number }) => {
          let x = {
            contestName: element.contestName,
            rating: element.newRating,
          };
          ratingArr.push(x);
        }
      );

      // For Total Submissions and unique problems
      const uniqueProblems = new Set<string>();
      const ratingFreqMap = new Map<number, number>();

      allSubmissionsData.result.forEach((submission: Submissions) => {
        const problemKey = `${submission.problem.name}|${submission.problem.rating}`;
        if (submission.verdict === "OK" && !uniqueProblems.has(problemKey)) {
          uniqueProblems.add(problemKey);
          const problemRating = submission.problem.rating;
          if (problemRating) {
            ratingFreqMap.set(
              problemRating,
              (ratingFreqMap.get(problemRating) || 0) + 1
            );
          }
        }
      });
      setMySet(uniqueProblems);
      setTotalSolved(uniqueProblems.size);
      setAttempted(Array.from(uniqueProblems));
      
      // For Question frequency Graph
      const ratingFreq: RatingFrequency[] = Array.from(ratingFreqMap)
        .map(([rating, count]) => ({
          question_rating: rating,
          Questions: count,
        }))
        .sort((a, b) => a.question_rating - b.question_rating);

      setBarGraphData(ratingFreq);
      setLineGraphData(ratingArr);
      setUserInfo(userInfoData.result[0]);
      setSubmissions(allSubmissionsData.result.slice(0, 10));
      setQuestions(allSubmissionsData.result.length);
      setUpcomingContest(
        upcomingContest.result.filter(
          (contest: any) => contest.phase === "BEFORE"
        )
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const userData = {
    handle: userInfo?.handle || "USER",
    rating: userInfo?.rating,
    maxRating: userInfo?.maxRating,
    rank: userInfo?.rank,
    contribution: userInfo?.contribution,
    friendOfCount: userInfo?.friendOfCount,
    avatar: userInfo?.titlePhoto,
  };

  const problemStats = {
    total: questions,
    solved: totalSolved,
    attempted: mySet.size,
  };

  const recentSubmissions = submissions || [];
  const chartDatabar = barGraphData || [];
  const LineChartData = LineGraphData || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex sm:flex-row justify-between gap-4 ">
        <h1 className="text-3xl flex-1 font-bold">Codeforces Visualizer</h1>
        <div className="flex">
          <Input
            type="text"
            placeholder="Enter Codeforces username"
            className="rounded-l-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button className="rounded-r-lg" onClick={fetchAPI}>
            Search
          </Button>
        </div>
        <ModeToggle />
      </div>

      {isLoading ? (
        <UserCardSkeleton />
      ) : (
        <CodeforcesUserCard userInfo={userData} problemStats={problemStats} />
      )}

      <div className="flex justify-center w-full gap-4">
        <div className="w-1/2">
          {isLoading ? <ChartSkeleton /> : <ChartLineBar data={chartDatabar} />}
        </div>
        <div className="w-1/2">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ChartLineLinear data={LineChartData} />
          )}
        </div>
      </div>

      {isLoading ? (
        <SubmissionsSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentSubmissions.map((submission) => (
                <li
                  key={submission.id}
                  className="flex justify-between items-center"
                >
                  <span>{submission.problem.name}</span>
                  <div>
                    <Badge
                      variant={
                        submission.verdict === "OK" ? "default" : "destructive"
                      }
                    >
                      {submission.verdict}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {submission.programmingLanguage}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center space-x-4 ">
        <Link href="/problems">
          <Button className="rounded-md">Practice Problems</Button>
        </Link>
        <Link href="/rating_change">
          <Button className="rounded-md">Rating Changes</Button>
        </Link>
        <Link href="/submissions">
          <Button className="rounded-md">View All Submissions</Button>
        </Link>
      </div>
    </div>
  );
}
