"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Submissions } from "@/app/types"

const RecentSubmissions = ({ submissions }: { submissions: Submissions[] }) => {
  return (
    <Card>
        <CardHeader>
          <CardTitle>Recent submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {submissions?.map((submission) => (
              <li
                key={submission.id}
                className="flex justify-between items-center"
              >
                <span>{submission.problem.name}</span>
                <div>
                  <Badge
                    variant={
                      submission.verdict === "OK" ? "default" : "destructive"
                    }
                  >
                    {submission.verdict}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {submission.programmingLanguage}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
  )
}

export default RecentSubmissions