"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsername } from "../../components/usernameProvider";
import { useEffect, useState } from "react";
import { ModeToggle } from "../../components/ui/toggle";


interface Rating {
  contestName: string;
  ratingUpdateTimeSeconds: number;
  rank: number;
  oldRating: number;
  newRating: number;
  id:number;
}

export default function ContestsPage() {
  const [allRating, useAllRating] = useState<Rating[] | null>(null);
  useEffect(() => {
    fetchAPI();
  }, []);
  const { username } = useUsername();
  const fetchAPI = async () => {
    const rating = await fetch(
      `https://codeforces.com/api/user.rating?handle=${username}`
    );
    const ratingJson = await rating.json();
    let ratingArr: Rating[] = [];
    ratingJson.result.forEach((element: Rating) => {
      let obj1 = {
        contestName: element.contestName,
        ratingUpdateTimeSeconds: element.ratingUpdateTimeSeconds,
        rank: element.rank,
        oldRating: element.oldRating,
        newRating: element.newRating,
        id:element.id
      };
      ratingArr.push(obj1);
    });
    useAllRating(ratingArr);
  };

  const contests = allRating || [];

  return (
    <div className="container mx-auto p-4 space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl flex-1 font-bold">Contests</h1>
        <Link className="mr-3" href="/">
          <Button className="rounded" variant="outline">Back to Dashboard</Button>
        </Link>
        <ModeToggle/>
      </div>

      <Card>
        <CardHeader className="font-2xl">
          <CardTitle>Contest History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-xl">
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Rating Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contests.map((contest) => (
                <TableRow>
                  <TableCell><Link href={`https://codeforces.com/contest/${contest.id}`}>{contest.contestName}</Link></TableCell>
                    <TableCell>{new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString()}</TableCell>
                  <TableCell>{contest.rank}</TableCell>
                  <TableCell>
                    <Badge
                    className="py-1"
                      variant={
                        contest.newRating - contest.oldRating > 0
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {contest.newRating - contest.oldRating > 0 ? "+" : ""}
                      {contest.newRating - contest.oldRating}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
