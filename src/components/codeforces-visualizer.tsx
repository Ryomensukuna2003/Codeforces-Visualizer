"use client";

import axios from "axios";
import Link from "next/link";
import ChartLineLinear from "./Line_Chart";
import RecentSubmissions from "./RecentSubmissions";
import SleepingCat from "./cat";
import Skeleton_Fragment from "./skeleton-components"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/toggle";
import { ChartLineBar } from "./Bar_Chart";
import { CodeforcesUserCard } from "./AboutCard";
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store
import { ImprovementSuggestion } from "./ImprovementSuggestion";
import { Upcoming_Contest } from "./Upcoming_Contest";
import { HeatMapGraph } from "./ui/HeatMap";
import { useStore } from "./Providers/fetchAPI";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
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
import { CompetitiveProgrammingQuotes } from "./CP-Quotes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export function CodeforcesVisualizerComponent() {

  const { username, setUsername, setAttempted, UsernamePopupisopen } = useUsernameStore() as {
    username: string;
    setUsername: (username: string) => void;
    Attempted: string[];
    setAttempted: (attempted: string[]) => void;
    UsernamePopupisopen: boolean;
  };
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { toast } = useToast()
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
  const [HeatMap, setHeatMap] = useState<{ date: string; desktop: number }[]>(
    []
  );
  const [isWideScreen, setIsWideScreen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 768);
    };

    // Set initial value and add event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Importing raw fetched data
  const { userInfoData, allSubmissionsData, allRating, contestData, fetchData } = useStore() as {
    userInfoData: any;
    allSubmissionsData: any;
    allRating: any;
    contestData: any;
    fetchData: (username: string) => void;
  };


  const [isloading, setisloading] = useState(true);

  // Save username to the database
  const handleSaveUsername = async () => {
    try {
      await axios.post("/api/user", { username });
    } catch (error) {
      console.error("Failed to save username:", error);
    }
  };

  // If API data is changed, parse the data
  useEffect(() => {
    if (userInfoData === 'Username is not Valid') {
      toast({
        variant: "destructive",
        title: "Username is not Valid",
        description: "Please enter a valid Codeforces username.",
      })
    }
    if (userInfoData && allSubmissionsData && allRating && contestData) {
      parseData();
    }
  }, [userInfoData, allSubmissionsData, allRating, contestData])


  const parseData = async () => {
    try {
      await handleSaveUsername();
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
      setUserInfo(userInfoData.result[0]); // ---------------------------------------------------------------------------------------
      setSubmissions(allSubmissionsData.result.slice(0, 10));
      setquestions(allSubmissionsData.result.length);
      setUpcomingContests(upcomingContests);
      setisloading(false);
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
    <div>
      {/* Nav Bar  */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg px-6 pt-4 pb-4 flex gap-2 ">
        <h1 className="text-xl flex-1 font-semibold sm:text-3xl">Codeforces Visualizer</h1>
        <div className="flex sm:flex-row">
          {isWideScreen && (
            <>
              <Input
                type="text"
                placeholder="Enter Codeforces username"
                className="rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button
                className="rounded-b-lg sm:rounded-r-lg sm:rounded-b-none"
                onClick={() => fetchData(username)}
              >
                Search
              </Button>
            </>
          )}
        </div>
        <ModeToggle />
      </div>

      <div className="mx-2 p-4 pt-0 space-y-6">
        {isloading && (
          <div className="relative">
            {!UsernamePopupisopen && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-lg z-10">
                <CompetitiveProgrammingQuotes />
              </div>
            )
            }
            <Skeleton_Fragment />
          </div>
        )}
        {!isloading && (
          <>
            <div className="relative">
              <div className="absolute  left-15 right-5   ">
                <SleepingCat />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Card  */}
                <CodeforcesUserCard userInfo={userData} problemStats={problemStats} />
                <Upcoming_Contest upcomingContest={upcomingContests || []} />
              </div>
            </div>
            {/* Improvement Suggestion  */}
            <ImprovementSuggestion userData={userData} problemStats={problemStats} />

            {/* Graphs  */}
            <div className="flex flex-col md:flex-row gap-4">
              <CardContent className="flex-1 p-0">
                <ChartLineBar data={barGraphData} />
              </CardContent>
              <CardContent className="flex-1 p-0">
                <ChartLineLinear data={LineGraphData} />
              </CardContent>
            </div>
            <div className="mt-4">
              <HeatMapGraph data={HeatMap} />
            </div>
            <RecentSubmissions submissions={submissions || []} />
            {/* Buttons  */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/problems">
                <Button className="rounded-md w-full sm:w-auto">View All Problems</Button>
              </Link>
              <Link href="/rating_change">
                <Button className="rounded-md w-full sm:w-auto">Rating Changes</Button>
              </Link>
              <Link href="/submissions">
                <Button className="rounded-md w-full sm:w-auto">View All Submissions</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
