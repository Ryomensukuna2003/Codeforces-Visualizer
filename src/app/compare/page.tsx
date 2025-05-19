"use client";
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRightLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

import { NavBar } from '@/components/ui/NavBar';
import { FetchUserData, CompareRatingFrequencies, CompareHeatMapData, CompareRatingChange } from '@/lib/utils';
import { ParseData } from '@/lib/ParseData';
import { MultipleBarChart } from '@/components/MulitpleBarChart';
import { MultipleLineChart } from '@/components/MultipleLineChart';
import { SubmissionHeatmap } from '@/components/MultipleHeatMap/submission-heatmap';



export default function EnhancedUserComparison() {
  const { toast } = useToast()

  const [user1, setUser1] = useState<string>("");
  const [user2, setUser2] = useState<string>("");

  const [UserData1, setUserData1] = useState<any | null>(null);
  const [UserData2, setUserData2] = useState<any | null>(null);
  const [BarGraphData, setBarGraphData] = useState<any | null>(null);
  const [HeatMapData, setHeatMapData] = useState<any | null>(null);
  const [LineGraphData, setLineGraphData] = useState<any | null>(null);
  const [isfetching, setisfetching] = useState<boolean>(false);
  const [isfetched, setisfetched] = useState<boolean>(false);

  const compareUsers = async () => {
    setUserData1(null);
    setUserData2(null);
    setBarGraphData(null);
    setHeatMapData(null);
    setLineGraphData(null);
    setisfetched(false);

    if (user1 === "" || user2 === "") {
      toast({
        variant: "destructive",
        title: "Set both users",
        description: "Please provide both usernames for comparison.",
      })
    }
    else if (user1 === user2) {
      toast({
        variant: "default",
        title: "Testing eh... 😏",
        description: "Usernames are same, please provide different usernames.",
      });
    }
    else {
      setisfetching(true);
      // Fetch from API
      const { userInfoData: userInfoData1, allSubmissionsData: allSubmissionsData1, allRating: allRating1 } = await FetchUserData(user1);
      const { userInfoData: userInfoData2, allSubmissionsData: allSubmissionsData2, allRating: allRating2 } = await FetchUserData(user2);

      // Check for errors
      if (userInfoData1.status === 'failed' || userInfoData2.status === 'failed') {
        toast({
          variant: "destructive",
          title: userInfoData1.status === 'failed' ? userInfoData1.message : userInfoData2.message,
          description: "Please check the spelling of the usernames.",
        })
        setisfetching(false);
        return;
      }

      // Extract Info from Raw API data
      setUserData1(ParseData(userInfoData1, allSubmissionsData1, allRating1, user1));
      setUserData2(ParseData(userInfoData2, allSubmissionsData2, allRating2, user2));

      setisfetching(false);
      setisfetched(true);
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
    <div className="bg-black">
      <NavBar />

      {/* Content Starts Here */}
      <div className="flex-row h-screen bg-card w-full">

        <div className='flex-col w-full h-46'>
          {/* 1st div */}
          <div className='grid grid-cols-3 border-b border-neutral-600 justify-center items-center'>
            <h1 className="text-center text-3xl justify-content-center p-6 border-r border-neutral-600">
              Compare ID's
            </h1>
          </div>
          {/* 2nd div */}
          <div className='flex text-center text-3xl justify-content-center border-b border-neutral-600 border-r'>
            <div className="flex-1 text-center text-3xl justify-content-center  border-r border-neutral-600">
              <Input
                id="user1"
                placeholder="First Username"
                value={user1}
                onChange={(e) => setUser1(e.target.value)}
                className="bg-card text-foreground w-full h-full text-center hover:border-card"
              />
            </div>
            <div className='flex justify-center items-center h-20 w-20'>
              <ArrowRightLeft className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center text-3xl justify-content-center border-l border-neutral-600">
              <Input
                id="user2"
                placeholder="Second Username"
                value={user2}
                onChange={(e) => setUser2(e.target.value)}
                className="bg-card text-foreground w-full h-full text-center hover:border-b-4"
              />
            </div>
          </div>
          {/* 3rd div */}
          <div className='grid grid-cols-3 justify-center items-center border-b border-neutral-600'>
            <div className='col-start-3 text-center text-3xl justify-content-center border-r border-b border-neutral-600 '>
              {isfetching ? (
                <Button disabled className=' text-center text-3xl p-6 w-full h-full'>Fetching...</Button>
              ) : (
                <Button onClick={compareUsers} className=' text-center text-3xl p-6  w-full h-full'>Compare</Button>
              )}
            </div>
          </div>
        </div>

        {isfetched && (
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
                        <CardTitle className="text-2xl" style={{ color: 'var(--text-color-light)' }}>{user?.handle}</CardTitle>
                        <CardDescription className={`text-lg font-semibold`} style={{ color: getRankColor(user?.rank || "") }}>
                          {user?.rank}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold" style={{ color: 'var(--text-color-light)' }}>{user?.rating}</div>
                        <div className="text-sm" style={{ color: 'var(--text-color-light)' }}>Current Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold" style={{ color: 'var(--text-color-light)' }}>{user?.maxRating}</div>
                        <div className="text-sm" style={{ color: 'var(--text-color-light)' }}>Max Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold" style={{ color: 'var(--text-color-light)' }}>{user?.problemSolved}</div>
                        <div className="text-sm" style={{ color: 'var(--text-color-light)' }}>Problems Solved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold" style={{ color: 'var(--text-color-light)' }}>{user?.contestsParticipated}</div>
                        <div className="text-sm" style={{ color: 'var(--text-color-light)' }}>Contests</div>
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
                  <p className="text-center mt-6" style={{ color: 'var(--text-color-light)' }}>Loading chart data...</p>
                )}
              </div>
              <div className='flex-1'>
                {LineGraphData ? (
                  <MultipleLineChart chartData={LineGraphData} user1={user1} user2={user2} />
                ) : (
                  <p className="text-center mt-6" style={{ color: 'var(--text-color-light)' }}>Loading line graph data...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}