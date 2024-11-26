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
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/toggle";
import { ChartLineBar } from "./Bar_Chart";
import { CodeforcesUserCard } from "./AboutCard";
import ChartLineLinear from "./Line_Chart";
import Link from "next/link";
import { useUsername } from "./Providers/contextProvider";
import { ImprovementSuggestion } from "./ImprovementSuggestion";
import RecentSubmissions from "./RecentSubmissions";
import { Upcoming_Contest } from "./Upcoming_Contest";
import { HeatMapGraph } from "./ui/HeatMap";
import SleepingCat from "./cat";
import {
  UserInfo,
  Submissions,
  Rating,
  ProblemRatingDistribution,
  UpcomingContest,
  TagStatistics,
} from "../app/types";
import {
  processRatings,
  processBarGraphData,
  processSubmissions,
  processRatingGraph,
  processRatingFreqGraph,
  getUpcomingContests,
  processHeatMapData,
} from "../lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function CodeforcesVisualizerComponent() {
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
  const [HeatMap, setHeatMap] = useState<{ date: string; desktop: number }[]>([]);

  useEffect(() => {
    fetchAPI();
    console.log("UserName-> ", username);
  }, [username]);

  useEffect(() => {
    console.log("HeatMap-> ", HeatMap);
  }
  , [HeatMap]);

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
      
      processHeatMapData(allSubmissionsData);
      setcontestsParticipated(allRating.result.length);
      const heatMapData = processHeatMapData(allSubmissionsData);
      setHeatMap(heatMapData);
      // for userData
      processRatings(
        allRating,
        setbestRatingChange,
        setworstRatingChange,
        setbestRank,
        setworstRank,
        setaverageRatingChange
      );
      processBarGraphData(
        barGraphData,
        setaverageAcceptedProblemRating,
        TotalAcceptedProblems
      );
      processSubmissions(
        allSubmissionsData,
        setTagStatistics,
        setTotalAcceptedProblems,
        uniqueProblems,
        ratingFreqMap
      );
      processRatingGraph(allRating, ratingArr);
      processRatingFreqGraph(ratingFreqMap, ratingFreq);

      const now = Math.floor(Date.now() / 1000);
      const upcomingContests = getUpcomingContests(contestData, now);

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
          <Upcoming_Contest upcomingContest={upcomingContests || []} />
        </div>
      </div>
      {/* Improvement Suggestion  */}
      <ImprovementSuggestion userData={userData} problemStats={problemStats} />

      {/* Graphs  */}
      <div className="flex gap-4 ">
        <CardContent className="flex-1 p-0 ">
          <ChartLineBar data={barGraphData} />
        </CardContent>
        <CardContent className="flex-1 p-0">
          <ChartLineLinear data={LineGraphData} />
        </CardContent>
      </div>
        <HeatMapGraph data={HeatMap} />

      {/* Recent Submissions  */}
      <RecentSubmissions submissions={submissions || []} />
      {/* Buttons  */}
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
