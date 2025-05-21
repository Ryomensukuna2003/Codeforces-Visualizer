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
import { useEffect, useState } from "react";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { useStore } from "@/components/Providers/fetchAPI";

import { ModeToggle } from "../../components/ui/toggle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SubmissionsType } from "@/types/problems";
import NavBar_sm from "@/components/ui/NavBar-sm";

export default function SubmissionsPage() {
  const { username } = useUsernameStore() as {
    username: string;
  };
  const { allSubmissionsData } = useStore() as any;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Get the current page's submissions
  const getCurrentPageSubmissions = () => {
    if (
      !allSubmissionsData ||
      !allSubmissionsData.result ||
      !Array.isArray(allSubmissionsData.result)
    ) {
      return [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allSubmissionsData.result.slice(startIndex, endIndex);
  };

  const submissions = getCurrentPageSubmissions();
  const totalSubmissions = allSubmissionsData?.result?.length || 0;
  const finalPage =
    !allSubmissionsData || currentPage * itemsPerPage >= totalSubmissions;

  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container mx-auto">
      <NavBar_sm Title="Submissions" />
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
              {submissions.map((submission: any) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <Link
                      href={`https://codeforces.com/contest/${submission.problem.contestId}/submission/${submission.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {submission.problem.name}
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
                        ? "ACCEPTED"
                        : submission.verdict}
                    </Badge>
                  </TableCell>
                  <TableCell>{submission.programmingLanguage}</TableCell>
                  <TableCell>
                    {submission.timeConsumedMillis || "—"} ms
                  </TableCell>
                  <TableCell>
                    {submission.memoryConsumedBytes
                      ? (submission.memoryConsumedBytes / 1024).toFixed(2) +
                        " KB"
                      : "—"}
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
