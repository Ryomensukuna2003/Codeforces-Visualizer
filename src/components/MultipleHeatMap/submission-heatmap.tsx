"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmissionLineChart } from "./submission-line-chart"
import { DateRange } from "react-day-picker"

interface SubmissionHeatmapProps {
  data: SubmissionData[]
  id1: string
  id2: string
}

interface SubmissionData {
  date: string
  id1: number
  id2: number
}

export function SubmissionHeatmap({ data, id1, id2 }: SubmissionHeatmapProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 1),
    to: new Date(),
  })

  const filteredData: SubmissionData[] = data?.filter((item) => {
    const itemDate = new Date(item.date)
    return (
      dateRange?.from &&
      dateRange?.to &&
      itemDate >= dateRange.from &&
      itemDate <= dateRange.to
    )
  })

  return (
    <Card className="w-full border-0 border-b">
      <CardHeader>
        <CardTitle>Submission Heatmap</CardTitle>
        <CardDescription>Compare submission counts for two IDs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[400px] w-full">
          <SubmissionLineChart data={filteredData} id1={id1} id2={id2} />
        </div>
      </CardContent>
    </Card>
  )
}
