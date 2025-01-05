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
import { AnimatePresence, motion } from 'framer-motion';
import { ImprovementSuggestion } from "./ImprovementSuggestion";
import { Upcoming_Contest } from "./Upcoming_Contest";
import { HeatMapGraph } from "./ui/HeatMap";
import { useStore } from "./Providers/fetchAPI";
import { Menu, X, Search, Github, Linkedin } from 'lucide-react';

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

  const { username, setUsername, setAttempted, UsernamePopupisopen } = useUsernameStore() as unknown as {
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
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Importing raw fetched data
  const { userInfoData, allSubmissionsData, allRating, contestData, fetchData } = useStore() as unknown as {
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


  return (
    <div className="border-neutral-600">
      <nav className="sticky w-full top-0 z-50 bg-white dark:bg-black border-b border-neutral-600 ">
        <div className="flex justify-between items-center h-20">
          {/* Left section */}
          <div className="flex items-center">
            <Extra />
            <div className="h-20 border-l border-neutral-600  flex items-center">
              <h1 className="text1 text-3xl justify-content-center p-6 border-r border-neutral-600">
                CF Stats
                <span className="span1 w-full justify-center text-center">CF Stats</span>
              </h1>
            </div>
          </div>

          {/* Right section */}
          {isWideScreen && (
            <div className="flex items-center ">
              <div className="flex h-20">
                <Input
                  type="text"
                  placeholder="Enter Codeforces username"
                  className="h-20 text-center rounded-none border-neutral-600  focus-visible:ring-0 focus-visible:ring-offset-0 border-0 border-l hover:border-b-4"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <Button
                  className="w-auto h-auto rounded-none border-neutral-600 bg-black text-white hover:bg-neutral-600 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border-0 border-l"
                  onClick={() => fetchData(username)}
                >
                  {/* idl */}
                  <Search className="h-auto w-auto m-2 p-2" />
                </Button>
              </div>
              <ModeToggle className="h-20 w-20 rounded-none border-0 border-l border-neutral-600 " />
            </div>
          )}
        </div>
      </nav>

      <div className=" pt-0">
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
              <div className="absolute left-15 right-5">
                <SleepingCat />
              </div>
              <div className="flex flex-col border-b border-neutral-600 md:flex-row">
                <CardContent className="flex-1 p-0 border-r border-neutral-600">
                  <CodeforcesUserCard userInfo={userData} problemStats={problemStats} />
                </CardContent>
                <CardContent className="flex-1 p-0 ">
                  <Upcoming_Contest upcomingContest={upcomingContests || []} />
                </CardContent>

              </div>
            </div>

            <ImprovementSuggestion userData={userData} problemStats={problemStats} />

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






const Extra = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { username } = useUsernameStore() as unknown as {
    username: string;
  };

  const panelVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'tween',
        duration: 0.5,
        ease: [0, 0, 0.2, 1] // Ease-out
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.5,
        ease: [0.4, 0, 1, 1] // Ease-in
      }
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        className="p-0 h-20 w-20 rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-600 border-neutral-600"
        onClick={togglePanel}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Video Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            className="fixed top-0 left-0 w-full h-full bg-background z-50" // Use global variable for background
          >
            <div className="relative h-full">
              <nav className="sticky w-full top-0 z-50 bg-background border-b border-neutral-600">
                <div className="flex justify-between items-center h-20">
                  {/* Left section */}
                  <div className="flex items-center">
                    <Button
                      className="p-0 h-20 w-20 rounded-none border-neutral-600"
                      onClick={togglePanel}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                    <div className="h-20 border-l border-neutral-600 flex items-center">
                      <h1 className="text1 text-3xl justify-content-center p-6 border-r border-neutral-600">
                        CF Stats
                        <span className="span1 w-full justify-center text-center">CF Stats</span>
                      </h1>
                    </div>
                  </div>
                  {/* Right section */}
                  <div className="flex items-center">
                    <ModeToggle className="h-20 w-20 rounded-none border-0 border-l border-neutral-600" />
                  </div>
                </div>
              </nav>

              {/* Content Container */}
              <div className="mx-[10%] border-x border-neutral-600">
                <div className="w-full flex-row  md:flex-row justify-center items-center text-center">

                  <div className="flex h-[20vh]">
                    <div className="flex-1 border-r border-neutral-600"></div>
                    <div className="flex-1 border-r border-neutral-600"></div>
                    <div className="flex-1 h-full flex flex-col">
                      <div className="flex-1 border-b border-neutral-600 flex items-center justify-center"></div>
                      <div className="flex-1 flex items-center justify-center text-3xl">[ {username} ]</div>
                    </div>
                  </div>

                  <Link href="/compare" className="w-full text-xl md:w-1/3 md:text-5xl border-b">
                    <h1 className=" text1 justify-content-center py-10 border-y  border-neutral-600">
                      Compare ID's
                      <span className="span1">Compare ID's</span>
                    </h1>
                  </Link>
                  <Link href="/problems" className="w-full text-xl md:w-1/3 md:text-5xl border-b">
                    <h1 className=" text1 justify-content-center py-10 border-b  border-neutral-600">
                      View All Problems
                      <span className="span1">View All Problems</span>
                    </h1>
                  </Link>
                  <Link href="/rating_change" className="w-full text-xl md:w-1/3 md:text-5xl border-b">
                    <h1 className=" text1 py-10 border-b border-neutral-600">
                      Rating Changes
                      <span className="span1">Rating Changes</span>
                    </h1>
                  </Link>
                  <Link href="/submissions" className="w-full text-xl  md:w-1/3 md:text-5xl">
                    <h1 className=" text1 py-10 border-b  border-neutral-600">
                      View All Submissions
                      <span className="span1">View All Submissions</span>
                    </h1>
                  </Link>
                </div>

                <div className="flex border-b justify-center items-center border-neutral-600">
                  <a
                    href="https://github.com/ryomensukuna2003"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex-1 flex justify-center items-center text-3xl p-8 border-r border-neutral-600 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold relative
        transition-all duration-100 ease-out overflow-hidden
        hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_hsl(var(--card))]"
                  >
                    Github
                    <Github className="ml-4" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/shivanshu-/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex-1 flex justify-center items-center border-neutral-600 text-3xl p-8 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold relative
        transition-all duration-100 ease-out overflow-hidden
        hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_hsl(var(--card))]"
                  >
                    Linkedin
                    <Linkedin className="ml-4" />
                  </a>
                </div>


                <div className="flex h-[20vh]">
                  <div className="flex-1 border-r border-neutral-600"></div>
                  <div className="flex-1 border-r border-neutral-600"></div>
                  <div className="flex-1 border-r border-neutral-600"></div>
                  <div className="flex-1 "></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



export default { Extra };