import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Code2, Trophy, Users, Search, BellRing, Settings } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  contribution?: number;
  friendOfCount?: number;
  avatar?: string;
}

interface ProblemStats {
  total: number;
  solved: number;
  attempted: number;
}

interface CodeforcesUserCardProps {
  userInfo: UserInfo;
  problemStats: ProblemStats;
}
const SleepingCatStyles = `
  @keyframes sleepingCat {
    0%, 50% { background-position: -64px 0; }
    50%, 100% { background-position: -64px -32px; }
  }
`;

export function CodeforcesUserCard({
  userInfo,
  problemStats,
}: CodeforcesUserCardProps) {
  const getRankColor = (rank: string) => {
    const rankColors: { [key: string]: string } = {
      newbie: "#808080",
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
      <style>{SleepingCatStyles}</style>
      <Card className="border-0 px-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={userInfo.avatar}
                alt={userInfo.handle}
                className="object-cover h-full w-full"
              />
              <AvatarFallback>{userInfo.handle[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-2xl sm:text-4xl">
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: getRankColor(userInfo.rank || "") }}
              >
                {userInfo.handle}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Rating: {userInfo.rating} [max: {userInfo.maxRating}]
              </p>
              <Badge
                variant="secondary"
                className="text-xs px-2 py-1 text-white"
                style={{ backgroundColor: getRankColor(userInfo.rank || "") }}
              >
                {userInfo.rank}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 ">
            <Card className="border-x-0 border-y-0 border-l-4 bg-muted/20 rounded-r-lg rounded-l-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{problemStats.total}</div>
              </CardContent>
            </Card>
            <Card className="border-x-0 border-y-0 border-l-4 bg-muted/20 rounded-r-lg rounded-l-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solved Problems</CardTitle>
                <Code2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{problemStats.solved}</div>
              </CardContent>
            </Card>
            <Card className="border-x-0 border-y-0 border-l-4 bg-muted/20 rounded-r-lg rounded-l-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contribution</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{userInfo.contribution}</div>
              </CardContent>
            </Card>
            <Card className="border-x-0 border-y-0 border-l-4 bg-muted/20 rounded-r-lg rounded-l-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Friends</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{userInfo.friendOfCount}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card >
    </div >
  );
}
