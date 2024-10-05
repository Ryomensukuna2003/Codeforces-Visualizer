'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function Page() {
  // Mock data - replace with actual API calls
  const submissions = [
    { id: 1, problem: 'Two Sum', verdict: 'Accepted', language: 'C++', time: '100 ms', memory: '4 KB' },
    { id: 2, problem: 'Reverse Integer', verdict: 'Wrong Answer', language: 'Python', time: '150 ms', memory: '8 KB' },
    { id: 3, problem: 'Palindrome Number', verdict: 'Time Limit Exceeded', language: 'Java', time: '2000 ms', memory: '16 KB' },
    { id: 4, problem: 'Roman to Integer', verdict: 'Accepted', language: 'JavaScript', time: '80 ms', memory: '6 KB' },
    { id: 5, problem: 'Longest Common Prefix', verdict: 'Runtime Error', language: 'C#', time: '120 ms', memory: '12 KB' },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Submissions</h1>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell>{submission.problem}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={submission.verdict === 'Accepted' ? 'success' : 'destructive'}
                    >
                      {submission.verdict}
                    </Badge>
                  </TableCell>
                  <TableCell>{submission.language}</TableCell>
                  <TableCell>{submission.time}</TableCell>
                  <TableCell>{submission.memory}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}