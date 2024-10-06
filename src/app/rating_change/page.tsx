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
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Rating {
  contestName: string;
  ratingUpdateTimeSeconds: number;
  rank: number;
  oldRating: number;
  newRating: number;
  id: number;
}

export default function ContestsPage() {
  const [allRating, setAllRating] = useState<Rating[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContests, setTotalContests] = useState(0);
  const contestsPerPage = 100;
  const { username } = useUsername();

  useEffect(() => {
    fetchAPI();
  }, [currentPage]);

  const fetchAPI = async () => {
    const from = (currentPage - 1) * contestsPerPage + 1;
    try {
      // Api handling -------------------------------------------------------
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
          id: element.id,
        };
        ratingArr.push(obj1);
      });
      // Api handling -------------------------------------------------------

      setAllRating(ratingArr.slice(from - 1, from - 1 + contestsPerPage));
      setTotalContests(ratingArr.length);
    } catch (error) {
      console.log("Fucked Up -> ",error)
    }
  };

  const contests = allRating || [];

  const totalPages = Math.ceil(totalContests / contestsPerPage);

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  return (
    <div className="container mx-auto p-4 space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl flex-1 font-bold">Contests</h1>
        <Link className="mr-3" href="/">
          <Button className="rounded" variant="outline">
            Back to Dashboard
          </Button>
        </Link>
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="font-2xl">
          <CardTitle>Contest History [{totalContests}]</CardTitle>
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
                <TableRow key={contest.id}>
                  <TableCell>
                    <Link href={`https://codeforces.com/contest/${contest.id}`}>
                      {contest.contestName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(
                      contest.ratingUpdateTimeSeconds * 1000
                    ).toLocaleDateString()}
                  </TableCell>
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
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
