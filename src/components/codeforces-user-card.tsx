'use client'

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Users, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { CodeforcesUserCardProps } from "@/app/types";


export function CodeforcesUserCard({
  AboutUser,
  problemStats,
}: CodeforcesUserCardProps) {
  const getRankColor = (rank: string) => {
    const rankColors: { [key: string]: string } = {
      newbie: "bg-gray-500",
      pupil: "bg-green-500",
      specialist: "bg-cyan-500",
      expert: "bg-blue-500",
      "candidate master": "bg-purple-500",
      master: "bg-orange-500",
      "international master": "bg-orange-600",
      grandmaster: "bg-red-500",
      "international grandmaster": "bg-red-600",
      "legendary grandmaster": "bg-red-700",
    };
    return rankColors[rank.toLowerCase()] || "bg-gray-500";
  };

  return (
    <Card className="overflow-hidden max-w-md mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-24 w-24 ring-4 ring-white">
            <AvatarImage src={AboutUser.avatar} alt={AboutUser.handle} />
            <AvatarFallback className="text-2xl font-bold">{AboutUser.handle[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-white mb-1">{AboutUser.handle}</h2>
            <Badge variant="secondary" className={`text-xs px-2 py-1 ${getRankColor(AboutUser.rank || '')}`}>
              {AboutUser.rank}
            </Badge>
            <p className="text-white text-sm mt-2">
              Rating: <span className="font-semibold">{AboutUser.rating}</span>
              <span className="text-xs ml-1">(max: {AboutUser.maxRating})</span>
            </p>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm">
              Contribution: <span className="font-semibold">{AboutUser.contribution}</span>
            </span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm">
              Friend of: <span className="font-semibold">{AboutUser.friendOfCount}</span>
            </span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <FileText className="w-6 h-6 mx-auto text-gray-400 mb-1" />
            <p className="text-lg font-semibold">{problemStats.total}</p>
            <p className="text-xs text-gray-500">Total Submissions</p>
          </div>
          <div>
            <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-semibold">{problemStats.solved}</p>
            <p className="text-xs text-gray-500">Solved</p>
          </div>
          <div>
            <AlertCircle className="w-6 h-6 mx-auto text-orange-500 mb-1" />
            <p className="text-lg font-semibold">{problemStats.attempted}</p>
            <p className="text-xs text-gray-500">Attempted</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}