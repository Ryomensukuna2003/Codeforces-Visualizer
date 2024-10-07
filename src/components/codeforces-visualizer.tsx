"use client";

import { useState, useEffect } from "react";
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
import { ImprovementSuggestion } from "./ImprovementSuggestion";
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
    id: number;
    name: string;
    type: string;
    phase: string;
    durationSeconds: number;
    startTimeSeconds: number;
  }

  const { username, setUsername, Attempted, setAttempted } = useUsername();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submissions[] | null>(null);
  const [questions, setquestions] = useState(0);
  const [total_Solved, setTotalSolved] = useState(0);
  const [mySet, setMySet] = useState(new Set<string>());
  const [LineGraphData, setLineGraphData] = useState<Rating[] | null>(null);
  const [barGraphData, setBarGraphData] = useState<RatingFrequency[] | null>(
    null
  );
  const [upcomingContests, setUpcomingContests] = useState<UpcomingContest[] | null>(
    null
  );

  useEffect(() => {
    fetchAPI();
  }, [username]);

  useEffect(() => {
    console.log("Attempted Array -> ", Attempted);
  }, [Attempted]);

  const fetchAPI = async () => {
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
        fetch("https://codeforces.com/api/contest.list?gym=false"),
      ]);

      const [userInfoData, allSubmissionsData, allRating, contestData] =
        await Promise.all([
          userInfoResponse.json(),
          allSubmissionsResponse.json(),
          ratingResponse.json(),
          contestResponse.json(),
        ]);

      // For Total solved and unique problems
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

      // For Question frequency Graph
      let ratingFreq: RatingFrequency[] = [];
      ratingFreqMap.forEach((count, rating) => {
        let x = {
          question_rating: rating,
          Questions: count,
        };
        ratingFreq.push(x);
      });
      ratingFreq.sort((a, b) => a.question_rating - b.question_rating);

      // For Upcoming Contests
      const now = Math.floor(Date.now() / 1000);
      const upcomingContests = contestData.result
        .filter((contest: UpcomingContest) => contest.phase === "BEFORE" && contest.startTimeSeconds > now)
        .sort((a: UpcomingContest, b: UpcomingContest) => a.startTimeSeconds - b.startTimeSeconds)
        .slice(0, 5);

      console.log("Rating frequency -> ", ratingFreq);
      setBarGraphData(ratingFreq);
      setLineGraphData(ratingArr);
      setUserInfo(userInfoData.result[0]);
      setSubmissions(allSubmissionsData.result.slice(0, 10));
      setquestions(allSubmissionsData.result.length);
      setUpcomingContests(upcomingContests);
    } catch (error) {
      console.error("Error fetching data:", error);
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
    ratingFreq: barGraphData,
  };

  const problemStats = {
    total: questions,
    solved: total_Solved,
    attempted: mySet.size,
  };

  const recentSubmissions = submissions || [];
  const chartDatabar = barGraphData || [];
  const LineChartData = LineGraphData || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex sm:flex-row justify-between gap-4 ">
        <h1 className="text-3xl flex-1 font-semibold">Codeforces Visualizer</h1>
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

      <div className="grid md:grid-cols-2 gap-6">
        <CodeforcesUserCard userInfo={userData} problemStats={problemStats} />
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Contests</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingContests && upcomingContests.length > 0 ? (
              <ul className="space-y-2">
                {upcomingContests.map((contest) => (
                  <li key={contest.id} className="flex justify-between items-center">
                    <Link href={`https://codeforces.com/contest/${contest.id}`}>
                      <span>{contest.name}</span>
                    </Link>
                    <Badge>
                      {new Date(contest.startTimeSeconds * 1000).toLocaleString([], { hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'numeric', day: 'numeric' })}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No upcoming contests found.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <ImprovementSuggestion userData={userData} problemStats={problemStats} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Problem Ratings Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartLineBar data={chartDatabar} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rating History</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartLineLinear data={LineChartData} />
          </CardContent>
        </Card>
      </div>

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
      <div className="flex justify-center space-x-4 ">
        <Link href="/problems">
          <Button className="rounded-md">View All Problems</Button>
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