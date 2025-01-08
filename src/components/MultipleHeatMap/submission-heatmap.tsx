"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmissionLineChart } from "./submission-line-chart"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react'
import { format, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(1950, 0, 1),
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

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: new Date(value)
    }))
  }

  return (
    <Card className="w-full border-0 border-b">
      <CardHeader>
        <CardTitle>Submission Heatmap</CardTitle>
        <CardDescription>Compare submission counts for two IDs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-end space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="from">From</Label>
                    <Input
                      id="from"
                      type="date"
                      value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => handleDateChange('from', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="to">To</Label>
                    <Input
                      id="to"
                      type="date"
                      value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => handleDateChange('to', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="h-[400px] w-full">
          <SubmissionLineChart data={filteredData} id1={id1} id2={id2} />
        </div>
      </CardContent>
    </Card>
  )
}

