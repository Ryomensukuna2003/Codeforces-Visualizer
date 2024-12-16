"use client"
import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "hsl(var(--chart-1))",
  }
} satisfies ChartConfig

interface HeatMapGraphProps {
  data: { date: string; desktop: number }[];
}

export function HeatMapGraph({ data }: HeatMapGraphProps) {
  const [timeRange, setTimeRange] = React.useState("ALL")

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date()
    let startDate = new Date(0)
    switch (timeRange) {
      case "90d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "30d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "7d":
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "2024":
        startDate = new Date("2024-01-01");
        break;
      case "2023":
        startDate = new Date("2023-01-01");
        break;
    }

    return data
      .filter((item) => {
        const x = new Date(item.date)
        return x >= startDate
      }).reverse();
  }, [data, timeRange])

  const total = React.useMemo(
    () => filteredData.reduce((acc, curr) => acc + curr.desktop, 0),
    [filteredData]
  )

  const max_submissions = React.useMemo(
    () => filteredData.reduce((acc, curr) => Math.max(acc, curr.desktop), 0),
    [filteredData]
  )


  return (
    <Card className="border-0 py-6">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 ">
          <CardTitle>Submissions Heatmap</CardTitle>
          <CardDescription>
            Total submissions for the selected time range
          </CardDescription>
        </div>
        <div className="relative z-30 flex flex-col justify-center gap-1 border-t  px-6 py-4 text-left bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
          <span className="text-sm text-muted-foreground">Total Submissions</span>
          <span className="text-lg font-bold">{total.toLocaleString()}</span>
        </div>
        <div className="relative z-30 flex flex-col justify-center gap-1  border-t px-6 py-4 text-left bg-muted/50 border-r sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
          <span className="text-sm text-muted-foreground">Max Submissions</span>
          <span className="text-lg font-bold">{max_submissions.toLocaleString()}</span>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
      <Select value={timeRange} onValueChange={setTimeRange}>
        <div className="flex justify-center mt-2">
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto mb-4 justify-center"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Select Time Range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="rounded-lg">
              All Time
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="2024" className="rounded-lg">
              Year 2024
            </SelectItem>
            <SelectItem value="2023" className="rounded-lg">
              Year 2023
            </SelectItem>
          </SelectContent>
          </div>
        </Select>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full overflow-x-auto"
        >
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              className="font-bold"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
                }}
              />
              {window.innerWidth > 768 && (
                <YAxis dataKey="desktop" className="font-bold" />
              )}
              <ChartTooltip
                content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="submissions"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke={chartConfig.submissions.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}