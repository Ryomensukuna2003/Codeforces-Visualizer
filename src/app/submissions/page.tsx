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
import { useUsername } from "../../components/usernameProvider";
import { ModeToggle } from "../../components/ui/toggle";

interface Submissions {
  verdict: string;
  problem: any;
  contestId: number;
  programmingLanguage: string;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
  id: string;
}

export default function SubmissionsPage() {
  const { username } = useUsername();

  const [allsubmissions, setallSubmissions] = useState<Submissions[] | null>(
    null
  );
  useEffect(() => {
    fetchAPI();
  }, []);

  const fetchAPI = async () => {
    try {
      const allSubmissions = await fetch(
        `https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`
      );
      const SubmissionJson = await allSubmissions.json();

      let AllSubmissions: Submissions[] = [];
      SubmissionJson.result.forEach(
        (element: Submissions
        ) => {
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
        }
      );
      setallSubmissions(AllSubmissions);
    } catch (error) {
      console.log("Fucked up man -> ", error);
    }
  };
  // Mock data - replace with actual API calls
  const submissions = allsubmissions || [];

  return (
    <div className="container mx-auto p-4 space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="flex-1 text-3xl font-bold">Submissions</h1>
        <Link href="/" className="mr-3">
          <Button className="rounded" variant="outline">Back to Dashboard</Button>
        </Link>
        <ModeToggle/>
      </div>

      <Card>
        <CardHeader className="font-2xl">
          <CardTitle>Recent Submissions</CardTitle>
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
                <TableRow>
                  <TableCell>
                    <Link href={`https://codeforces.com/contest/${submission.contestId}/submission/${submission.id}`} target="_blank" rel="noopener noreferrer">
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
                  <TableCell>{(submission.memoryConsumedBytes)/1024} KB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
