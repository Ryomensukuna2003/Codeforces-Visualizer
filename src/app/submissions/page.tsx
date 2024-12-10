"use client";
import Link from "next/link";
import axios from "axios";
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
import { useEffect, useState } from "react";
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store

import { ModeToggle } from "../../components/ui/toggle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SubmissionsType } from '../types'


export default function SubmissionsPage() {
  const { username } = useUsernameStore() as {
    username: string;
  };
  const [allsubmissions, setallSubmissions] = useState<SubmissionsType[] | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [finalPage, setFinalPage] = useState(false);
  useEffect(() => {
    fetchAPI();
  }, [currentPage]);

  const fetchAPI = async () => {
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.status?handle=${username}&from=${currentPage}&count=${100}`
      );
      const SubmissionJson = response.data;
      if (SubmissionJson.result.length < 100) setFinalPage(true);
      let AllSubmissions: SubmissionsType[] = [];
      SubmissionJson.result?.forEach((element: SubmissionsType) => {
        let obj1 = {
          verdict: element.verdict,
          problem: element.problem.name,
          programmingLanguage: element.programmingLanguage,
          timeConsumedMillis: element.timeConsumedMillis,
          memoryConsumedBytes: element.memoryConsumedBytes,
          contestId: element.contestId,
          id: element.id,
        };
        AllSubmissions.push(obj1);
      });
      setallSubmissions(AllSubmissions);
    } catch (error) {
      console.log("Fucked up man -> ", error);
    }
  };
  // Mock data - replace with actual API calls
  const submissions = allsubmissions || [];

  const goToNextPage = () => {
    setCurrentPage(currentPage + 100);
  };

  const goToPreviousPage = () => {
    setCurrentPage(currentPage - 99);
  };

  return (
    <div className="container mx-auto p-4 space-y-6 ">
     <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-6 pt-4 flex gap-2 ">
        <h1 className="text-3xl flex-1 font-bold">Submissions</h1>
        <Link className="mr-3" href="/">
          <Button className="rounded" variant="outline">
            Back to Dashboard
          </Button>
        </Link>
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="font-2xl">
          <CardTitle>Recent Submissions </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-xl">
                <TableHead>Problem</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Memory</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <Link
                      href={`https://codeforces.com/contest/${submission.contestId}/submission/${submission.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {submission.problem}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="py-1"
                      variant={
                        submission.verdict === "OK" ? "default" : "destructive"
                      }
                    >
                      {submission.verdict === "OK"
                        ? "Accepted"
                        : submission.verdict}
                    </Badge>
                  </TableCell>
                  <TableCell>{submission.programmingLanguage}</TableCell>
                  <TableCell>{submission.timeConsumedMillis} ms</TableCell>
                  <TableCell>
                    {(submission.memoryConsumedBytes / 1024).toFixed(2)} KB
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
            <span>Page {currentPage}</span>
            <Button
              onClick={goToNextPage}
              disabled={finalPage}
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
