"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Submissions } from "@/app/types"

const RecentSubmissions = ({ submissions }: { submissions: Submissions[] }) => {
  return (
    <Card className="w-full max-w-full border-0 border-y px-6">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Recent Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {submissions?.length > 0 ? (
            submissions.map((submission) => (
              <li
                key={submission.id}
                className="flex flex-col sm:flex-row justify-between items-center 
                       p-2 bg-muted/50 sm:bg-transparent rounded-md transition-colors 
                       space-y-1 sm:space-y-0"
              >
                <span className="text-sm md:text-base truncate max-w-full">
                  {submission.problem.name}
                </span>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      submission.verdict === "OK" ? "default" : "destructive"
                    }
                    className="text-xs md:text-sm"
                  >
                    {submission.verdict}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs font-thin  md:text-sm "
                  >
                    {submission.programmingLanguage}
                  </Badge>
                </div>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground text-center py-4">
              No recent submissions
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

export default RecentSubmissions