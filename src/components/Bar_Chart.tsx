"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProblemRatingDistribution } from "@/types/problems";

const chartConfig = {
  desktop: {
    label: "Problems",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

interface ChartLineBarProps {
  data: ProblemRatingDistribution[];
}

export function ChartLineBar({ data }: ChartLineBarProps) {
  const max_Submissions = data.reduce(
    (max, p) => (p.count > max ? p.count : max),
    data[0]?.count
  );

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Problems Rating</CardTitle>
        <CardDescription>Rating distribution of solved problems.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={data}
            margin={{
              top: 20,
            }}
          >
            <defs>
              <linearGradient id="fillProblems" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--foreground))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--foreground))"
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rating"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis domain={[0, Math.ceil(max_Submissions / 50) * 50]} />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Area
              dataKey="count"
              type="monotone"
              fill="url(#fillProblems)"
              stroke="var(--color-desktop)"
              strokeWidth={1}
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--color-desktop)",
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing the total number of questions for each rating.{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground"></div>
      </CardFooter>
    </Card>
  );
}
