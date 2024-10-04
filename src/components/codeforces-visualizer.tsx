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

  interface UpcomingContest{
    name:string,
    durationSeconds:number,
    startTimeSeconds:number
  }

  const [username, setUsername] = useState("_Ryomen_sukuna");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submissions[] | null>(null);
  const [questions, setquestions] = useState(0);
  const [total_Solved, setTotalSolved] = useState(0);
  const [mySet, setMySet] = useState(new Set());
  const [LineGraphData, setLineGraphData] = useState<Rating[] | null>(null);
  const [barGraphData, setBarGraphData] = useState<RatingFrequency[] | null>(null);
  const [UpcomingContest,setUpcomingContest]=useState<UpcomingContest[]|null>(null);

  useEffect(() => {
    fetchAPI();
  }, [username]);

  const fetchAPI = async () => {
    try {
      const [userInfo, allSubmissions, rating,contest] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${username}`),
        fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`),
        fetch(`https://codeforces.com/api/user.rating?handle=${username}`),
        fetch('https://codeforces.com/api/contest.list?'),
      ]);
      

      const [userInfoData, allSubmissionsData, allRating, upcomingContest] = await Promise.all([
        userInfo.json(),
        allSubmissions.json(),
        rating.json(),
        contest.json(),
      ]);

      // For Total solved
      const totalSolved = allSubmissionsData.result.filter(
        (element: { verdict: string }) => element.verdict === "OK"
      ).length;

      // For Total Submissions
      allSubmissionsData.result.forEach((element: { problem: any }) => {
        setMySet((prevSet) => new Set(prevSet).add(element.problem.name));
      });

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
      let ratingFreqmap = new Map<number, number>();
      allSubmissionsData.result.forEach(
        (element: { verdict: string; problem: any }) => {
          if (element.verdict === "OK") {
            const problemRating = element.problem.rating;
            ratingFreqmap.set(
              problemRating,
              (ratingFreqmap.get(problemRating) || 0) + 1
            );
          }
        }
      );
      ratingFreqmap.forEach((count, rating) => {
        let x = {
          question_rating: rating,
          Questions: count,
        };
        ratingFreq.push(x);
      });
      ratingFreq.sort((a, b) => a.question_rating - b.question_rating);
      setBarGraphData(ratingFreq);
      console.log(ratingFreq);
      setLineGraphData(ratingArr);
      setTotalSolved(totalSolved);
      setUserInfo(userInfoData.result[0]);
      setSubmissions(allSubmissionsData.result.slice(0, 10));
      setquestions(allSubmissionsData.result.length);
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
      <div className="flex sm:flex-row justify-between  gap-4">
        <h1 className="text-3xl font-bold">Codeforces Visualizer</h1>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Enter Codeforces username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={fetchAPI}>Search</Button>
        </div>
        <ModeToggle />
      </div>

      <CodeforcesUserCard userInfo={userData} problemStats={problemStats} />

      <div className="flex justify-center w-full gap-4">
        <div className="w-1/2">
          <ChartLineBar data={chartDatabar} />
        </div>
        <div className="w-1/2">
          <ChartLineLinear data={LineChartData} />
        </div>
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
    </div>
  );
}
