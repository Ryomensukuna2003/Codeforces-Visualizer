"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface DataPoint {
  question_rating: number;
  Questions: number;
}

interface ChartLineBarProps {
  data: DataPoint[];
}

export function ChartLineBar({data}:ChartLineBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Problems Rating</CardTitle>
        <CardDescription>Rating of various problems.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="question_rating"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="Questions" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={20}
                className="p-5 fill-foreground "
                fontSize={12}
                angle={270}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing the total number of questions for each rating. <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
        </div>
      </CardFooter>
    </Card>
  )
}
