import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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

export function CodeforcesUserCard({
  userInfo,
  problemStats,
}: CodeforcesUserCardProps) {
  const getRankColor = (rank: string) => {
    const rankColors: { [key: string]: string } = {
      newbie: '#808080',
      pupil: "#008000",
      specialist: "#04A89E",
      expert: '#0000FF',
      "candidate master": "#AB00AA",
      master: "#FF8C00",
      "international master": "#FF8C00",
      grandmaster: "#FF0000",
      "international grandmaster": "#FF0000",
      "legendary grandmaster": "#FF0000",
    };
    return rankColors[rank.toLowerCase()] || "#808080";
  };

  return (
    <Card className="shadow-sm rounded-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
            <Avatar className="h-32 w-32">
            <AvatarImage 
              src={userInfo.avatar} 
              alt={userInfo.handle} 
              className="object-cover h-full w-full" 
            />
            <AvatarFallback>{userInfo.handle[0]}</AvatarFallback>
            </Avatar>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: getRankColor(userInfo.rank || '') }}>{userInfo.handle}</h2>
              <Badge
                variant="secondary"
                className="text-xs px-2 py-1 text-white"
                
                style={{ backgroundColor: getRankColor(userInfo.rank || '') }}
              >
                {userInfo.rank}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Rating: {userInfo.rating} (max: {userInfo.maxRating})
            </p>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-2 gap-x-4 text-sm">
          <div>
            <p className="font-semibold">
              Contribution:{" "}
              <span className="font-normal">{userInfo.contribution}</span>
            </p>
            <p className="font-semibold">
              Friend of:{" "}
              <span className="font-normal">{userInfo.friendOfCount}</span>
            </p>
          </div>
          <div>
            <p className="font-semibold">
              Total Submissions:{" "}
              <span className="font-normal">{problemStats.total}</span>
            </p>
            <p className="font-semibold">
              Solved: <span className="font-normal">{problemStats.solved}</span>
            </p>
            <p className="font-semibold">
              Attempted:{" "}
              <span className="font-normal">{problemStats.attempted}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
