"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
import { ChartLineBar } from "./Bar_Chart";
import { CodeforcesUserCard } from "./AboutCard";
import ChartLineLinear from "./Line_Chart";
import Link from "next/link";
import { useUsername } from "./Providers/contextProvider";
import { ImprovementSuggestion } from "./ImprovementSuggestion";
import SleepingCat from "./cat";
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
    maxRank?: string;
    contribution?: number;
    friendOfCount?: number;
    lastOnlineTimeSeconds: number;
    registrationTimeSeconds: number;
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

  interface ProblemRatingDistribution {
    rating: number;
    count: number;
  }

  interface UpcomingContest {
    id: number;
    name: string;
    type: string;
    phase: string;
    durationSeconds: number;
    startTimeSeconds: number;
  }

  interface TagStatistics {
    tag: string;
    count: number;
  }

  const { username, setUsername, setAttempted } = useUsername();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submissions[] | null>(null);
  const [questions, setquestions] = useState(0);
  const [total_Solved, setTotalSolved] = useState(0);
  const [mySet, setMySet] = useState(new Set<string>());
  const [LineGraphData, setLineGraphData] = useState<Rating[]>([]);
  const [barGraphData, setBarGraphData] = useState<ProblemRatingDistribution[]>(
    []
  );
  const [upcomingContests, setUpcomingContests] = useState<
    UpcomingContest[] | null
  >(null);
  const [contestsParticipated, setcontestsParticipated] = useState<number>(0);
  const [bestRank, setbestRank] = useState<number>(Number.MAX_SAFE_INTEGER);
  const [worstRank, setworstRank] = useState<number>(0);
  const [averageRatingChange, setaverageRatingChange] = useState<number>(0);
  const [bestRatingChange, setbestRatingChange] = useState<number>(0);
  const [worstRatingChange, setworstRatingChange] = useState<number>(0);
  const [TotalAcceptedProblems, setTotalAcceptedProblems] = useState<number>(0);
  const [averageAcceptedProblemRating, setaverageAcceptedProblemRating] =
    useState<number>(0);
  const [TagStatistics, setTagStatistics] = useState<TagStatistics[]>([]);

  useEffect(() => {
    fetchAPI();
  }, [username]);

  // For logging data
  // useEffect(() => {
  //   console.log(contestsParticipated);
  // },[contestsParticipated])

  const fetchAPI = async () => {
    try {
      const [userInfoData, allSubmissionsData, allRating, contestData] =
        await Promise.all([
          axios
            .get(`https://codeforces.com/api/user.info?handles=${username}`)
            .then((response) => response.data),
          axios
            .get(
              `https://codeforces.com/api/user.status?handle=${username}&from=1`
            )
            .then((response) => response.data),
          axios
            .get(`https://codeforces.com/api/user.rating?handle=${username}`)
            .then((response) => response.data),
          axios
            .get("https://codeforces.com/api/contest.list?gym=false")
            .then((response) => response.data),
        ]);

      const uniqueProblems = new Set<string>();
      const ratingFreqMap = new Map<number, number>();
      let ratingArr: Rating[] = [];
      let ratingFreq: ProblemRatingDistribution[] = [];
      setcontestsParticipated(allRating.result.length);
      let totalRatingChange = 0; // Initialize total rating change
      // for userData
      allRating.result.forEach(
        (element: { rank: number; oldRating: number; newRating: number }) => {
          if (element.rank) {
            const ratingChange = element.newRating - element.oldRating;
            totalRatingChange += ratingChange; // Accumulate rating change
            setbestRatingChange((prev) => Math.max(prev, ratingChange));
            setworstRatingChange((prev) => Math.min(prev, ratingChange));
            setbestRank((prev) => Math.min(prev, element.rank));
            setworstRank((prev) => Math.max(prev, element.rank));
          }
        }
      );
      setaverageRatingChange(totalRatingChange / allRating.result.length); // Calculate average rating change

      barGraphData?.forEach((element) => {
        setaverageAcceptedProblemRating((prev) => prev + element.rating);
      });
      setaverageAcceptedProblemRating((prev) => prev / TotalAcceptedProblems);

      // for userData
      let x: string[] = [];
      allSubmissionsData.result.forEach((submission: Submissions) => {
        if (submission.verdict === "OK") {
          submission.problem.tags.forEach((tag) => {
            x.push(tag);
          });
        }
      });
      x.sort();
      let count = 1;
      for (let i = 1; i < x.length; i++) {
        if (x[i] === x[i - 1]) {
          count++;
        } else {
          setTagStatistics((prev) => [
            ...prev,
            { tag: x[i - 1], count: count },
          ]);
          count = 1;
        }
      }

      allSubmissionsData.result.forEach((submission: Submissions) => {
        const problemKey = `${submission.problem.name}|${submission.problem.rating}`;
        if (submission.verdict === "OK" && !uniqueProblems.has(problemKey)) {
          setTotalAcceptedProblems((prev) => prev + 1);
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

      // For Rating Graph
      allRating.result.forEach(
        (element: { contestName: string; newRating: number }) => {
          let x = {
            contestName: element.contestName,
            rating: element.newRating,
          };
          ratingArr.push(x);
        }
      );

      // For Question solved frequency Graph
      ratingFreqMap.forEach((count, rating) => {
        let x = {
          rating: rating,
          count: count,
        };
        ratingFreq.push(x);
      });
      ratingFreq.sort((a, b) => a.rating - b.rating);

      // For Upcoming Contests
      const now = Math.floor(Date.now() / 1000);
      const upcomingContests = contestData.result
        .filter(
          (contest: UpcomingContest) =>
            contest.phase === "BEFORE" && contest.startTimeSeconds > now
        )
        .sort(
          (a: UpcomingContest, b: UpcomingContest) =>
            a.startTimeSeconds - b.startTimeSeconds
        )
        .slice(0, 5);

      setMySet(uniqueProblems);
      setTotalSolved(uniqueProblems.size);
      setAttempted(Array.from(uniqueProblems));
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
    rating: userInfo?.rating ?? 0,
    maxRating: userInfo?.maxRating ?? 0,
    rank: userInfo?.rank ?? "unranked",
    maxRank: userInfo?.maxRank ?? "unranked",
    contribution: userInfo?.contribution ?? 0,
    friendOfCount: userInfo?.friendOfCount ?? 0,
    lastOnlineTimeSeconds: userInfo?.lastOnlineTimeSeconds ?? 0,
    registrationTimeSeconds: userInfo?.registrationTimeSeconds ?? 0,
    avatar: userInfo?.titlePhoto,
    problemRatingDistribution: barGraphData,
    contestsParticipated: contestsParticipated,
    bestRank: bestRank,
    worstRank: worstRank,
    topSolvedTags: TagStatistics,

    recentContests: contestsParticipated,
    averageRatingChange: averageRatingChange,
    bestRatingChange: bestRatingChange,
    worstRatingChange: worstRatingChange,

    totalAcceptedProblems: TotalAcceptedProblems,
    averageAcceptedProblemRating: averageAcceptedProblemRating,
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
      {/* Nav Bar  */}
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

      <div className="relative">
        <div className="absolute  left-15 right-5  ">
          <SleepingCat />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Card  */}
          <CodeforcesUserCard userInfo={userData} problemStats={problemStats} />
          <Card>
            {/* Upcoming Contest  */}
            <CardHeader>
              <CardTitle>Upcoming Contests</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingContests && upcomingContests.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingContests.map((contest) => (
                    <li
                      key={contest.id}
                      className="flex justify-between items-center"
                    >
                      <Link
                        href={`https://codeforces.com/contest/${contest.id}`}
                      >
                        <span>{contest.name}</span>
                      </Link>
                      <Badge>
                        {new Date(
                          contest.startTimeSeconds * 1000
                        ).toLocaleString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        })}
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
      </div>

      <ImprovementSuggestion userData={userData} problemStats={problemStats} />

      {/* Graphs  */}
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

      {/* Recent Submissions  */}
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
