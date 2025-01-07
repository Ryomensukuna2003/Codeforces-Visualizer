"use client";
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {  ArrowRightLeft } from 'lucide-react'

import { NavBar } from '@/components/ui/NavBar';
import { FetchUserData, CompareRatingFrequencies, CompareHeatMapData, CompareRatingChange } from '@/lib/utils';
import { ParseData } from '@/lib/ParseData';
import { MultipleBarChart } from '@/components/MulitpleBarChart';
import { MultipleLineChart } from '@/components/MultipleLineChart';
import { SubmissionHeatmap } from '@/components/MultipleHeatMap/submission-heatmap';



export default function EnhancedUserComparison() {
  const [user1, setUser1] = useState<any | null>(null);
  const [user2, setUser2] = useState<any | null>(null);

  const [UserData1, setUserData1] = useState<any | null>(null);
  const [UserData2, setUserData2] = useState<any | null>(null);
  const [BarGraphData, setBarGraphData] = useState<any | null>(null);
  const [HeatMapData, setHeatMapData] = useState<any | null>(null);
  const [LineGraphData, setLineGraphData] = useState<any | null>(null);


  const compareUsers = async () => {
    if (user1 !== "" && user2 !== "") {
      const { userInfoData: userInfoData1, allSubmissionsData: allSubmissionsData1, allRating: allRating1 } = await FetchUserData(user1);
      const { userInfoData: userInfoData2, allSubmissionsData: allSubmissionsData2, allRating: allRating2 } = await FetchUserData(user2);

      setUserData1(ParseData(userInfoData1, allSubmissionsData1, allRating1, user1));
      setUserData2(ParseData(userInfoData2, allSubmissionsData2, allRating2, user2));
    }
    else {
      console.log("Set both users");
    }
  }

  useEffect(() => {
    // Grouping both users rating frequency
    if (UserData1?.RatingFrequency && UserData2?.RatingFrequency) {
      const graphData = CompareRatingFrequencies(
        UserData1?.RatingFrequency,
        UserData2?.RatingFrequency,
        user1,
        user2
      );
      setBarGraphData(graphData);
    }

    // Grouping HeatMap Data
    if (UserData1?.HeatMapData && UserData2?.HeatMapData) {
      const HeatMapData = CompareHeatMapData(UserData1?.HeatMapData, UserData2?.HeatMapData, user1, user2);
      setHeatMapData(HeatMapData);
    }

    // Grouping Rating Change Data
    if (UserData1?.RatingChangeData && UserData2?.RatingChangeData) {
      const RatingChange = CompareRatingChange(UserData1?.RatingChangeData, UserData2?.RatingChangeData, user1, user2);
      setLineGraphData(RatingChange);
      console.log("RatingChange Data-> " + LineGraphData)
    }
  }, [UserData1, UserData2]);


  const getRankColor = (rank: string) => {
    const rankColors: { [key: string]: string } = {
      "newbie": "#808080",
      pupil: "#008000",
      specialist: "#04A89E",
      expert: "#0000FF",
      "candidate master": "#AB00AA",
      master: "#FF8C00",
      "international master": "#FF8C00",
      grandmaster: "#FF0000",
      "international grandmaster": "#FF0000",
      "legendary grandmaster": "#FF0000",
      tourist: "#FF0000",
    };
    return rankColors[rank.toLowerCase()] || "#808080";
  };

  return (
    <div>
      <NavBar />

      {/* Content Starts Here */}
      <div className="flex-row w-full">
        <Card className="w-full px-6 py-6 border-0 border-b border-neutral-600">
          <CardHeader>
            <CardTitle>Compare Codeforces Users</CardTitle>
            <CardDescription>Enter two Codeforces IDs to compare their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="user1" className="block text-sm font-medium text-gray-700 mb-1">
                  User 1
                </label>
                <Input
                  id="user1"
                  placeholder="Enter Codeforces ID"
                  value={user1}
                  onChange={(e) => setUser1(e.target.value)}
                />
              </div>
              <ArrowRightLeft className="hidden sm:block" />
              <div className="flex-1">
                <label htmlFor="user2" className="block text-sm font-medium text-gray-700 mb-1">
                  User 2
                </label>
                <Input
                  id="user2"
                  placeholder="Enter Codeforces ID"
                  value={user2}
                  onChange={(e) => setUser2(e.target.value)}
                />
              </div>
              <Button onClick={compareUsers}>Compare</Button>
            </div>
          </CardContent>
        </Card>


        {user1 && user2 && (
          <div>
            <div className="grid md:grid-cols-2 border-none">
              {[UserData1, UserData2].map((user, index) => (
                <Card key={user?.handle || index} className="overflow-hidden border-0 border-b border-l border-neutral-600">
                  <CardHeader className="bg-card">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage
                          src={user?.avatar}
                          alt={user?.handle}
                          className="object-cover h-full w-full"
                        />
                        <AvatarFallback>{user?.handle[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{user?.handle}</CardTitle>
                        <CardDescription className={`text-lg font-semibold `} style={{ color: getRankColor(user?.rank || "") }}>
                          {user?.rank}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{user?.rating}</div>
                        <div className="text-sm text-gray-500">Current Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{user?.maxRating}</div>
                        <div className="text-sm text-gray-500">Max Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{user?.problemSolved}</div>
                        <div className="text-sm text-gray-500">Problems Solved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{user?.contestsParticipated}</div>
                        <div className="text-sm text-gray-500">Contests</div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
            <SubmissionHeatmap data={HeatMapData} id1={user1} id2={user2} />
            <div className='flex'>
              <div className='flex-1'>
                {BarGraphData ? (
                  <MultipleBarChart chartData={BarGraphData} user1={user1} user2={user2} />
                ) : (
                  <p className="text-center mt-6">Loading chart data...</p>
                )}
              </div>
              <div className='flex-1'>
                {LineGraphData ? (
                  <MultipleLineChart chartData={LineGraphData} user1={user1} user2={user2} />
                ) : (
                  <p className="text-center mt-6">Loading line graph data...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>



    </div>
  )
}