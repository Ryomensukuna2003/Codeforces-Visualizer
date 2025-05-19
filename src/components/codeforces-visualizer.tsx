"use client";

import axios from "axios";
import ChartLineLinear from "./Line_Chart";
import RecentSubmissions from "./RecentSubmissions";
import SleepingCat from "./cat";
import Skeleton_Fragment from "./skeleton-components";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { ChartLineBar } from "./Bar_Chart";
import { CodeforcesUserCard } from "./AboutCard";
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store
import { ImprovementSuggestion } from "./ImprovementSuggestion";
import { Upcoming_Contest } from "./Upcoming_Contest";
import { HeatMapGraph } from "./ui/HeatMap";
import { useStore } from "./Providers/fetchAPI";
import { NavBar } from "./ui/NavBar";

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
  processSingleHeatMapData,
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
  const { username, setUsername, setAttempted, UsernamePopupisopen } =
    useUsernameStore() as unknown as {
      username: string;
      setUsername: (username: string) => void;
      Attempted: string[];
      setAttempted: (attempted: string[]) => void;
      UsernamePopupisopen: boolean;
    };
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [unratedUser, setUnratedUser] = useState<boolean>(false);
  const { toast } = useToast();
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
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Importing raw fetched data
  const {
    userInfoData,
    allSubmissionsData,
    allRating,
    contestData,
    fetchData,
  } = useStore() as unknown as {
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
    if (userInfoData === "Username is not Valid") {
      toast({
        variant: "destructive",
        title: "Username is not Valid",
        description: "Please enter a valid Codeforces username.",
      });
    }
    if (unratedUser) {
      toast({
        variant: "default",
        title: "User is Unrated",
        description: "Try giving some contests homie",
      });
    }
    if (
      userInfoData &&
      allSubmissionsData &&
      allRating &&
      contestData &&
      !unratedUser
    ) {
      parseData();
    }
  }, [userInfoData, allSubmissionsData, allRating, contestData]);

  const parseData = async () => {
    try {
      await handleSaveUsername();
      if (userInfo?.rating === undefined) {
        setUnratedUser(true);
        console.log(userInfo?.rating);
        console.log("User is unrated");
      }
      const uniqueProblems = new Set<string>();
      const ratingFreqMap = new Map<number, number>();
      let ratingArr: Rating[] = [];
      let ratingFreq: ProblemRatingDistribution[] = [];

      processSingleHeatMapData(allSubmissionsData);
      setcontestsParticipated(allRating.result.length);
      const heatMapData = processSingleHeatMapData(allSubmissionsData);
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

  useEffect(() => {
    if (userInfo?.rating === undefined) {
      console.log("helo");
      setUnratedUser(true);
    } else {
      console.log("rated");
    }
  }, [userInfo]);

  return (
    <div className="border-neutral-600 bg-card">
      <NavBar />

      <div className=" pt-0">
        {isloading && (
          <div className="relative">
            {!UsernamePopupisopen && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-lg z-10">
                <CompetitiveProgrammingQuotes />
              </div>
            )}
            <Skeleton_Fragment />
          </div>
        )}
        {!isloading && unratedUser && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-2xl font-bold text-center text-white">
              User is Unrated
            </h1>
            <p className="text-lg text-center text-muted-foreground">
              Please try again later.
            </p>
          </div>
        )}
        {!isloading && (
          <>
            <div className="relative">
              <div className="absolute left-15 right-5">
                <SleepingCat />
              </div>
              <div className="flex flex-col border-b border-neutral-600 md:flex-row">
                <CardContent className="flex-1 p-0 border-r border-neutral-600">
                  <CodeforcesUserCard
                    userInfo={userData}
                    problemStats={problemStats}
                  />
                </CardContent>
                <CardContent className="flex-1 p-0 ">
                  <Upcoming_Contest upcomingContest={upcomingContests || []} />
                </CardContent>
              </div>
            </div>

            <ImprovementSuggestion
              userData={userData}
              problemStats={problemStats}
            />

            {/* Graphs  */}
            <div className="flex flex-col border-y  border-neutral-600 md:flex-row">
              <CardContent className="flex-1 p-0 ">
                <ChartLineBar data={barGraphData} />
              </CardContent>
              <CardContent className="flex-1 p-0">
                <ChartLineLinear data={LineGraphData} />
              </CardContent>
            </div>

            <HeatMapGraph data={HeatMap} />

            <RecentSubmissions submissions={submissions || []} />
          </>
        )}
      </div>
    </div>
  );
}
