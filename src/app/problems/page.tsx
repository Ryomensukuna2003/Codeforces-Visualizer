"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store
import { Checkbox } from "@/components/ui/checkbox";
import { ModeToggle } from "../../components/ui/toggle";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Problem, ProblemStatistics, CombinedData } from '../types'


export default function ProblemsPage() {
  const [problems, setProblems] = useState<CombinedData[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<CombinedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRating, setInitialFilter] = useState(800);
  const [endingFilter, setEndingFilter] = useState(3200);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { username, Attempted } = useUsernameStore() as {
    username: string;
    Attempted: string[];
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedProblems, setDisplayedProblems] = useState<Problem[]>([]);
  const contestsPerPage = 100;

  useEffect(() => {
    fetchProblems();
  }, [username]);

  const fetchProblems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://codeforces.com/api/problemset.problems"
      );
      const data = await response.json();
      if (data.status === "OK") {
        const combinedArray: CombinedData[] = [];
        data.result.problems.forEach((problem: Problem) => {
          const stats = data.result.problemStatistics.find(
            (stat: ProblemStatistics) =>
              stat.contestId === problem.contestId &&
              stat.index === problem.index
          );

          if (stats) {
            combinedArray.push({
              contestId: problem.contestId,
              index: problem.index,
              name: problem.name,
              type: problem.type,
              rating: problem.rating,
              tags: problem.tags,
              solvedCount: stats.solvedCount,
            });
          }
        });
        setProblems(combinedArray);
        const filtered = data.result.problems.filter(
          (problem: Problem) =>
            problem.rating >= initialRating && problem.rating <= endingFilter
        );
        setFilteredProblems(filtered);
        updateDisplayedProblems(filtered, 1);
      } else {
        throw new Error("Failed to fetch problems");
      }
    } catch (err) {
      setError(
        "An error occurred while fetching problems. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateDisplayedProblems = (problems: Problem[], page: number) => {
    const from = (page - 1) * contestsPerPage;
    const to = from + contestsPerPage;
    setDisplayedProblems(problems.slice(from, to));
  };

  useEffect(() => {
    updateDisplayedProblems(filteredProblems, currentPage);
  }, [currentPage, filteredProblems]);

  const filterQuestions = () => {
    const filtered = problems.filter(
      (problem) =>
        problem.rating >= initialRating && problem.rating <= endingFilter
    );
    setFilteredProblems(filtered);
    setCurrentPage(1);
    updateDisplayedProblems(filtered, 1);
  };

  const handleSort = () => {
    const sorted = [...filteredProblems].sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.solvedCount || 0) - (b.solvedCount || 0);
      } else {
        return (b.solvedCount || 0) - (a.solvedCount || 0);
      }
    });
    setFilteredProblems(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    updateDisplayedProblems(sorted, currentPage);
  };
  const totalPages = Math.ceil(filteredProblems.length / contestsPerPage);

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  return (
    <div className="container mx-auto p-4 space-y-6 ">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-6 pt-4 flex gap-2 ">
        <h1 className="text-3xl flex-1 font-bold">Codeforces Problem</h1>
        <Link className="mr-3" href="/">
          <Button className="rounded" variant="outline">
            Back to Dashboard
          </Button>
        </Link>
        <ModeToggle />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Problem List</span>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Filter by rating"
                value={initialRating}
                onChange={(e) => setInitialFilter(Number(e.target.value))}
                className="w-40"
              />
              <p className="text-base"> to </p>
              <Input
                type="text"
                placeholder="Filter by rating"
                value={endingFilter}
                onChange={(e) => setEndingFilter(Number(e.target.value))}
                className="w-40"
              />
              <Button onClick={filterQuestions}>Filter</Button>
              <Button onClick={handleSort}>
                Sort by Difficulty{" "}
                {sortOrder === "asc" ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center">Loading problems...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Solved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedProblems.map((problem) => (
                  <TableRow
                    key={`${problem.contestId}${problem.index}`}
                    className={
                      Attempted.includes(`${problem.name}|${problem.rating}`)
                        ? "bg-secondary "
                        : ""
                    }
                  >
                    <TableCell className="pl-5">
                      <Link
                        href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {problem.name}
                      </Link>
                    </TableCell>
                    <TableCell>{problem.rating || "Unrated"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={Attempted.includes(
                          `${problem.name}|${problem.rating}`
                        )}
                      // onCheckedChange={field.onChange}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
